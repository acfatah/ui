/**
 * Builds the root `registry.json` that `shadcn add acfatah/ui/vue/<item>`
 * reads straight from GitHub.
 *
 * Items come from four places:
 *
 *   - `src/components/ui/<dir>/`: one `registry:ui` item per directory.
 *     `_registry.ts` supplies metadata; every other file ships, except
 *     `*.spec.ts`, `examples/**` and a one-line styles re-export, whose
 *     resolved shared file must be listed in `files[]` instead.
 *   - `src/composables/use*.ts`: one `registry:hook` item each, landing
 *     in the consumer's `aliases.hooks` (`@/composables`).
 *   - `src/setup/_registry.ts`: `vue/project-setup`, authored by hand.
 *   - `src/skill/_registry.ts`: `vue/agent-skill`. Its files are every
 *     file under `skills/vue-ui/`, targeted at the consumer's
 *     `.claude/skills/vue-ui/`, so a generated reference cannot be left out.
 *
 * `dependencies` and `registryDependencies` are derived from imports and
 * merged with whatever `_registry.ts` declares. Every shipped file gets an
 * explicit alias `target` (`@ui/...`, `@hooks/...`), so installs follow the
 * consumer's `components.json` rather than a guessed path.
 *
 * The same pass derives each component's test-depth tier from its source,
 * fails when the declared `meta.tier` is lower than the source implies,
 * and writes `docs/component-graph.md`.
 *
 *   bun scripts/registry/build.ts          write registry.json and the graph
 *   bun scripts/registry/build.ts --check  fail if either output is stale
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

/** The consumer agent skill: its source, and where it lands in a project. */
const SKILL_SOURCE = 'skills/vue-ui'
const SKILL_TARGET = '~/.claude/skills/vue-ui'

/*
  Test-depth tiers. The model and the spec contract each tier owes are in
  README.md, "Test depth is tiered"; the same derivation is written out
  for a human reviewer in .claude/skills/review-component/SKILL.md, §3a.
  Keep the three in step.

  Only T1 to T3 are derived. T4 is a judgement call in both halves —
  assembling several components, or a high-surface / async / control
  collection — so it is never derived and never contradicted.
*/
const TIERS = ['T1', 'T2', 'T3', 'T4'] as const

type Tier = typeof TIERS[number]

/**
 * Ark subpaths that export no state machine. Machines reach consumers
 * through Ark's `./*` wildcard export, so every other subpath is one.
 */
const ARK_UTILITY_SUBPATHS = new Set([
  'anatomy',
  'environment',
  'factory',
  'hotkeys',
  'interaction',
  'locale',
  'types',
  'utils',
])

/**
 * Bindings off the bare `@ark-ui/vue` barrel that are not a machine. The
 * barrel re-exports everything, so anything else taken from it is.
 */
const ARK_FACTORY_BINDINGS = new Set(['ark', 'jsxFactory'])

/*
  `@zag-js/*` is deliberately absent: a component reaches its machine
  through Ark, never through Zag directly. Add it here the day one does.
*/
const ARK_PACKAGE = '@ark-ui/vue'

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

/** A file's script and template halves; `.vue` blocks, or the file itself. */
function sfcParts(filename: string, source: string) {
  if (!filename.endsWith('.vue'))
    return { script: source, template: '' }

  const { descriptor } = parse(source, { filename })

  return {
    script: [descriptor.script?.content, descriptor.scriptSetup?.content]
      .filter(Boolean)
      .join('\n'),
    template: descriptor.template?.content ?? '',
  }
}

/** Every import and re-export specifier, type-only ones included. */
export function scanImports(filename: string, source: string) {
  if (filename.endsWith('.css'))
    return []

  return ts.preProcessFile(sfcParts(filename, source).script, true, true)
    .importedFiles
    .map(file => file.fileName)
}

export interface TierEvidence {
  /** How the file reaches an Ark state machine, phrased for the error. */
  machine?: string
  /** A `*Positioner`, in script or template. */
  positioner?: boolean
  /** `Teleport`, in script or template. */
  teleport?: boolean
}

/** Drops `//`, `/* *\/` and `<!-- -->` so prose about portals is not evidence. */
function stripComments(code: string) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
}

/** The binding is Ark's factory, not one of its machines. */
function isArkFactoryBinding(name: string) {
  return ARK_FACTORY_BINDINGS.has(name) || name.endsWith('Anatomy')
}

/**
 * How a machine is reached through `specifier`, or undefined for none.
 * `bindings` is empty for a namespace import, which can reach anything.
 */
