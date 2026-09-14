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
repository: the agent skills in `.claude/skills/` and the context
documents in `docs/`.

## Requirements

- `shadcn` CLI v4 or newer. GitHub-address registries need v4+.
- Vue 3.5 or newer.
- Tailwind CSS v4.

## Install

Once released, one setup item followed by the components you want:

```bash
bunx --bun shadcn@latest add acfatah/ui/project-setup
bunx --bun shadcn@latest add acfatah/ui/button
```

`npx shadcn@latest add ...` works the same way without Bun.

Pin a version with a tag or a commit SHA:

```bash
bunx --bun shadcn@latest add acfatah/ui/button#v0.1.0
```

Inspect before writing anything:

```bash
bunx --bun shadcn@latest add acfatah/ui/button --dry-run
bunx --bun shadcn@latest add acfatah/ui/button --diff
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
not inlined in templates. They sit in plain `.ts` files that a component
imports, using `tailwind-variants` where a component has variants or
multiple parts. This keeps styles greppable and diffable, and is the
whole reason a port to another framework would ever be tractable.

**Vue only.** The repository name is framework-neutral so a port stays
possible, but no port is planned and none should be assumed.

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

Planned. Nothing but `docs/` and `.claude/` exists yet.

```
apps/
  docs/            Astro documentation site, also the component sandbox
packages/
  registry/        Component source, one directory per component
docs/              Context documents, decisions, conventions
.claude/skills/    Authoring and review skills for agents
registry.json      Consumer entry point, at the repository root
```

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
