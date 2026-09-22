/**
 * Builds the root `registry.json` that `shadcn add acfatah/ui/vue/<item>`
 * reads straight from GitHub.
 *
 * Items come from three places:
 *
 *   - `src/components/ui/<dir>/`: one `registry:ui` item per directory.
 *     `_registry.ts` supplies metadata; every other file ships, except
 *     `*.spec.ts`, `examples/**` and a one-line styles re-export, whose
 *     resolved shared file must be listed in `files[]` instead.
 *   - `src/composables/use*.ts`: one `registry:hook` item each, landing
 *     in the consumer's `aliases.hooks` (`@/composables`).
 *   - `src/setup/_registry.ts`: `vue/project-setup`, authored by hand.
 *
 * `dependencies` and `registryDependencies` are derived from imports and
 * merged with whatever `_registry.ts` declares. Every shipped file gets an
 * explicit alias `target` (`@ui/...`, `@hooks/...`), so installs follow the
 * consumer's `components.json` rather than a guessed path.
 *
 *   bun scripts/registry/build.ts          write registry.json
 *   bun scripts/registry/build.ts --check  fail if registry.json is stale
 */
import type { Registry, RegistryItem } from 'shadcn/schema'

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { registrySchema } from 'shadcn/schema'
import ts from 'typescript'
import { parse } from 'vue/compiler-sfc'

type RegistryFile = NonNullable<RegistryItem['files']>[number]

export interface BuildOptions {
  /** Repository root; every emitted `path` is relative to it. */
  rootDir: string
  /** The framework package, e.g. `packages/vue`. */
  packageDir: string
  /** Item name prefix, e.g. `vue`. */
  prefix: string
  /** GitHub address of the registry, e.g. `acfatah/ui`. */
  namespace: string
  name: string
  homepage: string
}

/** Provided by the consumer's project, never installed by an item. */
const PEER_PACKAGES = new Set(['vue'])

/** Test tooling a shipped file must never pull into a consumer. */
const TEST_PACKAGES = new Set([
  '@vitest/browser',
  '@vitest/browser-playwright',
  'axe-core',
  'playwright',
  'vitest',
  'vitest-browser-vue',
])

const SHIPPED_EXTENSIONS = new Set(['.ts', '.vue', '.css'])

export class RegistryBuildError extends Error {
  override name = 'RegistryBuildError'
}

function fail(file: string, message: string): never {
  throw new RegistryBuildError(`${file}: ${message}`)
}

function toPosix(p: string) {
  return p.split(path.sep).join('/')
}

/** `@scope/pkg/sub` -> `@scope/pkg`, `pkg/sub` -> `pkg`. */
function packageName(specifier: string) {
  const parts = specifier.split('/')

  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!
}

function isBareSpecifier(specifier: string) {
  return !/^(?:\.{1,2}\/|@\/|~|node:|\/)/.test(specifier)
}

/** Every import and re-export specifier, type-only ones included. */
export function scanImports(filename: string, source: string) {
  let code = source

  if (filename.endsWith('.vue')) {
    const { descriptor } = parse(source, { filename })
    code = [descriptor.script?.content, descriptor.scriptSetup?.content]
      .filter(Boolean)
      .join('\n')
  }

  if (filename.endsWith('.css'))
    return []

  return ts.preProcessFile(code, true, true)
    .importedFiles
    .map(file => file.fileName)
}

/** `export * from '~shared/...'` and nothing else. */
function sharedReExport(source: string) {
  const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim()

  return code.match(/^export \* from '~shared\/([^']+)'$/)?.[1]
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)

    return entry.isDirectory() ? listFiles(full) : [full]
  })
}

async function importRegistryItem(file: string) {
  const mod = await import(pathToFileURL(file).href)

  return (mod.default ?? mod.registryItem) as RegistryItem
}

class Builder {
  readonly srcDir: string
  readonly uiDir: string
  readonly composablesDir: string
  readonly versions: Map<string, string>

