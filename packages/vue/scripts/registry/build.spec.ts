import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buildRegistry, RegistryBuildError } from './build'

let root: string

function write(file: string, content: string) {
  const full = path.join(root, file)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, content)
}

function manifest(name: string, files: object[] = [], extra: object = {}) {
  return `export default ${JSON.stringify({ type: 'registry:ui', name, files, ...extra })}\n`
}

/** The pair a component declares. Fixtures without it are infrastructure. */
function tier(value: string, categories = ['actions']) {
  return { categories, meta: { tier: value } }
}

const BUTTON_STYLES = {
  path: 'shared/styles/components/ui/button/styles.ts',
  type: 'registry:ui',
  target: '@ui/button/styles.ts',
}

function buildAll() {
  return buildRegistry({
    rootDir: root,
    packageDir: path.join(root, 'packages/vue'),
    prefix: 'vue',
    namespace: 'acme/ui',
    name: 'ui',
    homepage: 'https://github.com/acme/ui',
  })
}

async function build() {
  return (await buildAll()).registry
}

async function graph() {
  return (await buildAll()).graph
}

function item(registry: Awaited<ReturnType<typeof build>>, name: string) {
  return registry.items.find(i => i.name === name)!
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'registry-build-'))

  write('packages/vue/package.json', JSON.stringify({
    dependencies: { 'cn': '0.3.0', '@ark-ui/vue': '^5.0.0', 'vue': '^3.5.0' },
  }))
  write('shared/styles/components/ui/button/styles.ts', 'export const buttonStyles = {}\n')

  const ui = 'packages/vue/src/components/ui/button'
  write(`${ui}/_registry.ts`, manifest('vue/button', [BUTTON_STYLES]))
  write(`${ui}/styles.ts`, `export * from '~shared/styles/components/ui/button/styles'\n`)
  write(`${ui}/Button.vue`, [
    '<script setup lang="ts">',
    `import type { ButtonProps } from './types'`,
    `import { ark } from '@ark-ui/vue'`,
    `import { cn } from 'cn'`,
    `import { computed } from 'vue'`,
    `import { useThing } from '@/composables/useThing'`,
    `import { buttonStyles } from './styles'`,
    '</script>',
  ].join('\n'))
  write(`${ui}/types.ts`, 'export interface ButtonProps {}\n')
  write(`${ui}/index.ts`, `export { default as Button } from './Button.vue'\n`)
  write(`${ui}/Button.spec.ts`, `import { it } from 'vitest'\n`)
  write(`${ui}/examples/Demo.vue`, `<script setup lang="ts">\nimport { X } from '@lucide/vue'\n</script>`)

  write('packages/vue/src/composables/useThing.ts', `import { ref } from 'vue'\nimport { useOther } from './useOther'\n`)
  write('packages/vue/src/composables/useOther.ts', 'export {}\n')
  write('packages/vue/src/composables/useThing.spec.ts', `import { it } from 'vitest'\n`)
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('buildRegistry', () => {
  it('ships component files with alias targets and skips specs, examples and the re-export', async () => {
    const button = item(await build(), 'vue/button')

    expect(button.files!.map(f => f.target)).toEqual([
      '@ui/button/Button.vue',
      '@ui/button/index.ts',
      '@ui/button/types.ts',
      '@ui/button/styles.ts',
    ])
    expect(button.files!.at(-1)!.path).toBe(BUTTON_STYLES.path)
  })

  it('derives versioned npm deps and registry deps from imports', async () => {
    const button = item(await build(), 'vue/button')

    expect(button.dependencies).toEqual(['@ark-ui/vue@^5.0.0', 'cn@0.3.0'])
    expect(button.registryDependencies).toEqual(['acme/ui/vue/useThing'])
  })

  it('emits one registry:hook item per composable, linked to its siblings', async () => {
    const registry = await build()
    const thing = item(registry, 'vue/useThing')

    expect(thing.type).toBe('registry:hook')
    expect(thing.files).toEqual([{
      path: 'packages/vue/src/composables/useThing.ts',
      type: 'registry:hook',
      target: '@hooks/useThing.ts',
    }])
    expect(thing.registryDependencies).toEqual(['acme/ui/vue/useOther'])
    expect(registry.items.map(i => i.name)).not.toContain('vue/useThing.spec')
  })

  it('throws when a styles re-export has no shared file in files[]', async () => {
    write('packages/vue/src/components/ui/button/_registry.ts', manifest('vue/button'))

    await expect(build()).rejects.toThrow(/files\[\] must ship/)
  })

  it('throws when a shipped file imports ~shared directly', async () => {
    write('packages/vue/src/components/ui/button/types.ts', `import { x } from '~shared/styles/x'\n`)

    await expect(build()).rejects.toThrow(RegistryBuildError)
  })

  it('throws when a shipped file imports a test-only package', async () => {
    write('packages/vue/src/components/ui/button/types.ts', `import { it } from 'vitest'\n`)

    await expect(build()).rejects.toThrow(/a consumer does not have/)
  })

  it('throws on an npm import the package does not declare', async () => {
    write('packages/vue/src/components/ui/button/types.ts', `import x from 'left-pad'\n`)

    await expect(build()).rejects.toThrow(/'left-pad' is not declared/)
  })

  it('throws when files[] lists a composable', async () => {
    write('packages/vue/src/components/ui/button/_registry.ts', manifest('vue/button', [
      BUTTON_STYLES,
      { path: 'packages/vue/src/composables/useThing.ts', type: 'registry:ui', target: '@ui/button/useThing.ts' },
    ]))

    await expect(build()).rejects.toThrow(/auto-resolved via registryDependencies/)
  })

  it('requires ~/ targets on project-setup so it installs without components.json', async () => {
    write('packages/vue/src/setup/_registry.ts', `export default ${JSON.stringify({
      type: 'registry:item',
      name: 'vue/project-setup',
      files: [{ path: 'shared/styles/components/ui/button/styles.ts', type: 'registry:file', target: 'x.ts' }],
    })}\n`)

    await expect(build()).rejects.toThrow(/needs a '~\/\.\.\.' target/)
  })
})

