import { betterTailwindcssPlugin, defineConfig, tailwind, typescript, vue } from '@acfatah/eslint-preset'

export default defineConfig(
  {
    formatters: true,
    vue: true,

    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/public/**',
      '**/tsconfig.*',
      'logs',
    ],
  },

  typescript,
  vue,
  tailwind,

  {
    plugins: {
      ...betterTailwindcssPlugin,
    },

    settings: {
      // https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/settings/settings.md
      //
      // `variables` is what lets the linter see class strings that live in
      // `styles.ts` rather than in a template. Each entry names a key whose
      // object values hold Tailwind classes, so `buttonStyles.variant` and
      // `buttonStyles.size` are linted like any `class` attribute.
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
        variables: [
          ['variant', [{ match: 'objectValues' }]],
          ['size', [{ match: 'objectValues' }]],
        ],
      },
    },
  },

  // Import grouping for `.vue` SFCs.
  //
  // The preset's `typescript` config scopes `perfectionist/sort-imports` to
  // `**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` only, so `.vue` files fall back to
  // the `@antfu/eslint-config` default, which uses `newlinesBetween: 'ignore'`.
  // Import order was therefore enforced but blank lines were not, letting the
  // separators drift. Pin them here: one blank line between groups, none
  // within a group.
  //
  //   1. types    - every `import type`, external then `@/` then relative
  //   2. packages - npm and builtin value imports
  //   3. alias    - `@/` value imports
  //   4. relative - `./` and `../` value imports
  {
    name: 'registry/vue-import-groups',
    files: ['**/*.vue'],
    rules: {
      'perfectionist/sort-imports': ['error', {
        ignoreCase: false,
        newlinesBetween: 1,
        partitionByComment: true,
        groups: [
          'type-import',
          { newlinesBetween: 0 },
          ['type-builtin', 'type-external'],
          { newlinesBetween: 0 },
          'type-internal',
          { newlinesBetween: 0 },
          ['type-parent', 'type-sibling', 'type-index'],
          ['value-builtin', 'value-external'],
          'value-internal',
          ['value-parent', 'value-sibling', 'value-index'],
          'side-effect',
          'ts-equals-import',
          'unknown',
        ],
      }],
    },
  },
)
