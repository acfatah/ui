# Create _registry.ts

Analyze the components in the given directory (or directories) and create a
`_registry.ts` file for each using the Accordion pattern below as reference.
Skip all tests. Use spaces instead of tabs.

## How an item is assembled

The registry build scans each component directory and derives the item from
what it finds:

- Every file in the component directory becomes an item `file`,
  automatically. Do NOT list the component's own `.vue` / `index.ts` /
  `types.ts` / `styles.ts` files.
- `import` statements become `dependencies` (npm packages) and
  `registryDependencies` (other registry items).
- `_registry.ts` supplies metadata only.

Composables and libs are their own registry items. A component that imports
one gets it through `registryDependencies`, and shadcn v4 flattens those
files into the install. Listing it in `files[]` as well double-ships the
same file and goes stale when the component stops importing it — so the
build **throws** if a `files[]` entry points at a composable or lib path.

`files[]` is only for files the scanner cannot see. That is rare; usually
omit it entirely. The one live example is a component-local stylesheet
shipped with an explicit `registry:file` type.

> The concrete implementation of this model — the build scripts, the
> generated dependency addresses and the thrown error text — is documented
> in the registry repository's own `docs/`, verified there against
> `shadcn@4.11.0`. Reconcile against that repo if the behaviour surprises
> you.

## Rules

- `_registry.ts` carries metadata only (see above).
- Never list a composable or lib path in `files[]`. The build throws.
- `dependencies` is only for npm packages the import scanner cannot infer
  (e.g. `tw-animate-css`).
- **Do not list the icon npm package.** Components import
  `@/components/ui/icons`, which resolves as its own registry item, and
  that item names the icon package. Naming it per-component would put the
  package back in every manifest and make swapping icon sets an edit to all
  of them — the exact coupling the icons module removes.
- For custom CSS the component needs (a `@utility` class, `@keyframes`, or a
  `--animate-*` / theme token) use `cssVars` + `css` (Tailwind v4), NOT a
  `tailwind.config` block. Never hardcode it in a shared `global.css` and
  rely on it being there - see "Component-owned CSS" below.

## Pattern (Accordion example)

```ts
import type { RegistryItem } from 'shadcn/schema'

import { html } from 'common-tags'

export const registryItem = {
  type: 'registry:ui',
  name: 'accordion',
  title: 'Accordion',

  description: html`
    A vertically stacked set of interactive headings that each reveal a section of content.

    References:
    - Headless API: https://ark-ui.com/docs/components/accordion
    - shadcn/ui: https://ui.shadcn.com/docs/components/accordion
  `,

  dependencies: [
    '@ark-ui/vue',
    '@vueuse/core',
    'cn',
  ],

  cssVars: {
    theme: {
      '--animate-accordion-down': 'accordion-down 0.25s ease-out',
      '--animate-accordion-up': 'accordion-up 0.25s ease-out',
    },
  },

  css: {
    '@keyframes accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--height)' },
    },
    '@keyframes accordion-up': {
      from: { height: 'var(--height)' },
      to: { height: '0' },
    },
  },
} satisfies RegistryItem

export default registryItem
```

Note `cn` in `dependencies` and no icon package, even though this component
renders a chevron.

## Component-owned CSS (utilities, keyframes, tokens)

If a component depends on custom CSS, that CSS is the component's own concern:
ship it through the component's `css` / `cssVars` so `shadcn add <component>`
writes it into the consumer's stylesheet. Do NOT hardcode it in the registry's
shared `global.css` and assume it reaches the consumer - that file is the
registry's own base theme; a consumer who installs only your component (or
keeps their own `global.css`) will not get it, and the class silently no-ops.

Rules:

- **Each consumer is self-sufficient.** If two components use the same utility
  and neither depends on the other, declare it in BOTH `_registry.ts` files.
  Duplicate `@utility` blocks are idempotent on install. Example: `no-scrollbar`
  ships from both `scroll-area` and `time-picker` (`time-picker` does not depend
  on `scroll-area`).
- **Shape.** Nested objects become nested CSS. Keys containing `-`, `&`, or `::`
  must be quoted strings. `@utility <name>` and `@keyframes <name>` are valid
  top-level keys - shadcn's `css` schema is an open record, so any at-rule is
  allowed.

`@utility` class (the `no-scrollbar` case):

```ts
css: {
  '@utility no-scrollbar': {
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
},
```

Animation (the Accordion case above): `@keyframes` in `css`, the `--animate-*`
token in `cssVars.theme`.

Component-local stylesheet (rare): if the CSS is large or better kept in a file
(the `sonner` case), ship a component-local `styles.css` via `files[]` with an
explicit `registry:file` type plus a `css` `@import` entry, instead of an inline
`css` object. Note this is a stylesheet, distinct from the component's
`styles.ts`, which is scanned like any other source file and is never listed.

## After writing it

Run the target repository's registry build and confirm the new item's
`registryDependencies` lists the composables, libs and icons module you
imported. If one is missing, the scanner does not recognise that import
prefix — fix the import path or the scanner, not the manifest.
