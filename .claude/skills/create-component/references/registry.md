# Create _registry.ts

Analyze the components in the given directory (or directories) and create a
`_registry.ts` file for each using the Accordion pattern below as reference.
Skip all tests. Use spaces instead of tabs.

## How an item is assembled

The registry build scans each component directory and derives the item from
what it finds:

- Every file in the component directory becomes an item `file`,
  automatically, **except the three kinds below**. Do NOT list the
  component's own `.vue` / `index.ts` / `types.ts` files.
- `import` statements become `dependencies` (npm packages) and
  `registryDependencies` (other registry items).
- `_registry.ts` supplies metadata only.

### Never an item file

Three things live in a component directory and must never reach a
consumer. The build excludes them; nothing may list them in `files[]`.

| Excluded | Why |
| --- | --- |
| A one-line styles re-export | It imports an alias the consumer does not have. The resolved shared file ships instead — see "Shared styles". |
| `*.spec.ts` | A browser-mode spec pulls `vitest`, `vitest-browser-vue` and Playwright into a project that installed a button. |
| `examples/**` | Demo SFCs for the docs site. They import sibling components and icons the consumer did not ask for, and the consumer wants the component, not its catalogue. |

Verify this, do not assume it. The predecessor's build
(`packages/registry/src/cli/commands/build/build-ui-registry.ts`) walks
the directory flat — `if (!dirent.isFile()) continue` — so it skips
`examples/` by accident rather than by rule, and it has **no `.spec.ts`
filter at all**. That never mattered there, because the predecessor has
zero colocated component specs. `acfatah/ui` has one per component, so a
build ported from that source ships it. The exclusions above are the
rule; the flat walk is not.

Composables and libs are their own registry items. A component that imports
one gets it through `registryDependencies`, and shadcn v4 flattens those
files into the install. Listing it in `files[]` as well double-ships the
same file and goes stale when the component stops importing it — so the
build **throws** if a `files[]` entry points at a composable or lib path.

`files[]` is only for files the scanner cannot see. That is rare; usually
omit it entirely. The two cases are a component-local stylesheet shipped
with an explicit `registry:file` type, and a shared styles file (see
"Shared styles").

> The concrete implementation of this model — the build scripts, the
> generated dependency addresses and the thrown error text — is documented
> in the registry repository's own `docs/`, verified there against
> `shadcn@4.11.0`. Reconcile against that repo if the behaviour surprises
> you.

## Item names

`name` is the install address after `<owner>/<repo>/`, so it is a public
contract: renaming it breaks every command a consumer wrote down.

- Match the siblings. A target laid out per framework prefixes every item
  with its framework — components, composables and libs alike:
  `vue/accordion`, addressed as `acfatah/ui/vue/accordion`. A
  single-framework target uses bare names (`accordion`).
- Write the full name in `_registry.ts`. The build does not add the
  prefix, so names stay greppable.
- `registryDependencies` use the same full names.

## Categories and tier

Two metadata fields every component item carries.

`categories` groups the docs navigation. Pick from the target's own set —
discover it from the siblings, do not invent a value:

```bash
grep -rh -A6 "categories:" <target>/src --include=_registry.ts | head -30
```

`acfatah/ui` uses seven: `form`, `actions`, `navigation`, `overlay`,
`data-display`, `feedback`, `layout`. Membership is not exclusive; a
component that genuinely serves two domains lists both (`calendar` is
`form` and `data-display`). Never put a tier in here — categories answer
"what is this for", the tier answers "how deep do its tests go", and the
docs sidebar only ever reads categories.

`meta.tier` records the test-depth tier. It goes in `meta` because it is
ours, not part of the shadcn schema (`meta` is `Record<string, any>`,
`categories` is `string[]`; both optional, verified against
`shadcn@4.21.0` `dist/schema/index.d.ts`).

Derive the tier from the component you just wrote:

