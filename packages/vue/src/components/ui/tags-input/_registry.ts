import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/tags-input',
  title: 'Tags Input',

  description: html`
    A text input that turns what is typed into a list of removable, editable tags.

    References:
    - Headless API: https://ark-ui.com/docs/components/tags-input
    - shadcn-vue: https://www.shadcn-vue.com/docs/components/tags-input
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
      path: 'shared/styles/components/ui/tags-input/styles.ts',
      type: 'registry:ui',
      target: '@ui/tags-input/styles.ts',
    },
  ],

  meta: {
    /**
     * Test depth tier. Governs the spec and demo contract this component
     * must meet. See README.md, "Test depth is tiered".
     *
     * T4, declared above the derived T2 (an Ark state machine rendered in
     * flow, no portal). The judgement half of T4: a high-surface control
     * whose domain is a user-driven collection, with add, delete, edit,
     * paste and clear as separate sub-flows, plus max, duplicates,
     * validation and blur behaviour as domain states and empty, many and
     * overflow as edge cases. A T2 contract would test one flow of five.
     */
    tier: 'T4',
  },
} satisfies RegistryItem

export default registryItem
