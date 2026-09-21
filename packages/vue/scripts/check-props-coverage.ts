/**
 * Checks that a component's specs exercise every public prop.
 *
 * The successor to the predecessor's Storybook argTypes drift guard: a
 * prop nobody sets in a spec is a prop whose behaviour nothing pins down.
 *
 * For each component directory under `src/components/ui/`, every `.vue`
 * calling `defineProps<T>()` contributes the properties of `T`, resolved by
 * the TypeScript checker so `extends` chains count. A prop is covered when
 * its name is a property key in some object literal in the directory's
 * `*.spec.ts` files, e.g. `props: { size: 'lg' }`.
 *
 * A prop that genuinely cannot be exercised is waived in its spec file,
 * with a reason, and every waiver is printed on each run:
 *
 *   // props-coverage-ignore: dir, lang — forwarded to Ark, asserted upstream
 *
 * Components without `categories` in `_registry.ts` are infrastructure and
 * are skipped.
 *
 *   bun scripts/check-props-coverage.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const packageDir = path.resolve(import.meta.dirname, '..')
const componentsDir = path.join(packageDir, 'src/components/ui')

const IGNORE = 'props-coverage-ignore:'

/*
  Script-setup compiler macros, declared loosely so the checker can read
  the type argument of `defineProps<T>()` without Vue's compiler.
*/
const MACROS = `
declare function defineProps<T>(): T
declare function withDefaults<T, D>(props: T, defaults: D): T
declare function defineEmits<T>(): any
declare function defineSlots<T>(): any
declare function defineModel<T>(...args: any[]): any
declare function defineExpose(exposed?: any): void
declare function defineOptions(options: any): void
`

let errors = 0
const waivers: string[] = []

function error(file: string, message: string) {
  errors++
  console.log(`[error] ${path.relative(packageDir, file)} — ${message}`)
}

function scriptSetup(source: string) {
  for (const [, attrs, body] of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\ssetup(?:[\s=]|$)/.test(attrs))
      return body
  }
}

function compilerOptions() {
  const configPath = path.join(packageDir, 'tsconfig.json')
  const config = ts.readConfigFile(configPath, ts.sys.readFile)

  return ts.parseJsonConfigFileContent(config.config, ts.sys, packageDir).options
}

/** Prop names per `.vue` file, read from each file's `defineProps<T>()`. */
function propsOf(vueFiles: string[]) {
  const virtual = new Map<string, string>()
  for (const file of vueFiles) {
    const script = scriptSetup(readFileSync(file, 'utf8'))
    if (script?.includes('defineProps<'))
      virtual.set(`${file}.ts`, script)
  }

  const macros = path.join(packageDir, '__macros__.d.ts')
  virtual.set(macros, MACROS)

  const options = { ...compilerOptions(), noEmit: true }
  const host = ts.createCompilerHost(options)
  const readFile = host.readFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  host.readFile = name => virtual.get(name) ?? readFile(name)
  host.fileExists = name => virtual.has(name) || fileExists(name)

  const program = ts.createProgram([...virtual.keys()], options, host)
  const checker = program.getTypeChecker()
  const result = new Map<string, string[]>()

  for (const name of virtual.keys()) {
    if (name === macros)
      continue

    const source = program.getSourceFile(name)
    if (!source)
      continue

    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node)
        && ts.isIdentifier(node.expression)
        && node.expression.text === 'defineProps'
        && node.typeArguments?.length
      ) {
        const type = checker.getTypeFromTypeNode(node.typeArguments[0])
        result.set(name.slice(0, -3), checker.getPropertiesOfType(type).map(p => p.name))
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }

  return result
}

/** Every property key written in an object literal in the spec files. */
function keysOf(specFiles: string[]) {
  const keys = new Set<string>()

  for (const file of specFiles) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    const visit = (node: ts.Node) => {
      if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) {
        const name = node.name
        if (ts.isIdentifier(name) || ts.isStringLiteral(name))
          keys.add(name.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }

  return keys
}

function waiversOf(specFiles: string[]) {
  const waived = new Map<string, { file: string, reason: string }>()

  for (const file of specFiles) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const start = line.indexOf(IGNORE)
      if (start === -1)
        continue

      const [names, reason] = line.slice(start + IGNORE.length).split(/—|\s--\s/)
      if (!reason?.trim()) {
        error(file, `props-coverage-ignore needs a reason after an em dash: ${line.trim()}`)
        continue
      }

      for (const prop of names.split(',').map(p => p.trim()).filter(Boolean))
        waived.set(prop, { file, reason: reason.trim() })
    }
  }

  return waived
}

for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue

  const dir = path.join(componentsDir, entry.name)
  const registry = path.join(dir, '_registry.ts')
  if (!existsSync(registry))
    continue

  const mod = await import(pathToFileURL(registry).href)
  const item = mod.default ?? mod.registryItem
  if (!item?.categories?.length)
    continue

  const files = readdirSync(dir).map(file => path.join(dir, file))
  const specFiles = files.filter(file => file.endsWith('.spec.ts'))
  const vueFiles = files.filter(file => file.endsWith('.vue'))

  if (specFiles.length === 0) {
    error(dir, `${item.name} has categories but no .spec.ts`)
    continue
  }

  const keys = keysOf(specFiles)
  const waived = waiversOf(specFiles)
  const allProps = new Set<string>()

  for (const [file, props] of propsOf(vueFiles)) {
    for (const prop of props) {
      allProps.add(prop)
      if (keys.has(prop))
        continue

      const waiver = waived.get(prop)
      if (waiver)
        waivers.push(`${item.name} ${prop}: ${waiver.reason}`)
      else
        error(file, `prop \`${prop}\` is never set in a spec (or waive it with a props-coverage-ignore comment)`)
    }
  }

  for (const [prop, { file }] of waived) {
    if (!allProps.has(prop))
      error(file, `props-coverage-ignore names \`${prop}\`, which is not a prop`)
  }
}

for (const waiver of waivers)
  console.log(`[waived] ${waiver}`)

console.log(`check-props-coverage: ${errors} error(s), ${waivers.length} waiver(s).`)
process.exit(errors ? 1 : 0)
