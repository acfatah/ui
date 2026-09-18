---
name: migrate-component
description: Update an existing registry ui component to the current authoring conventions (data-scope/data-part attributes, typed Props interface, classes moved to styles.ts, namespace.ts, _registry.ts, alphabetized imports). Ports from shadcn React/Vue or older registry conventions without changing behavior. Takes the target components directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [ComponentName]"
---

# Migrate component from shadcn React or Vue

Update one or more components in the target registry's `components/ui/`
directory to conform to the current conventions. Use the
`create-component` skill for the target patterns before starting.

## 0. Establish the target

This skill is repo-agnostic. It edits nothing until it knows where.

1. **Target directory and component name** come from the arguments
   (`[target-dir] [ComponentName]`). If either is missing, ask. Do not
   guess, and do not assume `packages/registry` or `packages/vue` — each
   path belongs to one specific repository.
2. **Discover what the target actually provides:**

   ```bash
   ls <target>/src/components/ui/<name>/
   ls <target>/src/components/ui/icons/
   cat <target>/tsconfig.json          # confirm the @/ alias
   grep -rh "name:" <target>/src --include=_registry.ts | head -3
   ```

   The last line settles the **item-name prefix** the siblings use
   (`vue/button` or bare `button`).
3. **Resolve where the class strings go**, using a sibling that is
   already on current conventions:

   ```bash
   cat <target>/src/components/ui/<sibling>/styles.ts
   grep -A4 '"paths"' <target>/tsconfig.json
   ```

   | Layout | Component's `styles.ts` | Real class strings | Example |
   | --- | --- | --- | --- |
   | Shared source directory | one line, `export * from '<alias>/…'` | the file the alias resolves to through tsconfig `paths` | `acfatah/ui` (`~shared/*`) |
   | Colocated | the class strings themselves | that file | — |
   | `cva` | absent, `variant.ts` instead | `variant.ts` | `shadcn-vue-ark` |

   The `cva` row is what a migration moves *from*. The destination is
   whichever of the first two the target's migrated siblings use. If no
   sibling is migrated yet, ask.
4. **Read the target repo's own `CLAUDE.md`, `README.md` and `docs/`** if
   present, walking up from the target to the repository root. A
   repository's own conventions win over this skill wherever they differ.

## Current conventions to enforce

### 1. Data attributes

Replace `data-slot` with the two-attribute pattern:

```diff
- data-slot="trigger"
+ data-scope="accordion" data-part="trigger"
```

- `data-scope` = component name in kebab-case (matches the Ark UI component name
  or a custom name for non-Ark components)
- `data-part` = the sub-element role in kebab-case

### 2. Props interface

Move inline prop types to a typed `Props` interface if not already done:

```diff
- defineProps<{ class?: HTMLAttributes['class']; size?: 'sm' | 'md' }>()
+ interface Props {
+   class?: HTMLAttributes['class']
+   size?: 'sm' | 'md'
+ }
+
+ defineProps<Props>()
```

### 3. Class strings and variants

No Tailwind class strings stay in templates, and no variant library is used.
Move everything into the styles file §0 resolved, as plain TypeScript, and
compose with `cn` from the `cn` package. A pre-existing `variant.ts` is
deleted, not renamed.

In a **shared source directory** target that is two files: the class
strings go into the shared file
(`acfatah/ui`: `shared/styles/components/ui/<name>/styles.ts`), and the
component directory gets a one-line re-export through the alias so the
SFC keeps importing `./styles`:

```ts
export * from '~shared/styles/components/ui/<name>/styles'
```

Never write class strings into the re-export; it is not published and
they would never reach a consumer. In a **colocated** target, write
`styles.ts` in the component directory.

A part with no variants becomes a plain string export; a part with variants
becomes an object with `base` plus one record per axis. Naming is
`<componentName><Part>Styles`, one export per part.

```diff
- // inside Button.vue
- const buttonVariants = cva('inline-flex ...', {
-   variants: { variant: {...}, size: {...} },
-   defaultVariants: { variant: 'default', size: 'md' },
- })

+ // button/styles.ts
+ export const buttonStyles = {
+   base: 'inline-flex ...',
+   variant: { default: '...', outline: '...' },
+   size: { sm: '...', md: '...' },
+ }
```

Defaults move to `withDefaults` in the SFC; `defaultVariants` has no
equivalent in `styles.ts`. Variant types move to `types.ts` as
`keyof typeof buttonStyles.variant`, replacing `VariantProps`. A
`compoundVariants` block becomes an explicit `computed` in the SFC appended
to the `cn(...)` call - there is no `compoundVariants` key.

See the `create-component` skill, section 3, for the full rules.

### 4. Namespace exports

If a complex component has no `namespace.ts`, create one (see the
`create-component` skill, `references/namespace.md`). If `index.ts` does not
re-export the namespace object, add it.

### 5. _registry.ts

If `_registry.ts` is missing or outdated, create or update it (see the
`create-component` skill, `references/registry.md`). Two migration-specific
checks:

- **Name.** Give `name` the framework prefix the siblings carry
  (`accordion` becomes `vue/accordion`). Rename only in a target that is
  pre-release or already prefixed; a published name is a consumer's
  install address, so otherwise flag it and ask.
- **Shared styles.** Ship the resolved shared file with a `target` beside
  the component, never the re-export (`references/registry.md`, "Shared
  styles").

### 6. Icons and cn

Replace any direct icon-package import with the icons module, and any
`@/lib/utils` cn import with the package:

```diff
- import { ChevronDownIcon } from 'lucide-vue-next'
- import { cn } from '@/lib/utils'
+ import { cn } from 'cn'
+ import { ChevronDownIcon } from '@/components/ui/icons'
```

If the icons module does not yet re-export the icon you need, add it there
rather than importing the package in the component.

### 7. Import order

Ensure imports follow the project's alphabetized order (enforced by ESLint):
1. Type imports (`import type ...`)
2. External packages
3. Internal aliases (`@/...`)
4. Relative imports (`./...`)

## Steps

1. Establish the target (section 0), then read all `.vue` files and
   `index.ts` in the given component directory.
2. Identify which conventions above are violated.
3. Apply fixes file by file, smallest change first.
4. If a `namespace.ts` is missing, follow `references/namespace.md` in the
   `create-component` skill.
5. If `_registry.ts` is missing or stale, follow `references/registry.md` in the
   `create-component` skill.
6. Run the target's formatter over the component directory as the final
   step (commonly `bun run format {component-directory}` from the target
   package root).
7. Run the target's typecheck to verify no type errors. A shared styles
   file sits outside the package, so lint it with the config that covers
   it (`acfatah/ui`: the root `bun run lint`).

## Notes

- Do not change component behavior - only update structure and naming.
- Use `context7` to verify Ark UI prop names before renaming.
- If unsure whether a `data-scope` name is correct, use the Ark UI component
  name (kebab-case) and cross-check sibling components in
  the sibling directories under `components/ui/`. Parts carry their classes
  in the styles file, not via `data-scope` selectors in `global.css`.
