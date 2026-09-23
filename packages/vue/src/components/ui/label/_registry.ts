import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/label',
  title: 'Label',

  description: html`
    Renders an accessible label associated with controls.

    References:
    - Headless API: https://ark-ui.com/docs/guides/composition#the-ark-factory
    - shadcn/ui: https://ui.shadcn.com/docs/components/label
  `,

  categories: [
    'form',
  ],

  dependencies: [
    '@ark-ui/vue',
    'cn',
  ],

  files: [
    {
      path: 'shared/styles/components/ui/label/styles.ts',
      type: 'registry:ui',
      target: '@ui/label/styles.ts',
    },
  ],

  meta: {
    /**
     * Test depth tier. Governs the spec and demo contract this component
     * must meet. See README.md, "Test depth is tiered".
     *
     * T1: no Ark state machine, no portal. No variant or size axes.
     */
    tier: 'T1',
  },
} satisfies RegistryItem

export default registryItem
