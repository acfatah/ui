import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/popover',
  title: 'Popover',

  description: html`
    Displays rich content in a floating layer, anchored to the element that opened it.

    References:
    - Headless API: https://ark-ui.com/docs/components/popover
    - shadcn/ui: https://ui.shadcn.com/docs/components/popover
  `,

  categories: [
    'overlay',
  ],

  /*
    tw-animate-css provides the enter and exit utilities on the content.
    No source file imports it, so the scanner cannot see it; the `css`
    entry below adds its import to the consumer's stylesheet, so the item
    does not rely on `vue/project-setup`'s global.css being in place.
  */
  dependencies: [
    '@ark-ui/vue',
    '@vueuse/core',
    'cn',
    'tw-animate-css',
  ],

  files: [
    {
      path: 'shared/styles/components/ui/popover/styles.ts',
      type: 'registry:ui',
      target: '@ui/popover/styles.ts',
    },
  ],

  css: {
    '@import "tw-animate-css"': {},
  },

  meta: {
    /**
     * Test depth tier. Governs the spec and demo contract this component
     * must meet. See README.md, "Test depth is tiered".
     *
     * T3: an Ark state machine (`Popover` from `@ark-ui/vue/popover`)
     * rendered through a portal (`Popover.Positioner` inside `Teleport`).
     * T2's state matrix plus open, placement, dismiss, an assertion that
     * the teleported content rendered, and axe against the open state.
     */
    tier: 'T3',
  },
} satisfies RegistryItem

export default registryItem
