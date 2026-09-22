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

function manifest(name: string, files: object[] = []) {
  return `export default ${JSON.stringify({ type: 'registry:ui', name, files })}\n`
}

const BUTTON_STYLES = {
  path: 'shared/styles/components/ui/button/styles.ts',
  type: 'registry:ui',
  target: '@ui/button/styles.ts',
}

function build() {
  return buildRegistry({
    rootDir: root,
    packageDir: path.join(root, 'packages/vue'),
    prefix: 'vue',
    namespace: 'acme/ui',
    name: 'ui',
    homepage: 'https://github.com/acme/ui',
  })
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