function arkMachineImport(
  specifier: string,
  bindings: string[] | undefined,
): string | undefined {
  if (specifier.startsWith(`${ARK_PACKAGE}/`)) {
    const subpath = specifier.slice(ARK_PACKAGE.length + 1).split('/')[0]!

    return ARK_UTILITY_SUBPATHS.has(subpath)
      ? undefined
      : `an Ark machine import '${specifier}'`
  }

  if (specifier !== ARK_PACKAGE)
    return undefined

  // The barrel re-exports the factory and every machine, so read bindings.
  if (!bindings)
    return `everything taken from the '${ARK_PACKAGE}' barrel`

  const machine = bindings.find(binding => !isArkFactoryBinding(binding))

  return machine && `'${machine}' imported from the '${ARK_PACKAGE}' barrel`
}

/**
 * What a component file says about its own tier: an Ark state machine or
 * a `use*Context()` call is T2, a `Positioner` or a `Teleport` is T3.
 *
 * Either portal marker is enough, because Ark teleports at runtime: in
 * the predecessor, `dialog`, `drawer`, `sheet` and `navigation-menu` are
 * all T3 and render a `Positioner` while writing no `Teleport` at all.
 * Requiring both would have derived T2 for four of its twelve portal
 * components and let a drifted one declare T2 unchallenged.
 *
 * Read from the component's own source, never from a demo — a demo that
 * never writes `Teleport` is not evidence that there is no portal.
 */
export function scanTierEvidence(filename: string, source: string): TierEvidence {
  if (filename.endsWith('.css'))
    return {}

  const { script, template } = sfcParts(filename, source)
  const evidence: TierEvidence = {}
  const file = ts.createSourceFile(
    filename,
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier)
    ) {
      evidence.machine ??= arkMachineImport(
        node.moduleSpecifier.text,
        namedBindings(node),
      )
    }

    // A `use*Context()` call, not a re-export of one: a barrel that
    // forwards `useSwitchContext` runs no machine of its own.
    if (ts.isCallExpression(node)) {
      const callee = ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name.text
        : ts.isIdentifier(node.expression) ? node.expression.text : undefined

      if (callee && /^use[A-Z]\w*Context$/.test(callee))
        evidence.machine ??= `a ${callee}() call`
    }

    ts.forEachChild(node, visit)
  }

  ts.forEachChild(file, visit)

  const text = `${stripComments(script)}\n${stripComments(template)}`

  // No leading \b: `Tooltip.Positioner` and `PopoverPositioner` both count.
  // `Teleport` is PascalCase by convention here, as a Vue built-in.
  evidence.positioner = /Positioner\b/.test(text)
  evidence.teleport = /\bTeleport\b/.test(text)

  return evidence
}

