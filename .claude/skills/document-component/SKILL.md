---
name: document-component
description: Write or update a Vue component's docs page on the Nimbus docs site — live demos from its examples/, each followed by a verbatim source fence, plus install, usage and references — and report examples its tier still owes. Takes the component directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[component-dir]"
---

# Document component

Writes one component page for the docs app, built from what the component
already has: its `_registry.ts` and its `examples/`. The page is a
**mirror**: every demo and fence traces to a file in the component
directory, and every sentence to that code or what it imports. Examples
the component lacks are reported for `create-component` to write; this
skill writes only the page.

The finished page's layout, annotated, is in
`references/page-template.md`. Read it before step 3.

## 0. Establish the target

Write nothing until every item below is settled.

1. **Component directory** comes from the argument, e.g.
   `packages/vue/src/components/ui/button`. If missing, ask.
2. **Read its `_registry.ts`**: `name`, `title`, `description`,
   `categories`, `meta.tier`. An item with no `categories` is
   infrastructure (`vue/icons`) and has no component page — say so and
   stop.
3. **Find the docs app**: from the repository root,
   `ls apps/*/nimbus.json`. No match means the target has no Nimbus docs
   site (the predecessor, `shadcn-vue-ark`, runs Starlight) — stop.
4. **Read the docs app's `AGENT.md`**, section "This site: …". Its rules
   win over this skill wherever they differ; the generic Nimbus guidance
   below that section does not.
5. **Package import name**: `name` in the component package's
   `package.json` (`packages.vue`). Example imports go through it.
6. **Page path**: `<docs-app>/src/content/docs/components/<slug>.mdx`,
   where `<slug>` is the item `name` after its last `/` (`vue/button` ->
   `button`). The sidebar already links there from `categories`
   (`src/lib/registry-sidebar.ts`), so the sidebar needs no edit. An
   existing page means **update mode**: reconcile its demos with
   `examples/`, keep its section order, and keep its prose unless the code
   contradicts it (step 2).
7. **No `examples/` at all** means there is nothing to mirror: report the
   whole tier contract as the gap list and stop, writing no page.

Done when you can name: item, tier, categories, docs app, package name,
page path, and create-or-update.

## 1. Inventory the examples

List `examples/*.vue`. Each file is one demo, named
`<ComponentName><Case>.vue`; `<Case>` in words is its heading
(`ButtonWithIcon` -> "With icon").

Compare the set against the tier table in the target `README.md`, "Test
depth is tiered", column "What it owes". That column mixes demos and
specs; count only the items a reader can be shown (variants, sizes, a
state, controlled against uncontrolled, open, placement, a domain state),
never a spec ("one primary-flow spec", "asserting the teleported content
rendered"). A demo item applies only when `types.ts` has the prop or
feature it names — no `orientation` prop, no orientation demo owed.

Done when every contract item is either matched to an example file or on
the **gap list**. Every example file gets a demo on the page — none is
dropped for being redundant.

## 2. Read for the prose

Read the component's `.vue` files, `types.ts`, and every example,
including its comments. The prose on the page states what these files
show and nothing more:

- Intro: the registry `description`'s first paragraph, plus one sentence
  on what it is built on when the component source makes that plain.
- Per example: one or two sentences on what the demo shows and why a
  reader would reach for it. Sources, in order: the example's comments,
  the props it sets and their types, the component source, the modules
  it imports (the icons module, Ark), the upstream docs in the registry
  `References:`.

Each new sentence traces to one of those sources; a claim you cannot
trace is left out. In update mode, existing prose stays unless the code
contradicts it; an existing sentence you cannot trace goes in the report
rather than being deleted.

The page speaks to a consumer: tiers, test depth and `meta` stay off it.

## 3. Write the page

Follow `references/page-template.md` section by section: frontmatter,
imports, intro, hero demo, Installation, Usage, Examples, References.
Each demo is the island inside `<Demo>` followed by a fence holding the
example file verbatim — copy it with a read of the file, never retype
it.

- Example imports use `<package name>/<path under src>`: the package's
  `exports["./*"]` maps to `./src/*`, so
  `packages/vue/src/components/ui/button/examples/ButtonDemo.vue` is
  imported as `packages.vue/components/ui/button/examples/ButtonDemo.vue`.
- The install address is `acfatah/ui/<registry name>`
  (`acfatah/ui/vue/button`).
- Examples order in create mode: Default, then the contract items in
  tier-table order, then the rest alphabetically by case. Update mode
  keeps the page's existing order and appends new examples at the end.
- Wrap prose at 80 columns; fences keep the file's own lines.

The Usage fence uses the component's one documented API convention: the
dotted namespace (`Accordion.Root`) for a component with `namespace.ts`,
the flat export otherwise.

Edit only the page. Nimbus-owned files, `astro.config.ts` and
`src/components.ts` stay as they are.

## 4. Verify

Run from the docs app directory:

```bash
bun run check:demos                  # page mirrors its examples
bunx --bun nimbus-docs check --json  # authoring rules, links, MDX
bun run build
grep -c '^```' dist/components/<slug>/index.md
```

- `check:demos` must end with 0 errors and no warning naming this page;
  an example with no demo is only a warning, so read the warnings.
  A fence that differs is resynced with `bun run check:demos --fix` —
  the example file is the source of truth.
- `nimbus-docs check`: `status` not `failed` and `summary.fixable` 0.
  `partial` is the normal result: the generated sidebar can only be
  evaluated by a build, which the next command runs.
- `grep -c` counts two lines per fence, so it prints 2 × (demos + 2):
  one fence per demo (the hero included), plus install and usage.
  Anything less means the Markdown view lost a fence. The count assumes
  three-backtick fences and no example line starting with them.
- Optionally open `/components/<slug>` with `bun run dev` and look at
  both themes.

Done when all four pass.

## 5. Report

- Page path, created or updated.
- Demos on the page, by example file.
- The gap list from step 1, each item naming the contract line and the
  prop that makes it owed — for `create-component`.
- Existing sentences that could not be traced (update mode), and any
  example written against the undocumented API convention.
- The checks run and their results.
