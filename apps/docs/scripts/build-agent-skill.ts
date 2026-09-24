/**
 * Builds the consumer agent skill, `skills/vue-ui/`, from the docs pages.
 *
 * `SKILL.md` is hand-written except for its component index, which is
 * regenerated between the `index:start` and `index:end` markers. Every
 * `references/<slug>.md` is generated from the component's docs page:
 * prose and fences are kept, the live `<Demo>` islands and the
 * Installation section are dropped, and `<Aside>` becomes a blockquote.
 * Fences equal their example files already (`check:demos`), so the skill
 * cannot document code that does not exist.
 *
 * An unknown PascalCase tag outside a fence fails the build rather than
 * vanishing, which is exactly what Nimbus's own `index.md` does to it.
 *
 *   bun scripts/build-agent-skill.ts          write the skill
 *   bun scripts/build-agent-skill.ts --check  fail if any output is stale
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { componentSlug, readRegistryItems } from '../src/lib/registry-sidebar'

const appDir = path.resolve(import.meta.dirname, '..')
const repoDir = path.resolve(appDir, '../..')
const docsDir = path.join(appDir, 'src/content/docs')
const componentsDir = path.join(repoDir, 'packages/vue/src/components/ui')
const skillDir = path.join(repoDir, 'skills/vue-ui')
const referencesDir = path.join(skillDir, 'references')
const check = process.argv.includes('--check')

const INDEX_START = '<!-- index:start -->'
const INDEX_END = '<!-- index:end -->'
const FENCE = /^\s*(`{3,})/
const IMPORT = /^import\s.+\sfrom\s["'][^"']+["'];?\s*$/
const TAG = /^\s*<\/?([A-Z]\w*)/

class SkillBuildError extends Error {}

function rel(file: string) {
  return path.relative(repoDir, file)
}

/** `components/<slug>.mdx`, else a Getting started page such as `icons.mdx`. */
function pageFor(slug: string) {
  return [
    path.join(docsDir, 'components', `${slug}.mdx`),
    path.join(docsDir, `${slug}.mdx`),
  ].find(existsSync)
}

