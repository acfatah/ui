import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/icons',
  title: 'Icons',

  description: html`
    The single icon indirection. Components import every icon from here,
    never from an icon package, so swapping icon sets is one edit.

    References:
    - Lucide: https://lucide.dev/guide/packages/lucide-vue
  `,

  /*
    The icon package is named here and nowhere else. A component that
    draws an icon takes this item as a registryDependency and does not
    repeat the package in its own manifest.
  */
  dependencies: [
    '@lucide/vue',
  ],

  /*
    No `categories` and no `meta.tier`, both of which are otherwise
    required. This is infrastructure, not a component: it has no
    component page (the docs cover it as a Getting started guide) and no
    behavioural surface to test, so a category would be invented and a
    tier would be meaningless. It also ships no
    `.spec.ts` for the same reason - a list of re-exports has nothing to
    assert beyond what the compiler already checks.
  */
} satisfies RegistryItem

export default registryItem
