/**
 * Checks that every docs page shows each example's source verbatim.
 *
 * A page renders an example as an island inside `<Demo>` and repeats its
 * source in the fenced `vue` block right after `</Demo>`. The fence is what
 * reaches agents (`index.md`, `llms-full.txt` strip every component), so a
 * fence that drifts from its example file documents code that does not
 * exist.
 *
 *   bun scripts/check-demo-fences.ts         report, exit 1 on any error
 *   bun scripts/check-demo-fences.ts --fix   rewrite drifted fences
 *
 * `--fix` only rewrites fence bodies from example files. It never adds a
 * demo, a fence or a page.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { componentSlug, readRegistryItems } from '../src/lib/registry-sidebar'

const appDir = path.resolve(import.meta.dirname, '..')
const repoDir = path.resolve(appDir, '../..')
const docsDir = path.join(appDir, 'src/content/docs')
const pagesDir = path.join(docsDir, 'components')
const componentsDir = path.join(repoDir, 'packages/vue/src/components/ui')
const fix = process.argv.includes('--fix')

const IMPORT = /^import\s+(\w+)\s+from\s+["']([^"']+)["'];?\s*$/
const FENCE = /^(`{3,})(\S*)/
const TAG = /<([A-Z]\w*)(\s[^>]*)?\/?>/g

let errors = 0
let warnings = 0

function report(level: 'error' | 'warn', file: string, line: number, message: string) {
  if (level === 'error')
    errors++
  else
    warnings++

  console.log(`[${level}] ${path.relative(repoDir, file)}:${line} — ${message}`)
}

/** Maps `packages.vue/…` to a file path through the package's `./*` export. */
function workspacePackages() {
  const map = new Map<string, string>()

  for (const group of ['packages', 'apps']) {
    const groupDir = path.join(repoDir, group)
    if (!existsSync(groupDir))
      continue

    for (const entry of readdirSync(groupDir)) {
      const manifest = path.join(groupDir, entry, 'package.json')
      if (!existsSync(manifest))
        continue

      const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
      const target = pkg.exports?.['./*']
      if (typeof target === 'string')
        map.set(pkg.name, path.join(groupDir, entry, target.replace('*', '')))
    }
  }

  return map
}

const packages = workspacePackages()

function resolveSpecifier(specifier: string) {
  const [name, ...rest] = specifier.split('/')
  const base = packages.get(name)

  return base ? path.join(base, rest.join('/')) : undefined
}

function stripTrailingNewlines(text: string) {
  return text.replace(/\n+$/, '')
}

function diff(expected: string[], actual: string[]) {
  const out: string[] = []
  const length = Math.max(expected.length, actual.length)

  for (let i = 0; i < length && out.length < 8; i++) {
    if (expected[i] === actual[i])
      continue
    if (actual[i] !== undefined)
      out.push(`      - ${actual[i]}`)
    if (expected[i] !== undefined)
      out.push(`      + ${expected[i]}`)
  }

  return out.join('\n')
}