/** Value bindings of an import or export clause; undefined means "all of them". */
function namedBindings(node: ts.ImportDeclaration | ts.ExportDeclaration) {
  const clause = ts.isImportDeclaration(node) ? node.importClause : node

  if (!clause || clause.isTypeOnly)
    return []

  const bindings = ts.isImportDeclaration(node)
    ? (clause as ts.ImportClause).namedBindings
    : (clause as ts.ExportDeclaration).exportClause

  // `import * as x` and `export *` put the whole module in reach.
  if (!bindings) {
    return ts.isImportDeclaration(node) && (clause as ts.ImportClause).name
      ? [] // a default import binds no named export
      : undefined
  }

  if (ts.isNamespaceImport(bindings) || ts.isNamespaceExport(bindings))
    return undefined

  return bindings.elements
    .filter(element => !element.isTypeOnly)
    .map(element => (element.propertyName ?? element.name).text)
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

/** What the tier gate and the graph know about one component directory. */
interface ComponentTier {
  manifestRel: string
  /** `meta.tier`, absent on an infrastructure item. */
  declared?: Tier
  /** Derived from this component's own source, before inheritance. */
  own: Tier
  /** Why `own` is above T1, phrased for the error message. */
  reason?: string
  /** Sibling component directories this one depends on. */
  deps: string[]
}

class Builder {
  readonly srcDir: string
  readonly uiDir: string
  readonly composablesDir: string
  readonly versions: Map<string, string>
  readonly components = new Map<string, ComponentTier>()
  graphMarkdown = ''

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

    const declaredTier = this.declaredTier(manifest, manifestRel)
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

    const evidence: TierEvidence = {}
    const evidenceFile: Record<string, string> = {}

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

      // The component's own source only: the resolved shared styles file
      // above is skipped with the re-export, and specs and examples never
      // reach `shipped`.
      const found = scanTierEvidence(file, source)
      for (const key of ['machine', 'positioner', 'teleport'] as const) {
        if (found[key] && !evidence[key]) {
          evidence[key] = found[key] as never
          evidenceFile[key] = local
        }
      }
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

    this.components.set(dir, {
      manifestRel,
      declared: declaredTier,
      ...this.ownTier(evidence, evidenceFile),
      deps: this.componentDeps(registryDependencies),
    })

    return this.item(manifest, files, dependencies, registryDependencies)
  }

  /**
   * `meta.tier`, validated against `categories`. An item carrying neither
   * is infrastructure — `vue/icons`, a list of re-exports — and is exempt
   * by rule, the same test `scripts/check-props-coverage.ts` uses to skip
   * it. Carrying one without the other is an oversight, not a decision.
   */
  declaredTier(manifest: RegistryItem, manifestRel: string): Tier | undefined {
    const tier = manifest.meta?.tier as string | undefined
    const categories = manifest.categories ?? []
    const pair = 'A component declares both; an item with neither is '
      + 'infrastructure. See README.md, "Components declare `categories` '
      + 'and `meta.tier`".'

    if (tier === undefined) {
      if (categories.length)
        fail(manifestRel, `has categories but no meta.tier. ${pair}`)

      return undefined
    }

    if (!categories.length)
      fail(manifestRel, `has meta.tier but no categories. ${pair}`)
    if (!TIERS.includes(tier as Tier))
      fail(manifestRel, `meta.tier is '${tier}'; expected one of ${TIERS.join(', ')}.`)

    return tier as Tier
  }

  /** The tier this component's own source implies, and the evidence for it. */
  ownTier(evidence: TierEvidence, evidenceFile: Record<string, string>) {
    if (evidence.positioner || evidence.teleport) {
      const marker = evidence.positioner ? 'positioner' : 'teleport'

      return {
        own: 'T3' as Tier,
        reason: `${evidence.positioner ? 'a Positioner' : 'a Teleport'} `
          + `in ${evidenceFile[marker]}`,
      }
    }

    if (evidence.machine)
      return { own: 'T2' as Tier, reason: `${evidence.machine} in ${evidenceFile.machine}` }

    return { own: 'T1' as Tier, reason: undefined }
  }

  /** The sibling component directories among a set of registry addresses. */
  componentDeps(registryDependencies: Set<string>) {
    const dirs = this.componentDirs()

    return [...registryDependencies]
      .map(dep => dep.split('#')[0]!.slice(this.address('').length))
      .filter(dep => dirs.includes(dep))
      .sort()
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

  async skillItem(): Promise<RegistryItem | undefined> {
    const manifestFile = path.join(this.srcDir, 'skill/_registry.ts')
    if (!existsSync(manifestFile))
      return undefined

    const manifestRel = this.rel(manifestFile)
    const manifest = await importRegistryItem(manifestFile)
    const sourceDir = path.join(this.options.rootDir, SKILL_SOURCE)

    if (manifest.files?.length)
      fail(manifestRel, `declares files[]; the build ships ${SKILL_SOURCE}/ instead.`)
    if (!existsSync(path.join(sourceDir, 'SKILL.md')))
      fail(manifestRel, `${SKILL_SOURCE}/SKILL.md does not exist.`)

    // SKILL.md first, then the references, so the entry point reads first.
    const files = listFiles(sourceDir)
      .map(file => toPosix(path.relative(sourceDir, file)))
      .sort((a, b) => Number(b === 'SKILL.md') - Number(a === 'SKILL.md') || a.localeCompare(b))
      .map(local => ({
        path: `${SKILL_SOURCE}/${local}`,
        type: 'registry:file' as const,
        target: `${SKILL_TARGET}/${local}`,
      }))

    return this.item(manifest, files, new Set(), new Set())
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

    const skill = await this.skillItem()
    if (skill)
      items.push(skill)

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

    // After the check above, so inheritance never walks a missing item.
    const derived = this.deriveTiers()
    this.checkTiers(derived)
    this.graphMarkdown = this.graph(items, derived)

    return registrySchema.parse({
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: this.options.name,
      homepage: this.options.homepage,
      items,
    })
  }

  /**
   * Each component's tier, raised to the derived tier of anything it
   * imports. `command` imports `dialog` and is T3 *because* of it,
   * inheriting that portal's focus trap.
   *
   * Propagating the derived tier, never the declared one, is what caps
   * inheritance at T3: a dependency declared T4 by judgement contributes
   * only the T3 its source shows. Composition is a prompt to consider
   * T4, never a derivation of it.
   */
  deriveTiers() {
    const derived = new Map<string, Tier>()
    const inherited = new Map<string, string>()

    for (const [dir, component] of this.components)
      derived.set(dir, component.own)

    /*
      A fixpoint, not a walk: tiers only ever rise and stop at T3, so a
      cycle converges instead of recursing forever. 'T1' < 'T2' < 'T3'
      compares correctly as strings.
    */
    for (let changed = true; changed;) {
      changed = false

      for (const [dir, component] of this.components) {
        for (const dep of component.deps) {
          const depTier = derived.get(dep)
          if (depTier && depTier > derived.get(dir)!) {
            derived.set(dir, depTier)
            inherited.set(dir, `inherited from ${this.options.prefix}/${dep}, ${depTier}`)
            changed = true
          }
        }
      }
    }

    for (const [dir, reason] of inherited)
      this.components.get(dir)!.reason = reason

    return derived
  }

  /**
   * Fails when a component claims a shallower tier than its source shows.
   *
   * The failure this prevents is a false ✅, not an error: a component
   * whose declared tier is too low is never *reported* as under-tested,
   * it is simply never asked for the specs that tier owes.
   */
  checkTiers(derived: Map<string, Tier>) {
    for (const [dir, component] of this.components) {
      const { declared, manifestRel, reason } = component
      const tier = derived.get(dir)!

      // Infrastructure declares no tier, and T4 is never contradicted.
      if (declared === undefined || declared >= tier)
        continue

      fail(manifestRel, `meta.tier is '${declared}' but the source derives `
      + `${tier} (${reason}). Declaring a tier higher than the source is `
      + `allowed; declaring one lower silently drops the specs ${tier} `
      + `owes. See README.md, "Test depth is tiered".`)
    }
  }

  /** `docs/component-graph.md`: what each component pulls in, and what pulls it in. */
  graph(items: RegistryItem[], derived: Map<string, Tier>) {
    const own = `${this.options.namespace}/`
    const short = (address: string) => address.split('#')[0]!.slice(own.length)
    const usedBy = new Map<string, string[]>()

    for (const item of items) {
      for (const dep of item.registryDependencies ?? []) {
        if (!dep.startsWith(own))
          continue
        usedBy.set(short(dep), [...usedBy.get(short(dep)) ?? [], item.name])
      }
    }

    const cell = (names: string[]) => names.length
      ? [...names].sort().map(name => `\`${name}\``).join(', ')
      : '—'

    const rows = [...this.components].map(([dir, component]) => {
      const name = `${this.options.prefix}/${dir}`
      const item = items.find(i => i.name === name)!
      const uses = (item.registryDependencies ?? []).map(short)

      return `| \`${name}\` | ${component.declared ?? '—'} `
        + `| ${component.declared ? derived.get(dir)! : '—'} `
        + `| ${cell(uses)} | ${cell(usedBy.get(name) ?? [])} |`
    })

    return [
      `<!-- Generated by packages/vue/scripts/registry/build.ts.`,
      `     Do not edit; run \`bun run registry:build\`. -->`,
      '',
      '# Component graph',
      '',
      'Every component, what it pulls in, and what pulls it in. Composition',
      'is recorded here rather than hand-declared, so it cannot drift from',
      'the imports it is generated from.',
      '',
      '`Declared` is `meta.tier` in the component\'s `_registry.ts`.',
      '`Derived` is read off its source: an Ark state machine or a',
      '`use*Context()` call is T2, a `Positioner` or a `Teleport` is T3, and',
      'a component inherits the derived tier of anything it imports, capped',
      'at T3. T4 is a judgement call and is never derived. Declaring higher',
      'than derived is allowed; declaring lower fails the build.',
      'Infrastructure items carry neither field and show `—`.',
      '',
      '| Component | Declared | Derived | Uses | Used by |',
      '| --- | --- | --- | --- | --- |',
      ...rows,
      '',
    ].join('\n')
  }
}

export interface BuildResult {
  registry: Registry
  /** `docs/component-graph.md`, written from the same pass. */
  graph: string
}

export async function buildRegistry(options: BuildOptions): Promise<BuildResult> {
  const builder = new Builder(options)

  return { registry: await builder.build(), graph: builder.graphMarkdown }
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
  try {
    const { registry, graph } = await buildRegistry({
      rootDir,
      packageDir,
      prefix: 'vue',
      namespace,
      name: namespace.split('/').pop()!,
      homepage,
    })

    const outputs = [
      [path.join(rootDir, 'registry.json'), serialize(registry)],
      [path.join(packageDir, 'docs/component-graph.md'), graph],
    ] as const

    if (process.argv.includes('--check')) {
      let stale = false

      for (const [file, output] of outputs) {
        const current = existsSync(file) && statSync(file).isFile()
          ? readFileSync(file, 'utf8')
          : ''
        if (current !== output) {
          console.error(`${toPosix(path.relative(rootDir, file))} is stale. `
            + 'Run `bun run registry:build`.')
          stale = true
        }
      }

      if (stale)
        process.exit(1)
      console.log('registry.json and docs/component-graph.md are up to date.')
    }
    else {
      for (const [file, output] of outputs) {
        await Bun.write(file, output)
        console.log(`Wrote ${path.relative(process.cwd(), file)}`)
      }
    }
  }
  catch (error) {
    if (!(error instanceof RegistryBuildError))
      throw error
    console.error(`[registry] ${error.message}`)
    process.exit(1)
  }
}
