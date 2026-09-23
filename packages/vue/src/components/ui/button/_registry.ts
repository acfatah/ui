import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/button',
  title: 'Button',

  description: html`
    Displays a button or a component that looks like a button.

    References:
    - Headless API: https://ark-ui.com/docs/guides/composition#the-ark-factory
    - shadcn/ui: https://ui.shadcn.com/docs/components/button
  `,

  categories: [
    'actions',
    'form',
  ],

  dependencies: [
    '@ark-ui/vue',
    'cn',
  ],

  files: [
    {
      path: 'shared/styles/components/ui/button/styles.ts',
      type: 'registry:ui',
      target: '@ui/button/styles.ts',
    },
  ],

  meta: {
    /**
     * Test depth tier. Governs the spec and demo contract this component
     * must meet. See README.md, "Test depth is tiered".
     *
     * T1: no Ark state machine, no portal. Variant and size demos only.
     */
    tier: 'T1',
  },
} satisfies RegistryItem

export default registryItem
