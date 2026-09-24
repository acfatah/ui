# ui

Accessible Vue 3 components built on [Ark UI][1], styled with Tailwind CSS
v4, and distributed as a [shadcn registry][2] rather than an npm package.
You install source files into your own project and own them from that
point on.

## Status

**Pre-release. No tagged version yet.**

This repository is a from-scratch rewrite of
[acfatah/shadcn-vue-ark][3], which remains the working registry until this
one reaches parity. Items install from the default branch and may change
between runs.

`packages/vue/` holds the Vue components, `shared/styles/` the
framework-free class strings and Tailwind token layer they share, and
`apps/docs/` the documentation site. The root `registry.json` is generated
from the colocated `_registry.ts` files by `bun run registry:build`; commit
it with any change that affects an item.

## Requirements

- `shadcn` CLI v4 or newer. GitHub-address registries need v4+.
- Vue 3.5 or newer.
- Tailwind CSS v4.

## Install

In a `create-vue` TypeScript project, first add `"paths": { "@/*":
["./src/*"] }` to the root `tsconfig.json` `compilerOptions`. The shadcn
CLI reads aliases from that file only, and `create-vue` declares them in
`tsconfig.app.json`. Then one setup item, followed by the components you
want:

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/project-setup
bunx --bun shadcn@latest add acfatah/ui/vue/button
```

Finally add `tailwindcss()` from `@tailwindcss/vite` to `vite.config.ts`
and import `./styles/global.css` in `src/main.ts`. The docs site's
Installation page has the full walkthrough.

`npx shadcn@latest add ...` works the same way without Bun.

Pin a version with a tag or a commit SHA:

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/button#v0.1.0
```

The ref applies to the named item only; its dependencies still install
from the default branch until releases pin them.

Inspect before writing anything:

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/button --dry-run
bunx --bun shadcn@latest add acfatah/ui/vue/button --diff
```

## Design decisions

These are settled and should be treated as constraints, not preferences.

**Registry, not a library.** GitHub-addressed, conforming to the shadcn
`registry.json` and `registry-item.json` schemas. No custom install CLI.
The only CLI in this repo builds `registry.json` from the colocated
`_registry.ts` files.

**Ark UI for behaviour.** Ark and Zag.js own accessibility, focus
management and state. This repository owns styling and API surface only.

**Styles live in framework-free TypeScript.** Tailwind class strings are
not inlined in templates. They sit in a plain `styles.ts` that a
component imports, one export per part. There is no variant library —
no `cva`, no `tailwind-variants`; `cn` does all composition, defaults
come from `withDefaults` in the SFC, and variant types derive from the
styles object with `keyof typeof`. This keeps styles greppable and
diffable, and is the whole reason a port to another framework would ever
be tractable.

**Vue only, laid out per framework.** Vue is the only implementation.
Source lives in `packages/<framework>/` and items are addressed as
`acfatah/ui/<framework>/<item>`, so a port would add a sibling package
rather than restructure this one. No port is planned and none should be
assumed.

**Icons go through one indirection component.** No component imports an
icon package directly. Swapping icon sets is editing one file, not
hundreds.

**One documented API convention.** Both flat exports and a dot-notation
namespace object ship per component, but exactly one appears in the
documentation, in every demo, and in the agent rules. Two documented
conventions is how agents become inconsistent.

**`cn` replaces `clsx` plus `tailwind-merge`.** One dependency instead of
two in every consumer's install.

**Versioning is git tags plus `#ref` pinning.** Registry items carry no
version of their own. A ref pins only the item you name:
`registryDependencies` are not pinned, so they resolve from the default
branch. The docs site's Installation page covers what that means.

**No Storybook.** Documentation is an Astro site on [Nimbus][4] that
imports the real components. Interaction and accessibility assertions live
in Vitest browser-mode tests driven by Playwright. Two checks replace what
Storybook's addons did: `check:props` fails the package lint when a public
prop is set by no spec, and specs assert accessibility with axe through
`expectNoAxeViolations` (`packages/vue/test/a11y.ts`).

**Test depth is tiered.** How deep a component's specs and demos go is
bound to its behavioural surface, not decided per component. No Ark state
machine is T1; a state machine rendered in flow is T2; a state machine
plus a portal is T3; a composite or a high-surface, async or
control-collection widget is T4. Each tier owes everything the one below
owes, plus more.

| Tier | What it is | What it owes |
| --- | --- | --- |
| T1 | single element or static composition | variant and size demos; no interaction spec |
| T2 | state machine, renders in flow | state matrix, controlled vs uncontrolled, one primary-flow spec |
| T3 | state machine plus a portal (`Positioner` or `Teleport`) | T2, plus open, placement, dismiss, and asserting the teleported content rendered |
| T4 | composite or heavy widget | T3, plus domain states, edge cases, one spec per core sub-flow |

