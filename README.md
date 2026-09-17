# ui

Accessible Vue 3 components built on [Ark UI][1], styled with Tailwind CSS
v4, and distributed as a [shadcn registry][2] rather than an npm package.
You install source files into your own project and own them from that
point on.

## Status

**Pre-release. No components yet.**

This repository is a from-scratch rewrite of
[acfatah/shadcn-vue-ark][3], which remains the working registry until this
one reaches parity. Nothing here is installable, and the commands below
describe the intended interface, not a shipped one.

What exists today is the conventions layer carried over from the previous
repository — the agent skills in `.claude/skills/` — plus the workspace
scaffold: `packages/vue/` for the Vue components and `shared/styles/` for
the framework-free class strings and Tailwind token layer they share.

## Requirements

- `shadcn` CLI v4 or newer. GitHub-address registries need v4+.
- Vue 3.5 or newer.
- Tailwind CSS v4.

## Install

Once released, one setup item followed by the components you want:

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/project-setup
bunx --bun shadcn@latest add acfatah/ui/vue/button
```

`npx shadcn@latest add ...` works the same way without Bun.

Pin a version with a tag or a commit SHA:

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/button#v0.1.0
```

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
version of their own. `registryDependencies` are pinned.

**No Storybook.** Documentation is an Astro site that imports the real
components. Interaction and accessibility assertions live in Vitest
browser-mode tests driven by Playwright.

## Repository layout

Partly built. Entries marked *planned* do not exist yet.

```
apps/
  docs/            planned  Astro documentation site, also the sandbox
shared/                     Framework-free source, copied on install
  styles/
    components/ui/          One styles.ts per component
    global.css              Tailwind v4 entry and shared token layer
packages/
  vue/                      Vue component source
    src/components/ui/      One directory per component
    src/composables/        use* modules only
    src/lib/                Pure functions and factories
docs/              planned  Context documents, decisions, conventions
.claude/skills/             Authoring and review skills for agents
registry.json      planned  Consumer entry point, at the repository root
```

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
