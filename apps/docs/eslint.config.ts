import { betterTailwindcssPlugin, defineConfig, tailwind, typescript } from '@acfatah/eslint-preset'

export default defineConfig(
  {
    formatters: true,
    astro: true,

    /*
      Lint only what this app authors. The rest is Nimbus starter and
      registry code, upgraded with `nimbus-docs diff --apply` and
      `nimbus-docs add --overwrite`; reformatting it would turn every
      upstream diff into noise.
    */
    ignores: [
      '**/dist/**',
      '**/.astro/**',
      '**/public/**',
      '**/tsconfig.*',
      'AGENT.md',
      'CLAUDE.md',
      'nimbus.json',
      'src/components/ui/**',
      'src/components/AgentDirective.astro',
      'src/components/Header.astro',
      'src/components/Render.astro',
      'src/components.ts',
      'src/content.config.ts',
      'src/content/**',
      'src/layouts/**',
      'src/lib/cn.ts',
      'src/pages/**',
      'src/styles/**',
      'src/utils/**',
    ],
  },

  typescript,
  tailwind,

  {
    plugins: {
      ...betterTailwindcssPlugin,
    },

    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
      },
    },
  },
)