T1 to T3 are read off component source — a machine import, then either
portal marker. Classify the portal from the source, never from whether a
demo writes `Teleport`, because most overlays let Ark teleport at
runtime. A `Positioner` alone is enough for the same reason: the
predecessor's `dialog`, `drawer`, `sheet` and `navigation-menu` are all
T3 and write no `Teleport` anywhere. T4 is a judgement call in both
halves and is never derived: importing one component does not make a
component T4, since `command` imports `dialog` and is T3 *because* of
it, inheriting that portal's focus trap. Declaring a tier higher than
the source implies is allowed; declaring one lower is a defect, because
it silently drops the specs that tier owes. A tier is assigned when a
component is created, never retro-fitted.

The registry build enforces that floor: it recomputes T1 to T3 from
source, raises a component to the derived tier of anything it imports,
and fails `registry:check` — and so `bun run lint` — when the declared
`meta.tier` is lower. It writes the composition it read to
`packages/vue/docs/component-graph.md`.

Each tier has a reference component to copy from: `button` for T1 (a
single element with variant and size axes), `switch` for T2 (a
multi-part Ark wrapper with prop and emit forwarding, a state matrix and
one primary-flow spec) and `tags-input` for T4 (a high-surface control
declared above its derived T2, with one spec per sub-flow, domain states
and edge cases). Their specs are the reference specs. T3 has none yet.

Component names used as examples here and below (`command`, `calendar`,
`tooltip`) are from the predecessor, where the model was applied to all
62 of its components. They are illustrations of the rule, not a claim
that those components exist here yet.

**Components declare `categories` and `meta.tier`.** Both live in
`_registry.ts`. `categories` groups the documentation navigation — one or
more of `form`, `actions`, `navigation`, `overlay`, `data-display`,
`feedback`, `layout` — and membership is deliberately not exclusive, so
`calendar` is both `form` and `data-display`. `meta.tier` is the tier
above; it sits in `meta` because it is ours, not part of the shadcn
schema.

Neither ever appears in an item name. An install address is a public
contract, and tiers move — the day a component starts composing another
instead of re-implementing it, its tier can shift — so a tier in the name
would make every reclassification a breaking rename.

There is exactly one architecture ladder, and it is the tier. A second
one (primitive / base / composite) was considered and rejected: the tier
rule already reads as one, and two ladders give every component two
labels with no rule for which governs. Documentation navigation reads
`categories` only, never the tier — T3 "overlay" is a mechanism, not a
domain, so `tooltip`, `dropdown-menu` and `navigation-menu` are all T3
and belong in three different sidebar sections.

## Repository layout

Partly built. Entries marked *planned* do not exist yet; *generated* ones
are written by `bun run registry:build` or `bun run skill:build` and are
not edited by hand.

```
apps/
  docs/                     Nimbus (Astro) documentation site
shared/                     Framework-free source, copied on install
  styles/
    components/ui/          One styles.ts per component
    global.css              Tailwind v4 entry and shared token layer
packages/
  vue/                      Vue component source
    src/components/ui/      One directory per component
    src/composables/        use* modules only
    src/lib/                Pure functions and factories
    docs/          generated Component graph, written by the registry build
docs/              planned  Context documents, decisions, conventions
.claude/skills/             Authoring and review skills for agents
skills/vue-ui/              Consumer agent skill, shipped as vue/agent-skill
  references/    generated  One usage reference per docs page (skill:build)
registry.json    generated  Consumer entry point, at the repository root
```

The documentation site runs locally only for now:

```bash
bun run docs:dev     # http://localhost:4321
bun run docs:build   # static output in apps/docs/dist
```

Component pages render the real examples from
`packages/vue/src/components/ui/<name>/examples/`, and the sidebar groups
components by the `categories` in each `_registry.ts`. Its own
conventions are in `apps/docs/AGENT.md`.

`registry.json` is generated from the colocated `_registry.ts` files by
the build CLI, which is also still to be written.

`shared/` is plain source, not a workspace package. Nothing in it is
installed as a dependency; registry items copy its files into the
consumer's project like any other source file. Framework packages reach
it through the `~shared/*` alias (tsconfig paths plus Vite and Vitest
aliases). The `~` prefix cannot be an npm name, so the build CLI can
never mistake it for a dependency.

Each framework's `styles.ts` inside a component directory is a one-line
re-export of the real file in `shared/styles`, so the component can
import `./styles` during development. It is never published. The
registry item ships the real file instead, with a `target` beside the
component, so the consumer gets the same `./styles` import.

## Relationship to shadcn-vue-ark

[acfatah/shadcn-vue-ark][3] is the predecessor. It is the live registry
today and stays installable. It is not archived, and it is not being
migrated in place.

This repository starts from a clean history on purpose. The components
are being rewritten rather than copied, and only the conventions
documents came across.

## License

MIT. Copyright (c) 2026 Achmad F. Ibrahim.

[1]: https://ark-ui.com/
[2]: https://ui.shadcn.com/docs/registry
[3]: https://github.com/acfatah/shadcn-vue-ark
[4]: https://nimbus-docs.com