function frontmatter(source: string, file: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match)
    throw new SkillBuildError(`${rel(file)}: no frontmatter.`)

  const fields = Object.fromEntries(match[1]!.split('\n').flatMap((line) => {
    const pair = line.match(/^(\w+):(.*)$/)

    return pair ? [[pair[1], pair[2]!.trim().replace(/^(["'])(.*)\1$/, '$2')]] : []
  }))

  return { fields, body: source.slice(match[0].length) }
}

/**
 * Docs links become reference links where a reference exists, and plain
 * text otherwise: a consumer's agent has the skill, not the site.
 */
function rewriteLinks(line: string, slugs: Set<string>) {
  return line.replace(/\[([^\]]+)\]\(\/([^)#\s]*)(#[^)\s]*)?\)/g, (_, text, route: string, hash = '') => {
    const slug = route.replace(/^components\//, '')

    return slugs.has(slug) ? `[${text}](${slug}.md${hash})` : text
  })
}

export function toReference(source: string, file: string, name: string, slugs: Set<string>) {
  const { fields, body } = frontmatter(source, file)
  const out: string[] = []
  let fence = ''
  let skip: 'demo' | 'installation' | undefined
  let aside: string | undefined

  const offset = source.split('\n').length - body.split('\n').length

  for (const [i, line] of body.split('\n').entries()) {
    const fenceMatch = line.match(FENCE)

    // Fences first: nothing inside one is a heading, a tag or an import.
    if (fence) {
      if (fenceMatch && fenceMatch[1]!.length >= fence.length && line.trim() === fenceMatch[1])
        fence = ''
      if (skip !== 'installation')
        out.push(line)
      continue
    }
    if (fenceMatch) {
      fence = fenceMatch[1]!
      if (skip !== 'installation')
        out.push(line)
      continue
    }

    if (skip === 'installation') {
      if (!/^#{1,2} /.test(line))
        continue
      skip = undefined
    }

    if (skip === 'demo') {
      if (/^\s*<\/Demo>/.test(line))
        skip = undefined
      continue
    }

    if (line.trim() === '## Installation') {
      skip = 'installation'
      continue
    }

    if (IMPORT.test(line))
      continue

    const tag = line.match(TAG)?.[1]
    if (tag === 'Demo') {
      skip = /<\/Demo>/.test(line) || /\/>\s*$/.test(line) ? undefined : 'demo'
      continue
    }
    if (tag === 'Aside') {
      if (line.trim().startsWith('</')) {
        aside = undefined
        continue
      }
      const type = line.match(/type=["'](\w+)["']/)?.[1] ?? 'note'
      aside = `**${type[0]!.toUpperCase()}${type.slice(1)}:**`
      continue
    }
    if (tag)
      throw new SkillBuildError(`${rel(file)}:${offset + i + 1}: <${tag}> has no Markdown form; teach build-agent-skill.ts about it.`)

    const text = rewriteLinks(line, slugs)
    if (aside !== undefined) {
      const content = text.trim()
      out.push(content ? `> ${aside ? `${aside} ` : ''}${content}` : '>')
      if (content)
        aside = ''
      continue
    }

    out.push(text)
  }

  const content = out.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return [
    `<!-- Generated from the acfatah/ui docs page ${rel(file)}. Do not edit. -->`,
    '',
    `# ${fields.title ?? name}`,
    '',
    `Registry item \`${name}\`.`,
    '',
    content,
    '',
  ].join('\n')
}

/** A table cell must stay one line and must not end the row early. */
function cell(text: string) {
  return text.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim()
}

export function withIndex(skill: string, rows: string[]) {
  const start = skill.indexOf(INDEX_START)
  const end = skill.indexOf(INDEX_END)
  if (start < 0 || end < start)
    throw new SkillBuildError(`${rel(path.join(skillDir, 'SKILL.md'))}: missing ${INDEX_START} / ${INDEX_END}.`)

  return [
    skill.slice(0, start + INDEX_START.length),
    '| Component | Reference | Use for |',
    '| --- | --- | --- |',
    ...rows,
    skill.slice(end),
  ].join('\n')
}

async function build() {
  const items = await readRegistryItems(componentsDir)
  const entries = [...items.values()]
    .map(item => ({ item, slug: componentSlug(item), page: pageFor(componentSlug(item)) }))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  for (const { item, page } of entries) {
    if (!page)
      console.warn(`[warn] ${item.name} has no docs page, so no reference.`)
  }

  const documented = entries.filter(e => e.page)
  const slugs = new Set(documented.map(e => e.slug))
  const outputs = new Map<string, string>()
  const rows: string[] = []

  for (const { item, slug, page } of documented) {
    const source = readFileSync(page!, 'utf8')
    const { fields } = frontmatter(source, page!)

    outputs.set(path.join(referencesDir, `${slug}.md`), toReference(source, page!, item.name, slugs))
    rows.push(`| ${cell(fields.title ?? item.title ?? slug)} | [references/${slug}.md](references/${slug}.md) | ${cell(fields.description ?? '')} |`)
  }

  const skillFile = path.join(skillDir, 'SKILL.md')
  outputs.set(skillFile, withIndex(readFileSync(skillFile, 'utf8'), rows))

  const stale = existsSync(referencesDir)
    ? readdirSync(referencesDir)
        .map(entry => path.join(referencesDir, entry))
        .filter(file => !outputs.has(file))
    : []

  return { outputs, stale }
}

if (import.meta.main) {
  try {
    const { outputs, stale } = await build()

    if (check) {
      let failed = false

      for (const [file, output] of outputs) {
        const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
        if (current !== output) {
          console.error(`${rel(file)} is stale. Run \`bun run skill:build\`.`)
          failed = true
        }
      }
      for (const file of stale) {
        console.error(`${rel(file)} has no docs page. Run \`bun run skill:build\`.`)
        failed = true
      }

      if (failed)
        process.exit(1)
      console.log('skills/vue-ui is up to date.')
    }
    else {
      mkdirSync(referencesDir, { recursive: true })
      for (const [file, output] of outputs) {
        writeFileSync(file, output)
        console.log(`Wrote ${rel(file)}`)
      }
      for (const file of stale) {
        rmSync(file)
        console.log(`Removed ${rel(file)}`)
      }
    }
  }
  catch (error) {
    if (!(error instanceof SkillBuildError))
      throw error
    console.error(`[skill] ${error.message}`)
    process.exit(1)
  }
}