describe('agent skill', () => {
  const SKILL_MANIFEST = 'packages/vue/src/skill/_registry.ts'

  function skillManifest(extra: object = {}) {
    write(SKILL_MANIFEST, `export default ${JSON.stringify({
      type: 'registry:item',
      name: 'vue/agent-skill',
      ...extra,
    })}\n`)
  }

  it('emits no item without a manifest', async () => {
    expect((await build()).items.map(i => i.name)).not.toContain('vue/agent-skill')
  })

  it('ships every file under skills/vue-ui, SKILL.md first, into .claude/skills', async () => {
    skillManifest()
    write('skills/vue-ui/references/switch.md', '# Switch\n')
    write('skills/vue-ui/references/button.md', '# Button\n')
    write('skills/vue-ui/SKILL.md', '---\nname: vue-ui\n---\n')

    const skill = item(await build(), 'vue/agent-skill')

    expect(skill.files).toEqual([
      { path: 'skills/vue-ui/SKILL.md', type: 'registry:file', target: '~/.claude/skills/vue-ui/SKILL.md' },
      { path: 'skills/vue-ui/references/button.md', type: 'registry:file', target: '~/.claude/skills/vue-ui/references/button.md' },
      { path: 'skills/vue-ui/references/switch.md', type: 'registry:file', target: '~/.claude/skills/vue-ui/references/switch.md' },
    ])
    expect(skill.dependencies).toBeUndefined()
    expect(skill.registryDependencies).toBeUndefined()
  })

  it('throws when the manifest declares files[]', async () => {
    skillManifest({ files: [{ path: 'skills/vue-ui/SKILL.md', type: 'registry:file', target: '~/x.md' }] })
    write('skills/vue-ui/SKILL.md', '')

    await expect(build()).rejects.toThrow(/declares files\[\]/)
  })

  it('throws when SKILL.md is missing', async () => {
    skillManifest()

    await expect(build()).rejects.toThrow(/SKILL\.md does not exist/)
  })
})

/** Rewrites the button fixture's manifest with the component field pair. */
function buttonTier(value: string) {
  write(
    'packages/vue/src/components/ui/button/_registry.ts',
    manifest('vue/button', [BUTTON_STYLES], tier(value)),
  )
}

