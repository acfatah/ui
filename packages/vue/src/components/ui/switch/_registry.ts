import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/switch',
  title: 'Switch',

  description: html`
    A control that allows the user to toggle between checked and not checked.

    References:
    - Headless API: https://ark-ui.com/docs/components/switch
    - shadcn/ui: https://ui.shadcn.com/docs/components/switch
  `,

  categories: [
    'form',
  ],

  dependencies: [
    '@ark-ui/vue',
    '@vueuse/core',
    'cn',
  ],

  files: [
    {
      path: 'shared/styles/components/ui/switch/styles.ts',
      type: 'registry:ui',
      target: '@ui/switch/styles.ts',
    },
  ],

  meta: {
    /**
     * Test depth tier. Governs the spec and demo contract this component
     * must meet. See README.md, "Test depth is tiered".
     *
     * T2: an Ark state machine (`Switch` from `@ark-ui/vue/switch`),
     * rendered in flow with no portal. State matrix plus one spec on the
     * toggle flow.
     */
    tier: 'T2',
  },
} satisfies RegistryItem

export default registryItem
