---
name: create-composable
description: Author a Vue composable (src/composables/use*.ts) or a pure helper (src/lib/*.ts, or inline in its component when the build does not package lib) in a shadcn registry — routing, full TS types, JSDoc, attribution, a colocated spec, and the barrel export. Takes the target package directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [moduleName]"
---

# Create composable

Authors one module in a shadcn registry built on Ark UI: either a reactive
composable under `src/composables/`, or a pure helper under `src/lib/`.
Section 2 decides which.

## 0. Establish the target

This skill is repo-agnostic. It writes nothing until it knows where.

1. **Target directory and module name** come from the arguments
   (`[target-dir] [moduleName]`). If either is missing, ask. Do not guess,
   and do not assume `packages/registry` or `packages/vue` —
   each path belongs to one specific repository.
2. **Discover what the target actually provides** before writing anything:

   ```bash
   ls <target>/src/composables/
   ls <target>/src/lib/
   cat <target>/tsconfig.json      # confirm the @/ alias
   grep -rh "name:" <target>/src --include=_registry.ts | head -3
   grep -rn "composables\|lib" <target>/scripts/registry/ 2>/dev/null
   ```

   The `name:` line settles the **item-name prefix**. A target laid out
   per framework (`acfatah/ui`: `packages/vue`) names every item
   `<framework>/<name>`, as in `vue/button`; a single-framework target
   (`shadcn-vue-ark`) uses bare names. Composables and libs follow the
   same prefix as the components beside them.

   The build-script grep settles **whether `src/lib/` is packaged** and
   which item type composables get. Today:

   | | `acfatah/ui` | `shadcn-vue-ark` |
   |---|---|---|
   | Composable item type | `registry:hook`, target `@hooks/…` | `registry:file` |
   | `src/lib/` packaged | **no** — `@/lib/x` fails the build | yes, `<name>-lib` |
   | `@/composables` barrel import | fails the build | pulls in every module |

   If the target has no build script to read, ask rather than guess.

3. **Read the target repo's own `CLAUDE.md`, `README.md` and `docs/`** if
   present, walking up from the target to the repository root. A
   repository's own conventions win over this skill wherever they differ.

Examples below use `@/` as the alias because both repositories use it.
Verify, don't assume.

## 1. Does it need writing at all?

In order, stopping at the first hit:

1. **The target already has it.** The two listings from section 0 are the
   inventory — there is no hardcoded list in this document, because it
   would be wrong for one repo and stale in the other.
2. **VueUse covers it.** Then use VueUse directly in the component. Do
   **not** wrap it. A wrapper adds a registry item, a file the consumer
   owns and a name to remember, and buys nothing.
3. **Neither.** Write the module.

Reimplementing a VueUse utility by hand is the worst of the three
outcomes. Components already import from `@vueuse/core`, so the dependency
is present regardless.

## 2. Which directory

First question: does it touch Vue's reactivity, or call
`getCurrentInstance` / `onMounted` / `provide`? Then it is a composable
and goes to `src/composables/`. Otherwise it is a pure helper, and where
it goes depends on whether the target's build packages `src/lib/` (§0).

| | `src/composables/` | `src/lib/` | inline in the component |
|---|---|---|---|
| When | reactive or lifecycle | pure, **and** the build packages `src/lib/` | pure, and it does not (`acfatah/ui`) |
| File | camelCase, `use<Thing>.ts` | kebab-case, `<thing>.ts` | `src/components/ui/<dir>/<thing>.ts` |
| Export | named, matches the file | named, matches the file | named, matches the file |
| Imported as | `@/composables/useThing` | `@/lib/thing` | `./thing` |
| Registry item | own item, per the build (§0) | own item, `<name>-lib` | none — ships with the component |

Composable and lib item names take the target's framework prefix where it
has one (§0): `vue/useForwardProps`.

`src/composables/` is `use*` only. A factory or a pure helper never goes
there, even when it feels like part of the same family — `createContext`
and `dynamic` are helpers, not composables.

### Inline helpers (`acfatah/ui`)

`acfatah/ui` does not package `src/lib/` yet, so a helper lives inside the
one component that needs it. The build ships every non-spec file in the
component directory as `registry:ui`, so it needs no `files[]` entry and
no registry item. Relative imports may not leave that directory — the
build rejects them.

A helper that only a composable needs goes in the composable's own file,
unexported. Non-`use*` files in `src/composables/` are not items and do
not ship.

A **second** consumer is the signal to teach the build to package
`src/lib/`, not to copy the helper into a second component.

### `src/lib/` (`shadcn-vue-ark`)

The case asymmetry is real and load-bearing: `useForwardProps.ts` sits
beside `format-bytes.ts`. Match the directory, not the neighbouring
directory.

> Known misfiling, do not copy: `shadcn-vue-ark` has
> `src/lib/use-fetch.ts`, which is reactive and belongs in
> `src/composables/`. It predates this rule.

Everything from section 3 onward applies to both directories.

## 3. Pattern

```ts
import type { Ref } from 'vue'
import { computed, toValue } from 'vue'

/**
 * Brief description of what this does.
 *
 * @param input - description of the parameter
 * @returns description of the return value
 */
export function useExample<T>(input: Ref<T> | T) {
  const value = computed(() => toValue(input))

  return {
    value,
  }
}
```

Rules:

- Named export, never default. The file name matches it exactly.
- Full TypeScript — declare generics and return types explicitly.
- A JSDoc block on the export, always.
- No side-effectful imports.

### Attribution

If the code is ported or adapted from another project, the JSDoc carries an
attribution block naming the project and linking the upstream file:

```ts
/**
 * <what it does>
 *
 * @param props - <…>
 * @returns <…>
 *
 * **Attribution to the Reka UI team**
 *
 * Source: https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/useForwardProps.ts
 */
```

Licence hygiene, and it tells the next reader where to check for upstream
fixes. Live example: `packages/vue/src/composables/useForwardProps.ts` in
`acfatah/ui`.

## 4. Registry packaging

Each composable (and, where the build packages it, each lib module) is
published as **its own registry item**, generated from the directory —
there is no per-module `_registry.ts` to write. An inline helper (§2) is
not an item; it ships as part of its component.

Consequences:

- **The filename is the registry address.** `@/composables/useForwardProps`
  becomes `<owner>/<repo>/<prefix>useForwardProps`, where `<prefix>` is
  the framework segment from §0 or empty. In `acfatah/ui` that is
  `acfatah/ui/vue/useForwardProps`. Renaming the file is a breaking change
  for every consumer who pinned it.
- **The item type is the build's call** (§0): `registry:hook` targeting
  `@hooks/…` in `acfatah/ui`, `registry:file` in `shadcn-vue-ark`.
- **A module is framework code, even a pure one.** Everything under a
  framework package gets that framework's prefix. A helper that genuinely
  has no framework in it still lives here until a second framework needs
  it; only then does it move to the target's shared source directory
  (`acfatah/ui`: `shared/`).
- **Never list a `src/composables/*` or `src/lib/*` path in a component's
  `_registry.ts` `files[]`.** A component that imports the module gets it
  through auto-discovered `registryDependencies`, and shadcn flattens those
  files into the install. Listing it as well double-ships the file — the
  build throws.
- **Components import the direct path.**

  ```ts
  import { useExample } from '@/composables/useExample'   // ✓ one item
  import { useExample } from '@/composables'              // ✗ the barrel
  ```

  The import scanner maps a path to an item. In `acfatah/ui` the barrel
  maps to nothing and the build fails; in `shadcn-vue-ark` the barrel is
  its own item and pulls every module into the consumer's install.
- **The registry is generated.** Adding a composable adds an item, so
  regenerate it (`acfatah/ui`: `bun run registry:build`, checked by
  `bun run registry:check`, which fails when `registry.json` is stale).

Full packaging model: `create-component`'s `references/registry.md`.

## 5. Barrel export

If the target has `src/composables/index.ts` (or `src/lib/index.ts`), add
the named export, alphabetized among its neighbours:

```ts
export { useExample } from './useExample'
```

`acfatah/ui` has no barrel; skip this step there. The barrel is for the
repository's own convenience. It is not how a component reaches the
module — see the direct-path rule above.

## 6. Test

A colocated spec is **required**, not optional:

```text
src/composables/
├── useExample.ts
└── useExample.spec.ts
```

An inline helper gets `<thing>.spec.ts` beside it in the component
directory; the build never ships `*.spec.ts`.

Plain Vitest, the `unit` project. Browser mode is for components, which
need a real DOM for focus, portals and ARIA; a composable is logic and does
not.

Shapes to copy, in `acfatah/ui` (`packages/vue/src/composables/`):
`useForwardProps.spec.ts` and `useForwardPropsEmits.spec.ts` (need a
mounted instance), `useEmitAsProps.spec.ts`. In `shadcn-vue-ark`
(`packages/registry/src/`): `composables/runIfFn.spec.ts` (pure function,
including `@ts-expect-error` cases for the type surface),
`lib/format-bytes.spec.ts`.

Cover the type surface too, not just the runtime — a generic that infers
wrongly is the failure mode these modules actually have.

## Steps

1. Establish the target and discover what it has (section 0).
2. Decide it needs writing at all (section 1).
3. Route to `src/composables/`, `src/lib/`, or inline (section 2).
4. Write the module with full types, JSDoc, and attribution if ported.
5. Write the colocated `.spec.ts`.
6. Add the barrel export if the target has one.
7. Do **not** touch any component's `_registry.ts`.
8. Run the target's formatter and typecheck over the new files — commonly
   `bun run format <path>` and `bun run typecheck` from the target package
   root.
9. Regenerate the registry if the target generates one
   (`acfatah/ui`: `bun run registry:build`, then `registry:check`).
   It rewrites `docs/component-graph.md` alongside `registry.json` —
   stage both, or the next `registry:check` fails.

**Done** means the spec passes in the unit project, typecheck is clean,
and the registry check passes. In `acfatah/ui` run the unit project alone
with `bun run test:unit`; plain `bun run test` also starts the browser
`components` project. In `shadcn-vue-ark`, `bun run test` is already
unit-only.

`registry:build` prints `Wrote …` whether or not the contents changed, so
read `registry:check` or `git status`, not that line, to tell whether
anything is stale.

## Notes

- Prefer `computed()` over `watchEffect()` for derived reactive values.
- Use `toValue()` (Vue 3.3+) rather than `unref()`, so a getter, a ref and a
  plain value all work.
- Use `context7` to verify Vue Composition API and VueUse surfaces before
  relying on them.
