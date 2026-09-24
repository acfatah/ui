import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:item',
  name: 'vue/agent-skill',
  title: 'Agent Skill',

  description: html`
    A Claude Code skill that teaches the project's AI agent how to use the
    installed components: the conventions, and a usage reference per
    component. Installs to .claude/skills/vue-ui/.
  `,

  /*
    No files[]: the build ships everything under skills/vue-ui/ with a
    '~/.claude/skills/vue-ui/...' target, so a reference added by
    `bun run skill:build` cannot be left out of the item.
  */
} satisfies RegistryItem

export default registryItem
