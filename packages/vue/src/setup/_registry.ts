import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:item',
  name: 'vue/project-setup',
  title: 'Project Setup',

  description: html`
    The shadcn config and shared token layer. Run once in a fresh Vue
    project, before adding any component.
  `,

  dependencies: [
    'tailwindcss',
    'tw-animate-css',
  ],

  devDependencies: [
    '@tailwindcss/vite',
  ],

  /*
    Every target starts with `~/`, so this item is universal: it installs
    into a project that has no components.json yet, then ships the one
    every later item resolves its `@ui/` and `@hooks/` targets through.

    components.json is read by the `shadcn` CLI, not `shadcn-vue`, so it
    follows the shadcn schema. `aliases.hooks` is where composables land;
    the CLI knows no `composables` alias and would silently drop one.
  */
  files: [
    {
      path: 'packages/vue/src/setup/components.json',
      type: 'registry:file',
      target: '~/components.json',
    },
    {
      path: 'shared/styles/global.css',
      type: 'registry:file',
      target: '~/src/styles/global.css',
    },
  ],
} satisfies RegistryItem

export default registryItem