  constructor(readonly options: BuildOptions) {
    this.srcDir = path.join(options.packageDir, 'src')
    this.uiDir = path.join(this.srcDir, 'components/ui')
    this.composablesDir = path.join(this.srcDir, 'composables')

    const manifest = JSON.parse(
      readFileSync(path.join(options.packageDir, 'package.json'), 'utf8'),
    )

    this.versions = new Map(Object.entries({
      ...manifest.devDependencies,
      ...manifest.dependencies,
    }))
  }

  rel(file: string) {
    return toPosix(path.relative(this.options.rootDir, file))
  }

  address(item: string) {
    return `${this.options.namespace}/${this.options.prefix}/${item}`
  }

  /** `name@range` from the framework package's manifest. */
  versioned(dependency: string, file: string) {
    if (/.@/.test(dependency))
      return dependency

    const version = this.versions.get(dependency)
    if (!version) {
      fail(file, `'${dependency}' is not declared in `
      + `${this.rel(path.join(this.options.packageDir, 'package.json'))}.`)
    }

    return `${dependency}@${version}`
  }

  componentDirs() {
    return readdirSync(this.uiDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
  }

  composableNames() {
    if (!existsSync(this.composablesDir))
      return []

    return readdirSync(this.composablesDir)
      .filter(file => /^use\w+\.ts$/.test(file) && !file.endsWith('.spec.ts'))
      .map(file => file.replace(/\.ts$/, ''))
      .sort()
  }

  /**
   * Sorts each import of a shipped file into npm or registry dependencies.
   * `withinDir` is the directory relative imports must stay inside.
   */
  collectDependencies(
    file: string,
    withinDir: string,
    dependencies: Set<string>,
    registryDependencies: Set<string>,
    self: string,
  ) {
    const rel = this.rel(file)
    const source = readFileSync(file, 'utf8')

    for (const specifier of scanImports(file, source)) {
      if (specifier.startsWith('./') || specifier.startsWith('../')) {
        const target = path.resolve(path.dirname(file), specifier)
        if (!target.startsWith(withinDir + path.sep))
          fail(rel, `relative import '${specifier}' leaves the item directory.`)
        continue
      }

      if (specifier.startsWith('@/')) {
        const dep = this.aliasDependency(specifier, rel)
        if (dep !== self)
          registryDependencies.add(this.address(dep))
        continue
      }

      if (specifier.startsWith('~') || specifier.startsWith('node:')
        || TEST_PACKAGES.has(packageName(specifier))) {
        fail(rel, `imports '${specifier}', which a consumer does not have.`)
      }

      if (isBareSpecifier(specifier)) {
        const pkg = packageName(specifier)
        if (!PEER_PACKAGES.has(pkg))
          dependencies.add(this.versioned(pkg, rel))
      }
    }
  }

  /** `@/components/ui/<dir>/...` -> `<dir>`, `@/composables/<name>` -> `<name>`. */
  aliasDependency(specifier: string, rel: string) {
    const [area, ...rest] = specifier.slice(2).split('/')

    if (area === 'components' && rest[0] === 'ui' && rest[1]) {
      if (!this.componentDirs().includes(rest[1]))
        fail(rel, `'${specifier}' names no component directory.`)

      return rest[1]
    }

    if (area === 'composables' && rest.length === 1) {
      if (!this.composableNames().includes(rest[0]!))
        fail(rel, `'${specifier}' names no composable.`)

      return rest[0]!
    }

    fail(rel, `'${specifier}' maps to no registry item.`)
  }

  async componentItem(dir: string): Promise<RegistryItem> {
    const componentDir = path.join(this.uiDir, dir)
    const manifestFile = path.join(componentDir, '_registry.ts')
    const manifestRel = this.rel(manifestFile)

    if (!existsSync(manifestFile))
      fail(this.rel(componentDir), 'has no _registry.ts.')

    const manifest = await importRegistryItem(manifestFile)
    const expectedName = `${this.options.prefix}/${dir}`
    if (manifest.name !== expectedName)
      fail(manifestRel, `name is '${manifest.name}', expected '${expectedName}'.`)

    const declared = manifest.files ?? []
    const files: RegistryFile[] = []
    const dependencies = new Set<string>()
    const registryDependencies = new Set<string>()

    for (const file of declared) {
      if (/(?:^|\/)src\/(?:composables|lib)\//.test(file.path)) {
        fail(manifestRel, `'${file.path}' is auto-resolved via `
        + `registryDependencies; remove it from files[].`)
      }
      if (!existsSync(path.join(this.options.rootDir, file.path)))
        fail(manifestRel, `files[] path '${file.path}' does not exist.`)
      if (!file.target?.startsWith('@ui/'))
        fail(manifestRel, `files[] '${file.path}' needs a '@ui/...' target.`)
    }

    const shipped = listFiles(componentDir)
      .filter((file) => {
        const local = toPosix(path.relative(componentDir, file))

        return local !== '_registry.ts'
          && !local.startsWith('examples/')
          && !local.endsWith('.spec.ts')
          && SHIPPED_EXTENSIONS.has(path.extname(local))
      })
      .sort()

    for (const file of shipped) {
      const local = toPosix(path.relative(componentDir, file))
      const source = readFileSync(file, 'utf8')
      const shared = sharedReExport(source)

      if (shared !== undefined) {
        const sharedPath = this.rel(path.join(this.options.rootDir, 'shared', shared))
        const listed = declared.some(f =>
          f.path.replace(/\.ts$/, '') === sharedPath.replace(/\.ts$/, '')
          && f.target === `@ui/${dir}/${local}`)
        if (!listed) {
          fail(manifestRel, `${local} re-exports '~shared/${shared}', so `
          + `files[] must ship '${sharedPath}.ts' with target `
          + `'@ui/${dir}/${local}'.`)
        }
        continue
      }

      if (source.includes('~shared/'))
        fail(this.rel(file), 'imports ~shared but is not a one-line re-export.')

      files.push({
        path: this.rel(file),
        type: 'registry:ui',
        target: `@ui/${dir}/${local}`,
      })
      this.collectDependencies(file, componentDir, dependencies, registryDependencies, dir)
    }

    for (const file of declared) {
      files.push(file)
      const full = path.join(this.options.rootDir, file.path)
      if (/\.(?:ts|vue)$/.test(full)) {
        this.collectDependencies(full, path.dirname(full), dependencies, registryDependencies, dir)
      }
    }

    for (const dep of manifest.dependencies ?? [])
      dependencies.add(this.versioned(dep, manifestRel))
    for (const dep of manifest.registryDependencies ?? [])
      registryDependencies.add(dep.includes('/') ? dep : this.address(dep))

    return this.item(manifest, files, dependencies, registryDependencies)
  }

  composableItem(name: string): RegistryItem {
    const file = path.join(this.composablesDir, `${name}.ts`)
    const dependencies = new Set<string>()
    const registryDependencies = new Set<string>()

    this.collectDependencies(file, this.composablesDir, dependencies, registryDependencies, name)

    // Sibling composables are imported relatively; each is its own item.
    for (const specifier of scanImports(file, readFileSync(file, 'utf8'))) {
      const sibling = specifier.match(/^\.\/(use\w+)$/)?.[1]
      if (sibling) {
        if (!this.composableNames().includes(sibling))
          fail(this.rel(file), `'${specifier}' names no composable.`)
        registryDependencies.add(this.address(sibling))
      }
    }

    return this.item(
      { name: `${this.options.prefix}/${name}`, type: 'registry:hook' },
      [{ path: this.rel(file), type: 'registry:hook', target: `@hooks/${name}.ts` }],
      dependencies,
      registryDependencies,
    )
  }

  async setupItem(): Promise<RegistryItem | undefined> {
    const manifestFile = path.join(this.srcDir, 'setup/_registry.ts')
    if (!existsSync(manifestFile))
      return undefined

    const manifestRel = this.rel(manifestFile)
    const manifest = await importRegistryItem(manifestFile)

    for (const file of manifest.files ?? []) {
      if (!existsSync(path.join(this.options.rootDir, file.path)))
        fail(manifestRel, `files[] path '${file.path}' does not exist.`)
      // Installs before components.json exists, so must stay universal.
      if (!file.target?.startsWith('~/'))
        fail(manifestRel, `files[] '${file.path}' needs a '~/...' target.`)
    }

    return {
      ...manifest,
      dependencies: manifest.dependencies?.map(dep => this.versioned(dep, manifestRel)),
      devDependencies: manifest.devDependencies?.map(dep => this.versioned(dep, manifestRel)),
    }
  }

  /** Fixed key order, sorted dependency lists, empty lists dropped. */
  item(
    manifest: RegistryItem,
    files: RegistryFile[],
    dependencies: Set<string>,
    registryDependencies: Set<string>,
  ): RegistryItem {
    const { name, type, title, description, ...rest } = manifest
    delete rest.files
    delete rest.dependencies
    delete rest.registryDependencies

    return {
      name,
      type,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(dependencies.size ? { dependencies: [...dependencies].sort() } : {}),
      ...(registryDependencies.size
        ? { registryDependencies: [...registryDependencies].sort() }
        : {}),
      files,
      ...rest,
    }
  }

  async build(): Promise<Registry> {
    const items: RegistryItem[] = []

    const setup = await this.setupItem()
    if (setup)
      items.push(setup)

    for (const dir of this.componentDirs())
      items.push(await this.componentItem(dir))
    for (const name of this.composableNames())
      items.push(this.composableItem(name))

    const names = new Set<string>()
    for (const item of items) {
      if (names.has(item.name))
        fail('registry.json', `duplicate item name '${item.name}'.`)
      names.add(item.name)
    }

    // Every same-registry dependency must be an item in this file.
    const own = `${this.options.namespace}/`
    for (const item of items) {
      for (const dep of item.registryDependencies ?? []) {
        if (dep.startsWith(own) && !names.has(dep.slice(own.length).split('#')[0]!))
          fail(item.name, `registryDependency '${dep}' is not an item.`)
      }
    }

    return registrySchema.parse({
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: this.options.name,
      homepage: this.options.homepage,
      items,
    })
  }
}

export function buildRegistry(options: BuildOptions) {
  return new Builder(options).build()
}

export function serialize(registry: Registry) {
  return `${JSON.stringify(registry, null, 2)}\n`
}

if (import.meta.main) {
  const packageDir = path.resolve(import.meta.dirname, '../..')
  const rootDir = path.resolve(packageDir, '../..')
  const rootManifest = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
  const homepage: string = rootManifest.homepage
  const namespace = new URL(homepage).pathname.replace(/^\/|\/$/g, '')
  const outFile = path.join(rootDir, 'registry.json')

  try {
    const output = serialize(await buildRegistry({
      rootDir,
      packageDir,
      prefix: 'vue',
      namespace,
      name: namespace.split('/').pop()!,
      homepage,
    }))

    if (process.argv.includes('--check')) {
      const current = existsSync(outFile) && statSync(outFile).isFile()
        ? readFileSync(outFile, 'utf8')
        : ''
      if (current !== output) {
        console.error('registry.json is stale. Run `bun run registry:build`.')
        process.exit(1)
      }
      console.log('registry.json is up to date.')
    }
    else {
      await Bun.write(outFile, output)
      console.log(`Wrote ${path.relative(process.cwd(), outFile)}`)
    }
  }
  catch (error) {
    if (!(error instanceof RegistryBuildError))
      throw error
    console.error(`[registry] ${error.message}`)
    process.exit(1)
  }
}