function checkPage(file: string, documented: Set<string>) {
  const lines = readFileSync(file, 'utf8').split('\n')
  const examples = new Map<string, { path: string, line: number }>()
  const rendered = new Set<string>()
  let changed = false

  // Mark which lines sit inside a fence, so `<Demo>` or `import` written
  // inside a code sample is never mistaken for the real thing.
  const inFence: boolean[] = []
  let open: string | undefined
  for (const line of lines) {
    const match = line.match(FENCE)
    if (!open && match) {
      inFence.push(true)
      open = match[1]
    }
    else if (open && line.trimEnd() === open) {
      inFence.push(true)
      open = undefined
    }
    else {
      inFence.push(Boolean(open))
    }
  }

  lines.forEach((line, i) => {
    const match = !inFence[i] && line.match(IMPORT)
    if (!match)
      return

    const [, local, specifier] = match
    if (specifier.includes('?raw')) {
      report('error', file, i + 1, `\`?raw\` import (${specifier}). The fence after <Demo> carries the source.`)

      return
    }
    if (!specifier.includes('/examples/') || !specifier.endsWith('.vue'))
      return

    const resolved = resolveSpecifier(specifier)
    if (!resolved || !existsSync(resolved)) {
      report('error', file, i + 1, `cannot resolve ${specifier}`)

      return
    }
    examples.set(local, { path: resolved, line: i + 1 })
  })

  for (let i = 0; i < lines.length; i++) {
    if (inFence[i] || !/^<Demo[\s>]/.test(lines[i]))
      continue

    const start = i
    while (i < lines.length && !lines[i].includes('</Demo>'))
      i++
    if (i >= lines.length) {
      report('error', file, start + 1, '<Demo> is never closed')
      break
    }

    const block = lines.slice(start, i + 1).join('\n')
    const islands = [...block.matchAll(TAG)].filter(([, name]) => name !== 'Demo')
    if (islands.length !== 1) {
      report('error', file, start + 1, `<Demo> must wrap exactly one example island, found ${islands.length}`)
      continue
    }

    const [, name, attrs = ''] = islands[0]
    const example = examples.get(name)
    if (!example) {
      report('error', file, start + 1, `<${name}> is not an imported example (import it from …/examples/${name}.vue)`)
      continue
    }
    rendered.add(name)
    documented.add(example.path)

    if (!/\bclient:\w+/.test(attrs))
      report('error', file, start + 1, `<${name}> has no client:* directive, so it renders static`)

    let fenceStart = i + 1
    while (fenceStart < lines.length && lines[fenceStart].trim() === '')
      fenceStart++

    const opener = lines[fenceStart]?.match(FENCE)
    if (!opener || opener[2] !== 'vue') {
      report('error', file, fenceStart + 1, `<${name}> must be followed by a top-level \`\`\`vue fence with its source`)
      continue
    }

    let fenceEnd = fenceStart + 1
    while (fenceEnd < lines.length && lines[fenceEnd].trimEnd() !== opener[1])
      fenceEnd++

    const expected = stripTrailingNewlines(readFileSync(example.path, 'utf8')).split('\n')
    const actual = lines.slice(fenceStart + 1, fenceEnd)

    if (expected.join('\n') !== actual.join('\n')) {
      if (fix) {
        lines.splice(fenceStart + 1, actual.length, ...expected)
        inFence.splice(fenceStart + 1, actual.length, ...expected.map(() => true))
        changed = true
        console.log(`[fixed] ${path.relative(repoDir, file)}:${fenceStart + 1} — ${name} fence resynced from its example`)
      }
      else {
        report('error', file, fenceStart + 1, `${name} fence differs from ${path.relative(repoDir, example.path)} (run with --fix to resync)\n${diff(expected, actual)}`)
      }
    }

    i = fenceEnd
  }

  for (const [name, { line }] of examples) {
    if (!rendered.has(name))
      report('error', file, line, `${name} is imported but never rendered in a <Demo>`)
  }

  if (changed)
    writeFileSync(file, lines.join('\n'))
}

const documented = new Set<string>()
const pages = existsSync(docsDir)
  ? readdirSync(docsDir, { recursive: true, encoding: 'utf8' })
      .filter(entry => entry.endsWith('.mdx'))
  : []

for (const page of pages)
  checkPage(path.join(docsDir, page), documented)

for (const [dir, item] of await readRegistryItems(componentsDir)) {
  if (!item.categories?.length)
    continue

  const page = path.join(pagesDir, `${componentSlug(item)}.mdx`)
  if (!existsSync(page)) {
    report('warn', page, 1, `${item.name} has categories but no docs page`)
    continue
  }

  const examplesDir = path.join(componentsDir, dir, 'examples')
  if (!existsSync(examplesDir))
    continue

  for (const entry of readdirSync(examplesDir).filter(e => e.endsWith('.vue'))) {
    if (!documented.has(path.join(examplesDir, entry)))
      report('warn', page, 1, `examples/${entry} has no demo on this page`)
  }
}

console.log(`check-demo-fences: ${pages.length} page(s), ${errors} error(s), ${warnings} warning(s).`)
process.exit(errors ? 1 : 0)
