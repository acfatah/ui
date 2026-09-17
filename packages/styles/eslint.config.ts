import { betterTailwindcssPlugin, defineConfig, tailwind, typescript } from '@acfatah/eslint-preset'

export default defineConfig(
  {
    formatters: true,

    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/tsconfig.*',
      'logs',
    ],
  },

  typescript,
  tailwind,

  {
    plugins: {
      ...betterTailwindcssPlugin,
    },

    settings: {
      // https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/settings/settings.md
      //
      // `variables` is what lets the linter see class strings in `styles.ts`.
      // Each entry names a key whose object values hold Tailwind classes, so
      // `buttonStyles.variant` and `buttonStyles.size` are linted like any
      // `class` attribute.
      'better-tailwindcss': {
        entryPoint: 'src/global.css',
        variables: [
          ['variant', [{ match: 'objectValues' }]],
          ['size', [{ match: 'objectValues' }]],
        ],
      },
    },
  },
)
