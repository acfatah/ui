import vue from '@astrojs/vue'
import nimbus, {
  defineConfig as defineNimbusConfig,
} from '@cloudflare/nimbus-docs'
import { tableScroll } from '@cloudflare/nimbus-docs/markdown'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

import { packageAlias } from './plugins/package-alias'
import { registrySidebar } from './src/lib/registry-sidebar'

const vueSrc = fileURLToPath(new URL('../../packages/vue/src', import.meta.url))
const sharedDir = fileURLToPath(new URL('../../shared', import.meta.url))

const nimbusConfig = defineNimbusConfig({
  // Canonical origin (no trailing slash). Drives canonical URLs, OG image
  // URLs, robots.txt, sitemap and /llms.txt links. Local-only for now; set
  // the real origin before any deploy.
  site: 'http://localhost:4321',
  title: 'acfatah/ui',
  description: 'Accessible Vue 3 components on Ark UI, styled with Tailwind CSS v4, distributed as a shadcn registry.',
  locale: 'en',
  github: null,
  socialImageAlt: 'acfatah/ui documentation preview',
  // Components are grouped by the `categories` in each `_registry.ts`.
  sidebar: {
    items: [
      {
        label: 'Getting started',
        items: ['introduction', 'installation'],
      },
      ...(await registrySidebar(`${vueSrc}/components/ui`)),
    ],
  },
})

export default defineConfig({
  // nimbus:adapter
  output: 'static',
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [packageAlias(vueSrc), tailwindcss()],
    resolve: {
      alias: { '~shared': sharedDir },
      // One Vue runtime for the islands and the package they import, or
      // provide/inject across the boundary silently breaks.
      dedupe: ['vue'],
    },
    // Keep Nimbus's Markdown engine out of the prerender bundle. Inlined,
    // its native-binding lookup runs from `dist/` and misses the binding
    // under Bun's isolated linker. Pairs with `publicHoistPattern` in the
    // root `bunfig.toml`.
    environments: {
      prerender: {
        resolve: { external: ['satteri', 'satteri-source-parser'] },
      },
    },
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    vue(),
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        'nimbus/frontmatter-shape': 'error',
        'nimbus/internal-link': 'error',
      },
      // Wrap wide tables so they scroll instead of overflowing the page
      // (styled by `.nb-table-scroll` in src/styles/prose.css).
      markdown: {
        hastPlugins: [tableScroll()],
      },
    }),
  ],
})
