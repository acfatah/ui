import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/button',
  title: 'Button',

  description: html`
    Displays a button or a component that looks like a button.

    References:
    - Headless API: https://ark-ui.com/docs/components/factory
    - shadcn/ui: https://ui.shadcn.com/docs/components/button
  `,

  dependencies: [
    '@ark-ui/vue',
    'cn',
  ],

  files: [
    {
      path: 'shared/styles/components/ui/button/styles.ts',
      type: 'registry:ui',
      target: 'components/ui/button/styles.ts',
    },
  ],
} satisfies RegistryItem

export default registryItem