/** A portal component: an Ark machine, a Positioner and a Teleport. */
function writePopover(declared: string) {
  const ui = 'packages/vue/src/components/ui/popover'
  write(`${ui}/_registry.ts`, manifest('vue/popover', [], tier(declared, ['overlay'])))
  write(`${ui}/PopoverContent.vue`, [
    '<script setup lang="ts">',
    `import { Popover } from '@ark-ui/vue/popover'`,
    '</script>',
    '',
    '<template>',
    '  <Teleport to="body">',
    '    <Popover.Positioner>',
    '      <slot />',
    '    </Popover.Positioner>',
    '  </Teleport>',
    '</template>',
  ].join('\n'))
}

describe('tier gate', () => {
  it('passes when the declared tier matches the source', async () => {
    buttonTier('T1')

    await expect(build()).resolves.toBeDefined()
  })

  it('fails when the declared tier is lower than the source implies', async () => {
    buttonTier('T1')
    write('packages/vue/src/components/ui/button/types.ts', [
      `import { Switch } from '@ark-ui/vue/switch'`,
      'export interface ButtonProps { switch?: typeof Switch }',
    ].join('\n'))

    await expect(build()).rejects.toThrow(/meta\.tier is 'T1' but the source derives T2 \(an Ark machine import/)
  })

  it('reads the bare Ark barrel by binding, so the factory stays T1', async () => {
    buttonTier('T1')

    await expect(build()).resolves.toBeDefined()

    write('packages/vue/src/components/ui/button/types.ts', [
      `import { Switch } from '@ark-ui/vue'`,
      'export interface ButtonProps { switch?: typeof Switch }',
    ].join('\n'))

    await expect(build()).rejects.toThrow(/'Switch' imported from the '@ark-ui\/vue' barrel/)
  })

  it('counts a machine reached through a re-export', async () => {
    buttonTier('T1')
    write(
      'packages/vue/src/components/ui/button/index.ts',
      `export { useSwitch } from '@ark-ui/vue/switch'\n`,
    )

    await expect(build()).rejects.toThrow(/derives T2/)
  })

  it('counts a use*Context() call', async () => {
    buttonTier('T1')
    write('packages/vue/src/components/ui/button/types.ts', [
      'declare function useSwitchContext(): { checked: boolean }',
      'export const state = useSwitchContext()',
    ].join('\n'))

    await expect(build()).rejects.toThrow(/a useSwitchContext\(\) call/)
  })

  it('reads a Positioner off the template', async () => {
    writePopover('T2')

    await expect(build()).rejects.toThrow(/meta\.tier is 'T2' but the source derives T3 \(a Positioner in PopoverContent\.vue\)/)
  })

  // Ark teleports at runtime, so the predecessor's `dialog`, `drawer`,
  // `sheet` and `navigation-menu` are all T3 with no `Teleport` in sight.
  it('reads a Positioner that is never wrapped in a Teleport', async () => {
    const ui = 'packages/vue/src/components/ui/popover'
    write(`${ui}/_registry.ts`, manifest('vue/popover', [], tier('T2', ['overlay'])))
    write(`${ui}/PopoverContent.vue`, [
      '<script setup lang="ts">',
      `import { Popover } from '@ark-ui/vue/popover'`,
      '</script>',
      '',
      '<template>',
      '  <Popover.Positioner><slot /></Popover.Positioner>',
      '</template>',
    ].join('\n'))

    await expect(build()).rejects.toThrow(/derives T3 \(a Positioner/)
  })

  it('reads a Teleport that uses no Positioner', async () => {
    const ui = 'packages/vue/src/components/ui/popover'
    write(`${ui}/_registry.ts`, manifest('vue/popover', [], tier('T2', ['overlay'])))
    write(`${ui}/PopoverContent.vue`, [
      '<template>',
      '  <Teleport to="body"><slot /></Teleport>',
      '</template>',
    ].join('\n'))

    await expect(build()).rejects.toThrow(/derives T3 \(a Teleport/)
  })

  it('ignores evidence that only a spec or an example carries', async () => {
    buttonTier('T1')
    write(
      'packages/vue/src/components/ui/button/Button.spec.ts',
      `import { Switch } from '@ark-ui/vue/switch'\n`,
    )
    write('packages/vue/src/components/ui/button/examples/Demo.vue', [
      '<template>',
      '  <Teleport to="body"><Popover.Positioner /></Teleport>',
      '</template>',
    ].join('\n'))

    await expect(build()).resolves.toBeDefined()
  })

  it('allows T4, the judgement call, on a source that derives T1', async () => {
    buttonTier('T4')

    await expect(build()).resolves.toBeDefined()
  })

  it('allows any other tier above the derived one', async () => {
    buttonTier('T3')

    await expect(build()).resolves.toBeDefined()
  })

  it('inherits the derived tier of a component it imports', async () => {
    writePopover('T3')
    buttonTier('T1')
    write(
      'packages/vue/src/components/ui/button/types.ts',
      `import '@/components/ui/popover'\nexport interface ButtonProps {}\n`,
    )

    await expect(build()).rejects.toThrow(/derives T3 \(inherited from vue\/popover, T3\)/)
  })

  it('caps inheritance at T3, so a T4 judgement call does not propagate', async () => {
    writePopover('T4')
    buttonTier('T3')
    write(
      'packages/vue/src/components/ui/button/types.ts',
      `import '@/components/ui/popover'\nexport interface ButtonProps {}\n`,
    )

    await expect(build()).resolves.toBeDefined()
  })

  it('terminates on an import cycle', async () => {
    writePopover('T3')
    buttonTier('T1')
    write(
      'packages/vue/src/components/ui/button/types.ts',
      `import '@/components/ui/popover'\nexport interface ButtonProps {}\n`,
    )
    write(
      'packages/vue/src/components/ui/popover/types.ts',
      `import '@/components/ui/button'\nexport interface PopoverProps {}\n`,
    )

    await expect(build()).rejects.toThrow(/derives T3/)
  })

  it('exempts an infrastructure item carrying neither field', async () => {
    const ui = 'packages/vue/src/components/ui/icons'
    write(`${ui}/_registry.ts`, manifest('vue/icons'))
    write(`${ui}/index.ts`, `export { X } from '@lucide/vue'\n`)
    write('packages/vue/package.json', JSON.stringify({
      dependencies: { 'cn': '0.3.0', '@ark-ui/vue': '^5.0.0', '@lucide/vue': '^1.0.0', 'vue': '^3.5.0' },
    }))

    await expect(build()).resolves.toBeDefined()
  })

  it('fails when categories is declared without meta.tier', async () => {
    write(
      'packages/vue/src/components/ui/button/_registry.ts',
      manifest('vue/button', [BUTTON_STYLES], { categories: ['actions'] }),
    )

    await expect(build()).rejects.toThrow(/has categories but no meta\.tier/)
  })

  it('fails when meta.tier is declared without categories', async () => {
    write(
      'packages/vue/src/components/ui/button/_registry.ts',
      manifest('vue/button', [BUTTON_STYLES], { meta: { tier: 'T1' } }),
    )

    await expect(build()).rejects.toThrow(/has meta\.tier but no categories/)
  })

  it('fails on an unrecognised tier value', async () => {
    buttonTier('T5')

    await expect(build()).rejects.toThrow(/expected one of T1, T2, T3, T4/)
  })
})

describe('component graph', () => {
  it('gives every component a row with both tiers', async () => {
    buttonTier('T1')

    expect(await graph()).toContain('| `vue/button` | T1 | T1 |')
  })

  it('records composition in both directions', async () => {
    writePopover('T3')
    buttonTier('T3')
    write(
      'packages/vue/src/components/ui/button/types.ts',
      `import '@/components/ui/popover'\nexport interface ButtonProps {}\n`,
    )

    const rows = (await graph()).split('\n')

    expect(rows.find(row => row.startsWith('| `vue/button`'))).toContain('`vue/popover`')
    expect(rows.find(row => row.startsWith('| `vue/popover`'))).toContain('| `vue/button` |')
  })

  it('shows em dashes for an infrastructure item', async () => {
    const ui = 'packages/vue/src/components/ui/icons'
    write(`${ui}/_registry.ts`, manifest('vue/icons'))
    write(`${ui}/index.ts`, 'export const icons = {}\n')

    expect(await graph()).toContain('| `vue/icons` | — | — | — | — |')
  })

  it('is deterministic', async () => {
    buttonTier('T1')

    expect(await graph()).toBe(await graph())
  })
})
