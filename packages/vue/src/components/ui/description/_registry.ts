import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'vue/description',
  title: 'Description',

  description: html`
    Supporting text that gives a control, title or heading more context.

    Other components wrap it for their own description part, such as
    <code>Switch.Description</code>, so help text looks the same across the
    UI. Each wrapper sets its own <code>data-scope</code> and
    <code>data-part</code>.

    References:
    - Headless API: https://ark-ui.com/docs/guides/composition#the-ark-factory
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
      path: 'shared/styles/components/ui/description/styles.ts',
      type: 'registry:ui',
      target: '@ui/description/styles.ts',
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
