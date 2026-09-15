---
name: create-composable
description: Author a Vue composable (src/composables/use*.ts) or a pure helper (src/lib/*.ts) in a shadcn registry — directory routing, full TS types, JSDoc, attribution, a colocated spec, and the barrel export. Takes the target package directory as an argument. Manual invocation only.
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
   and do not assume `packages/registry` — that path belongs to one
   specific repository.
2. **Discover what the target actually provides** before writing anything:

   ```bash
   ls <target>/src/composables/
   ls <target>/src/lib/
   cat <target>/tsconfig.json      # confirm the @/ alias
   ```

3. **Read the target repo's own `CLAUDE.md` and `docs/`** if present. A
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

| | `src/composables/` | `src/lib/` |
|---|---|---|
| Holds | reactivity or lifecycle | pure functions, factories |
| Test | calls into Vue's reactivity, or `getCurrentInstance` / `onMounted` / `provide` | neither |
| File name | camelCase, `use<Thing>.ts` | kebab-case, `<thing>.ts` |
| Export | named, matches the file name | named, matches the file name |
| Registry item | bare camelCase, `registry:file` | `<name>-lib`, `registry:lib` |

The case asymmetry is real and load-bearing: `useForwardProps.ts` sits
beside `format-bytes.ts`. Match the directory, not the neighbouring
directory.

`src/composables/` is `use*` only. A factory or a pure helper goes to
`src/lib/` even when it feels like part of the same family —
`createContext` and `dynamic` are helpers, not composables.

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
fixes. Live example: `src/composables/useForwardProps.ts` in
`shadcn-vue-ark`.

## 4. Registry packaging

Each module is published as **its own registry item**, generated from the
directory — there is no per-module `_registry.ts` to write.

Three consequences:

- **The filename is the registry address.** `@/composables/useForwardProps`
  becomes `<owner>/<repo>/useForwardProps`; `@/lib/utils` becomes
  `<owner>/<repo>/utils-lib`. Renaming the file is a breaking change for
  every consumer who pinned it.
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

  The import scanner maps a path to an item. The barrel is its own item, so
  importing it pulls every module in the directory into the consumer's
  install.

Full packaging model: `create-component`'s `references/registry.md`.

## 5. Barrel export

If the target has `src/composables/index.ts` (or `src/lib/index.ts`), add
the named export, alphabetized among its neighbours:

```ts
export { useExample } from './useExample'
```

The barrel is for the repository's own convenience. It is not how a
component reaches the module — see the direct-path rule above.

## 6. Test

A colocated spec is **required**, not optional:

```text
src/composables/
├── useExample.ts
└── useExample.spec.ts
```

Plain Vitest, the `unit` project. Browser mode is for components, which
need a real DOM for focus, portals and ARIA; a composable is logic and does
not.

Shapes to copy: `src/composables/runIfFn.spec.ts` (pure function, including
`@ts-expect-error` cases for the type surface),
`src/composables/useForwardProps.spec.ts` (needs a mounted instance),
`src/lib/format-bytes.spec.ts`.

Cover the type surface too, not just the runtime — a generic that infers
wrongly is the failure mode these modules actually have.

## Steps

1. Establish the target and discover what it has (section 0).
2. Decide it needs writing at all (section 1).
3. Route to `src/composables/` or `src/lib/` (section 2).
4. Write the module with full types, JSDoc, and attribution if ported.
5. Write the colocated `.spec.ts`.
6. Add the barrel export if the target has one.
7. Do **not** touch any component's `_registry.ts`.
8. Run the target's formatter and typecheck over the new files — commonly
   `bun run format <path>` and `bun run typecheck` from the target package
   root.

**Done** means the spec passes (`bun run test`, or the target's equivalent
unit project) and typecheck is clean.

## Notes

- Prefer `computed()` over `watchEffect()` for derived reactive values.
- Use `toValue()` (Vue 3.3+) rather than `unref()`, so a getter, a ref and a
  plain value all work.
- Use `context7` to verify Vue Composition API and VueUse surfaces before
  relying on them.
