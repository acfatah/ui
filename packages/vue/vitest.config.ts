import type { PluginOption } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

/*
  Two projects, split by what the code under test actually has.

   - unit:       composables and lib modules. Logic, no DOM, so a plain
                 node environment is enough and is much faster.
   - components: every component spec, in a real Playwright-driven
                 browser. Browser mode exists to verify focus management,
                 portals and ARIA, which a simulated DOM cannot do
                 faithfully — that is the whole reason happy-dom and
                 `bun test` were rejected for components.
*/
export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(import.meta.dirname, './src'),
            '~shared': path.resolve(import.meta.dirname, '../../shared'),
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'src/composables/**/*.spec.ts',
            'src/lib/**/*.spec.ts',
          ],
        },
      },
      {
        plugins: [
          vue() as PluginOption,
          tailwindcss() as PluginOption,
        ],
        resolve: {
          alias: {
            '@': path.resolve(import.meta.dirname, './src'),
            '~shared': path.resolve(import.meta.dirname, '../../shared'),
            '~test': path.resolve(import.meta.dirname, './test'),
          },
        },
        // Pre-bundle axe-core so the first browser run does not reload
        // mid-test when Vite discovers it.
        optimizeDeps: {
          include: ['axe-core'],
        },
        test: {
          name: 'components',
          include: ['src/components/**/*.spec.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
