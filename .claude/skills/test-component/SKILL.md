---
name: test-component
description: Write or update a Vue component's browser-mode spec (<Name>.spec.ts) to its tier's contract — every public prop exercised, states, interaction flows, axe checks — leaving specs that expose real defects red and reporting them. Takes the component directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[component-dir]"
---

# Test component

Writes the colocated spec for one component, run by Vitest in a real
Playwright-driven browser. The spec is a **contract**: each test states
how the component is meant to behave, taken from its source, types and
examples. The tier sets the **floor** of what the contract must cover;
behaviour the component implements beyond that floor is specified too.

A test that fails because the component is wrong stays **red**. This
skill writes specs only; component source is never edited to make a test
pass. The failure goes in the report as a defect.

Read `references/tier-contract.md` in step 1 and
`references/spec-patterns.md` before step 3.

## 0. Establish the target

Write nothing until every item below is settled.

1. **Component directory** comes from the argument, e.g.
   `packages/vue/src/components/ui/button`. If missing, ask.
2. **Read its `_registry.ts`.** No `categories` means infrastructure
   (`vue/icons`): no spec, by rule — say so and stop. Otherwise note
   `meta.tier`.
3. **Re-derive the tier from source**, per the repository root
   `README.md`, "Test depth is tiered": importing an Ark component (e.g.
   `Switch` from `@ark-ui/vue/switch`) or calling a `use*` machine or
   `use*Context` means at least T2 — the bare `ark` factory
   (`ark.button`) is not a machine; `Positioner` plus `Teleport` means at
   least T3. A declared tier *lower* than derived is a finding for the
   report; write the spec to the derived tier and leave `_registry.ts`
   alone.
4. **Discover the test setup** in the component's package:
   `vitest.config.ts` (the browser project and its name, the `~test`
   alias), `test/a11y.ts` (the axe helper), and the `check:props` and
   `test:components` scripts in `package.json`.
5. **An existing `*.spec.ts`** means update mode: every behaviour it
   asserts survives, reorganised if needed, never dropped.

Done when you can name: item, declared and derived tier, browser project,
axe helper path, and create-or-update.

## 1. Inventory the surface

List, from the component's `.vue` files, `types.ts` and `examples/`:

- **Props** per part, with defaults from `withDefaults`. `check:props`
  requires every one to be set in some spec.
- **Emits**, **slots**, and the `data-scope` / `data-part` attributes. A
  component without `defineEmits` still receives listeners by attribute
  fall-through (`attrs: { onClick }`); list the native events it guards.
- **Behaviour the component implements itself** beyond forwarding to Ark:
  computed attributes, click guards, focus handling. Button's inert
  `loading` is the model — a `computed` in the SFC is a behaviour to pin.
- **The tier contract** from `references/tier-contract.md`, each item
  gated on the prop or feature existing in the types.

Done when every prop, emit and self-implemented behaviour is on the list,
and each contract item is marked owed or not applicable (with the missing
prop that makes it so).

## 2. Plan the spec

One `describe` per section, in this order, skipping empty ones:

1. **rendering** — element, role, data attributes, defaults.
2. **props** — every public prop; variants and sizes; `class` merging.
3. **states** — the tier's state matrix, and at T1 any state the
   component implements itself (button's `disabled`, `loading`).
4. **interaction** — keyboard and pointer flows the tier owes, plus the
   self-implemented behaviour from step 1.
5. **accessibility** — `expectNoAxeViolations` on each rendered state,
   or combination of states, that changes roles or ARIA (default,
   disabled, busy, open, asChild, disabled asChild); for T3, against the
   open state.

Done when each inventory item maps to a named test.

## 3. Write the spec

`<ComponentName>.spec.ts` beside the component; for a complex component
with several parts, one spec per part that carries behaviour, same
directory. Follow `references/spec-patterns.md`.

Each assertion is written as the behaviour should be. When a test fails,
decide which of three it is:

- **The test is wrong** (wrong locator, missing await, unresolved
  transition): fix the test.
- **The component is wrong** — the behaviour contradicts its own types,
  comments, examples, or ARIA/HTML practice: keep the test red; it is a
  defect.
- **Nothing promises it either way** — the component does something odd
  that no source commits to: drop the assertion and put the observation
  in the report as a question for the author.

Run the package formatter over the spec when it is written (`bun run
format <spec>`); import order is the linter's, not this skill's. A failed
browser run leaves `__screenshots__/` beside the spec — gitignored, but
delete it before reporting. A prop that genuinely cannot be exercised
gets a `props-coverage-ignore` waiver with its reason, per the patterns
file.

## 4. Verify

From the component's package directory:

```bash
bun run test:components src/components/ui/<name>   # a Vitest path filter
bun run typecheck
bun run lint                                     # includes check:props
```

Done when `check:props`, `typecheck` and `lint` pass, and every failing
test is a defect you can name with the source line that causes it —
none fails for a reason in the test itself.

## 5. Report

- Spec path(s), created or updated, and test count per section (each
  `it.each` row counts).
- Update mode: each previously asserted behaviour and the test that now
  carries it.
- Contract items owed but not applicable, with the missing prop.
- Props coverage result and every waiver with its reason.
- Red tests: name, the behaviour it expects, the defect with
  `file:line`.
- Questions: behaviour nothing promises, observed and left unasserted.
- Tier mismatch from step 0, if any.