| Tier | Test | Contract |
| --- | --- | --- |
| T1 | no Ark state machine, no portal | variants and sizes only, no interaction spec |
| T2 | a state machine, renders in flow | state matrix, one spec on the primary flow |
| T3 | state machine plus `Positioner` + `Teleport` | T2 plus open, placement, dismiss, and assert the teleported content rendered |
| T4 | composite, or a high-surface / async / control-collection widget | T3 plus domain states, edge cases, one spec per core sub-flow |

Classify the portal from the **component source**, not from whether a demo
uses `Teleport` — most overlays let Ark teleport at runtime, so a demo is
not evidence.

T1 to T3 are mechanical, so do not guess them: read the imports. **T4 is
not** — it is a judgement call in both halves. Importing one component
does not make a component T4; `command` imports `dialog` and is T3
*because* of it, inheriting that portal's focus trap. T4 is for
assembling several (`sidebar` takes `button`, `input`, `sheet` and
`tooltip`) or for a high-surface, async or control-collection widget.

Declaring a tier *higher* than the source implies is allowed and needs no
justification; declaring one *lower* is the bug, because it silently
drops the specs that tier owes.

The tier is assigned when the component is created, never retro-fitted.
Full model and the per-tier spec contract: the target's own `README.md`,
"Test depth is tiered" in `acfatah/ui`. The reasoning behind it may live
outside the repository; the README is what travels with a clone.

## Shared styles

Applies when the component's `styles.ts` is a one-line re-export of a
shared source directory (`acfatah/ui`: `~shared/*` → `shared/`).

- **The re-export is never an item file.** Shipping it gives the consumer
  an import of an alias they do not have.
- **The resolved shared file is.** It ships with a `target` beside the
  component, so the consumer's `import ... from './styles'` resolves:

  ```ts
  files: [
    {
      path: 'shared/styles/components/ui/accordion/styles.ts',
      type: 'registry:ui',
      target: 'components/ui/accordion/styles.ts',
    },
  ],
  ```

- **An alias import is never a dependency.** It resolves to source that
  is copied, not to an npm package or another item.

Until the build CLI exists and enforces this, state the intended entry
explicitly as above. Once it derives the entry from the re-export, drop
the explicit `files[]` and follow the build. Where `target` lands in a
consumer's project is verified from CLI source only; confirm with
`shadcn add … --dry-run` against a pushed branch before relying on it.

## Rules

- `_registry.ts` carries metadata only (see above), plus the shared
  styles entry while the build cannot derive it.
- `name` carries the target's framework prefix (see "Item names").
- `categories` and `meta.tier` are both required (see "Categories and
  tier"). A component item with neither is incomplete.
- Never list a composable or lib path in `files[]`. The build throws.
- Never list a `.spec.ts` or anything under `examples/` in `files[]`.
  See "Never an item file".
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
  name: 'vue/accordion',
  title: 'Accordion',

  description: html`
    A vertically stacked set of interactive headings that each reveal a section of content.

    References:
    - Headless API: https://ark-ui.com/docs/components/accordion
    - shadcn/ui: https://ui.shadcn.com/docs/components/accordion
  `,

  categories: [
    'layout',
  ],

  dependencies: [
    '@ark-ui/vue',
    '@vueuse/core',
    'cn',
  ],

  meta: {
    // Ark state machine, renders in flow, no portal.
    tier: 'T2',
  },

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

Note the `vue/` prefix, `cn` in `dependencies` and no icon package, even
though this component renders a chevron. In a shared-styles target, add
the `files[]` entry from "Shared styles" above.

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
`styles.ts`: a colocated `styles.ts` is scanned like any other source file
and is never listed; a shared one follows "Shared styles" above.

## After writing it

Run the target repository's registry build and confirm the new item's
`registryDependencies` lists the composables, libs and icons module you
imported, with the framework prefix, and that its `files` contain the
shared styles file and not the re-export. If a dependency is missing, the
scanner does not recognise that import prefix — fix the import path or the
scanner, not the manifest. If the target has no registry build yet, say so
and stop there.
