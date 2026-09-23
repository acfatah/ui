---
name: resync-component-types
description: Re-sync the hand-written component types.ts files against @ark-ui/vue when Ark (or its @zag-js deps) is upgraded, a types.ts provenance stamp drifts from the resolved Ark version, or a prop/emit exists in Ark but is missing or wrong locally. Takes the target package directory as an argument. Enforces the zero-Ark-type-import decoupling gates. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [ComponentName...]"
---

# Re-sync component types

Use this when **`@ark-ui/vue` (or its `@zag-js/*` deps) is upgraded**, when a
`types.ts` provenance stamp no longer matches the resolved Ark version, or
when a consumer reports a prop or emit that exists in Ark but is missing or
wrong locally.

**Read `references/component-types-resync.md` and follow it.** It is the
full procedure; this file establishes the target and states the
non-negotiables.

## 0. Establish the target

This skill is repo-agnostic. It edits nothing until it knows where.

1. **Target package directory** comes from the arguments, optionally
   followed by component names to limit the scope. If the directory is
   missing, ask. Do not guess, and do not assume `packages/registry` or
   `packages/vue` — each path belongs to one specific repository.
2. **Discover what the target actually provides:**

   ```bash
   ls <target>/src/components/ui/
   cat <target>/package.json          # which scripts exist
   node -p "require('<target>/node_modules/@ark-ui/vue/package.json').version"
   grep -rho "@ark-ui/vue@[0-9][0-9.]*" <target>/src/components/ui/*/types.ts | sort | uniq -c
   ```

   The last two lines are the version delta. No stamps at all means no
   component has Ark-derived types yet; say so and stop.
3. **Read the target repo's own `CLAUDE.md`, `README.md` and `docs/`** if
   present, walking up from the target to the repository root. A
   repository's own conventions win over this skill wherever they differ.
4. **Record the typecheck baseline before touching anything.** Errors
   present before the re-sync are the baseline; errors after it that are
   not in the baseline are yours.

The reference's component tables were observed in `shadcn-vue-ark`, the
repository with the full component set. Re-derive them for any other
target.

## Background

Every component's `.vue`, `types.ts` and `context.ts` import **zero types**
from `@ark-ui/vue` or `@zag-js` (runtime **value** imports stay), and
`types.ts` is a faithful 1:1 hand-written copy of Ark's surface, stamped
with the Ark version it was copied from. A consumer installs raw source,
and an Ark type import drags Ark's deep generics into their project.

## Do

1. Detect the version delta and locate the Ark `.d.ts` through
   `<target>/node_modules/@ark-ui/vue/dist/components/<subpath>/`. Mind
   the dir → subpath map, and resolve through the symlink, **not** a
   `node_modules/.bun` find from inside the package.
2. For each affected component, reconcile `types.ts` field by field against
   the current `.d.ts`: RootProps / RootEmits, inlined detail types,
   sub-part props, context types. Keep `class` and variant props in the
   `.vue` local Props.
3. Keep shared-primitive copies **byte-identical** and verify with `diff`.
4. Bump every touched provenance stamp to the resolved version.
5. Run the gates and stop only when they pass.

## Gates (definition of done)

Run only what the target's `package.json` has; name any gate skipped
because the script does not exist.

- **Robust scan** (brace-scoped, multi-line; the scanner is in the
  reference) → zero `@ark-ui/vue` / `@zag-js` type imports under
  `src/components/ui/`.
- **`vue-tsc`** → no errors beyond the baseline from §0. Use
  `bun run typecheck` when that script is `vue-tsc`; otherwise
  `bunx vue-tsc --noEmit`.
- **Component tests** (`bun run test`) pass for touched components.
- **`bun run lint`, then `bun run format`** on touched directories; shared
  copies still `diff`-identical afterwards.
- **Registry build**, only where the target has one, clean and
  Ark-type-free.

Do **not** "fix" accepted baseline errors, introduce `@ark-ui/vue` or
`@zag-js` type imports, or move `class` / variant props into `types.ts` to
silence anything. See the reference's landmines (`DateValue`,
`ListCollection`, `PositioningOptions`, required-prop forwarding).
