---
name: review-component
description: Senior-engineer review of a Vue UI component in a shadcn registry — correctness, the target's own authoring conventions, performance, security and accessibility — producing severity-graded findings without editing code. Takes the target component directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [ComponentName]"
---

# Review component

Reviews one component in a shadcn registry built on Ark UI and reports
severity-graded, actionable findings. It reads and runs check-only commands.
It never edits.

## 0. Establish the target

This skill is repo-agnostic. It writes nothing, and it judges nothing until
it knows what the house style is.

1. **Target directory and component name** come from the arguments
   (`[target-dir] [ComponentName]`). If either is missing, ask. Do not
   guess, and do not assume `packages/registry` or `packages/vue` —
   each path belongs to one specific repository.
2. **Discover what the target actually provides** before grading anything:

   ```bash
   ls <target>/src/components/ui/                 # the sibling set
   ls <target>/src/components/ui/<name>/          # what this one ships
   ls <target>/src/composables/ <target>/src/lib/
   cat <target>/package.json                      # which scripts exist
   cat <target>/tsconfig.json                     # confirm the @/ alias
   grep -rh "name:" <target>/src --include=_registry.ts | head -3
   ```

   The last line settles the **item-name prefix** the siblings use
   (`vue/button` or bare `button`). Settle two more from the siblings —
   whether the target uses `categories`, and which values it allows, and
   whether it uses `meta.tier`:

   ```bash
   grep -rh -A6 "categories:\|meta:" <target>/src --include=_registry.ts
   ```

   Neither field present across the siblings means the target has not
   adopted them: skip §3a entirely rather than grading against a
   convention this repository does not hold.

3. **Establish which file holds the Tailwind class strings**, before
   reading the `.vue` at all:

   ```bash
   cat <target>/src/components/ui/<name>/styles.ts
   grep -A4 '"paths"' <target>/tsconfig.json
   ```

   | Layout | Component's `styles.ts` | Real class strings | Icons | Example |
   | --- | --- | --- | --- | --- |
   | Shared source directory | one line, `export * from '<alias>/…'` | the file the alias resolves to through tsconfig `paths` | `@/components/ui/icons`, where it exists | `acfatah/ui` (`~shared/*`) |
   | Colocated | the class strings themselves | that file | `@/components/ui/icons` | — |
   | `cva` | absent, `variant.ts` instead | `variant.ts`, a `cva` call | imported from the icon package directly | `shadcn-vue-ark` |

   **Every styles check below reads the resolved file and cites its path**
   in `file:line`. A one-line re-export has no class strings to find.

   This matters more than it sounds. The styles decision moved focus rings,
   `disabled:` states and every colour token out of templates, so a review
   that reads only the `.vue` — or only the one-line re-export — finds
   nothing and reports a clean bill of health. The failure mode is a false
   ✅, not an error, which is the expensive kind. **The older layout is not
   itself a defect** — see *Read the siblings first* below.

4. **Read the target repo's own `CLAUDE.md`, `README.md` and `docs/`** if
   present, walking up from the target to the repository root. A
   repository's own conventions win over this skill wherever they differ.
   Walk up from the target — a registry package may carry its own
   `CLAUDE.md` above a workspace one, and the nearest wins.

Examples below use `@/` as the alias and `src/components/ui/<name>/` as the
component root because both repositories use them. Verify, don't assume.

### Read the siblings first

> Read two or three sibling component directories before judging this one.
> The target's conventions win over this document. A component consistent
> with its siblings is correct even where they differ from what the
> `create-component` skill teaches — that gap is a migration, not a defect,
> and it belongs to the `migrate-component` skill. Note it once, in Overall
> suggestions, and move on. Do not grade it.

This is the rule that keeps the skill useful across repositories that have
diverged. Concretely: a registry where every component uses `variant.ts`
with `cva` is internally consistent, and the finding is *not* "should use
`styles.ts`". Drifting from the repo you are in is a finding. Drifting from
a different repo is not.

If the sibling set disagrees with itself, say so — that is a real finding
about the repository, filed at 🟨, not a licence to pick a side.

## 1. Read-only contract

- **Never edit. Never `--fix`. Never run the target's `format` script.** In
  `shadcn-vue-ark` that script is `eslint --fix`; running it rewrites the
  working tree and destroys the diff the review was called to look at.
- Check-only commands, and only when `package.json` actually has them:

  ```bash
  bun run lint <path>     # check mode, no --fix
  bun run typecheck       # from the target package root
  ```

- **Report the linter's output rather than re-deriving it.** Import order,
  Tailwind class ordering and formatting are usually enforced already by the
  target's ESLint config. Hand-checking them duplicates the tool and
  manufactures low-severity noise. Hand-check them only where the target has
  no lint config.
- **Except class strings in a TS styles file.** Tailwind lint plugins see
  template `class` attributes reliably and TS object values often not at
  all — in `acfatah/ui` better-tailwindcss passes a misordered, unknown
  class in `styles.ts` (verified 2026-09-17). Do not take a clean lint run
  as evidence the styles file was checked: hand-check class order,
  conflicts and duplicates there, and say once in Overall suggestions
  that the linter does not cover it.
- A shared styles file sits outside the target package, so its lint
  config may be a different one (`acfatah/ui`: the root `bun run lint`).
- If the target has no `package.json` — or no component directory at all —
  say so plainly, review by reading, and stop. Do not invent a command or a
  path.

## 2. Severity scale

The marker set is fixed. Grade against these definitions rather than by
feel, so two runs agree.

| | Means |
| --- | --- |
| 🟥 Critical | Broken at runtime, or breaks consumers on install: a `_registry.ts` the build throws on, a wrong registry address, a shipped re-export in place of the real styles file, an XSS sink. |
| 🟧 High | Wrong but not fatal: a missing `data-part`, an Ark type imported into `types.ts`, an unlabelled icon-only control, a barrel import. |
| 🟨 Medium | Inconsistent with the sibling components, or a real performance cost. |
| 🟩 Low | Naming, JSDoc, ordering the linter does not cover. |
| ✅ LGTM | The section found nothing. Emit the marker alone. |

Every finding cites `file:line` and states the fix, ideally as a diff.
Give no explanation for a category with no issues.

## 3. Registry invariants

The checks that make this a *registry* review rather than a general Vue one.
Each is a question against the target, not an assertion about it.

1. **Ark decoupling.** Does `types.ts` import any *type* from `@ark-ui/vue`
   or `@zag-js`? It should import none — the surface is hand-written 1:1 and
   carries a provenance stamp naming the Ark version it was copied from.
   `asChild?: boolean` is inlined rather than importing `PolymorphicProps`.
   A stamp that no longer matches the resolved Ark version is a re-sync,
   owned by the `resync-component-types` skill: flag it, do not fix it.
2. **`data-scope` / `data-part`.** Present on every rendered part, both
   kebab-case, `data-scope` the component name and `data-part` the
   sub-element role. No legacy `data-slot` survivors. An Ark machine part
   (`Switch.Control`) gets both from Zag, so its template correctly
   carries neither; hand-written ones belong on the `ark.*` factory,
   native elements, and parts Ark does not render
   (`create-component`'s `references/compound.md`).
3. **`_registry.ts`.** Metadata only — files and import-derived dependencies
   are scanned automatically. A `src/composables/*` or `src/lib/*` path in
   `files[]` makes the build throw: 🟥. Custom CSS (a `@utility` class,
   `@keyframes`, a theme token) ships via `cssVars` + `css` so it installs
   with the component, rather than being assumed present in a global
   stylesheet. **Name**: a `name` missing the framework prefix its
   siblings carry (`accordion` beside `vue/button`) is a wrong install
   address: 🟥. **Shared styles**: a `files[]` entry pointing at the
   one-line re-export, or an explicit entry that omits the resolved shared
   file while the build cannot derive it — including having no `files[]`
   at all — ships a broken `./styles` import: 🟥. An alias path listed
   under `dependencies`: 🟥. Full model: `create-component`'s
   `references/registry.md`.
4. **Direct-path imports.** A component importing `@/composables` rather
   than `@/composables/useForwardProps` resolves to the barrel's own
   registry item and drags every module in that directory into the
   consumer's install. 🟧 every time.
5. **Export shape.** Both flat exports and the dotted namespace ship, and
   `index.ts` re-exports the namespace. Whether this component should have a
   `namespace.ts` at all follows the rule in
   `create-component`'s `references/namespace.md` — roughly, multi-part
   components get one and single-element components with an auxiliary
   sibling stay flat.
6. **Props and emits.** `class?: HTMLAttributes['class']` typed from Vue,
   `asChild?: boolean` where the part is polymorphic,
   `reactiveOmit(props, 'class')` before forwarding, and
   `useForwardProps` / `useForwardPropsEmits` chosen by whether the
   component has emits. See `create-component`'s
   `references/props-emits.md`. A single-element component that passes
   props explicitly, in a target with no forwarding composables, is
   graded on whether it forwards everything it declares, not on the
   composable.
7. **Styles — per the target's convention, established in §0.**
   - Target uses `styles.ts`: no Tailwind strings left in the template,
     `<componentName><Part>Styles` naming with one export per part, no
     destructuring a part into a bare local name (a `trigger` const collides
     with Ark's trigger part and with any template ref), defaults via
     `withDefaults` rather than a `defaults` key, compound rules as an
     explicit `computed` appended to the `cn(...)` call. There is no
     `compoundVariants` key — if you find one, nothing reads it: 🟧.
   - Target keeps styles in a shared source directory (`acfatah/ui`:
     `shared/styles`): every check above runs against the resolved shared
     file, and findings cite it. The component's own `styles.ts` must be a
     pure one-line re-export through the alias. Class strings written into
     it never reach consumers, who receive the shared file: 🟥. A relative
     `../../..` path or a package-name import instead of the alias: 🟧.
   - Target uses `variant.ts` / `cva`: check the cva usage is correct and
     leave the choice alone.
8. **Icons.** If the target has an icons module, no component imports an
   icon package directly — 🟧, and the fix is to add the re-export there.
   If the target has no icons module, this check does not apply; note
   `lucide-vue-next` is deprecated in favour of `@lucide/vue` and say so
   once, not per import.
9. **`cn` source** matches the siblings — the npm `cn` package in one
   repository, a local `@/lib/utils` re-export in the other. Mixed within
   one repository is 🟨.
10. **Colocated `.spec.ts`.** Components are tested in Vitest browser mode,
    composables and lib modules in the plain node project. Absent where the
    siblings have one is 🟨; absent where no sibling has one is a note in
    Overall suggestions, not a finding. Where the target has a `check:props`
    script, run it and report its result instead of judging prop coverage
    by eye; a spec written against the tier contract is `test-component`'s
    job, so name it in the fix.
11. **Categories and tier.** Applies only where the siblings carry these
    fields, and only to *component* items; a target that has not adopted
    them fails no check here, and neither does an infrastructure item.
    See "Tier drift" below.

## 3a. Tier drift

Only where the target uses `meta.tier` (established in §0 from the
siblings). This check exists because its failure is a **false ✅**: a
component whose declared tier is too low is never *reported* as
under-tested, it is simply never asked for the specs that tier owes.
Nothing else in this review would catch it.

**First, is this a component at all?** An item under `components/ui/`
that renders nothing a reader could be shown and has no behaviour a spec
could assert is infrastructure — `vue/icons`, a list of re-exports, is
the standing example. Infrastructure carries no `categories`, no
`meta.tier` and no `.spec.ts` **by rule**, so skip this whole section
and check 10 for it. Filing those omissions against such an item is a
false finding against a deliberate decision, which is the mirror of the
failure this section exists to prevent. See `create-component`'s
`references/registry.md`, "Infrastructure items carry neither".

The exemption is narrow. A component with a thin surface is still a
component: `separator` renders, so it owes a category and a T1 tier.

Derive the tier from the component source, then compare:

| Boundary | Evidence in source | Mechanical? |
| --- | --- | --- |
| T1 to T2 | an Ark machine import (`@ark-ui/vue/<machine>`), or a `use*Context` call | yes |
| T2 to T3 | `Positioner` together with `Teleport` | yes |
| T3 to T4 | assembles several components into a larger widget, or is high-surface / async / a control collection | **no** |

Read the portal off the source, never off a demo — most overlays let Ark
teleport at runtime, so a demo that does not mention `Teleport` is not
evidence of anything.

**Derive only T1 to T3.** T4 is a judgement call in both halves, so it is
never derived and a T4 declaration is never contradicted. Importing one
component is not evidence of T4: `command` imports `dialog` and is T3
*because* of it, inheriting that portal's focus trap. What makes T4 is
assembling several — `sidebar` pulls in `button`, `input`, `sheet` and
`tooltip`. Treat composition as a prompt to ask whether T4 is right, not
as a derivation.

- Declared **lower** than derived, within T1 to T3: 🟧. State both tiers
  and name the specs the real tier owes that the component does not have.
- Declared **higher** than derived: not a finding. That is the T4
  judgement call and the deliberate boundary calls (`input`, `calendar`,
  `range-calendar`) the tier model preserves. Do not "correct" it down.
- **Absent** where the siblings have it: 🟧 — the field is what makes
  the tier checkable at all.
- `categories` absent, or carrying a value no sibling uses: 🟨. A tier
  value inside `categories` is always wrong: the two answer different
  questions and only `categories` reaches the docs sidebar.

Then check the declared tier's contract is actually met, per
the target's `README.md`, "Test depth is tiered" — T2 owes a state
matrix and a primary-flow spec, T3 adds open, placement, dismiss and an
assertion that the teleported content rendered, T4 adds domain states and
edge cases. A tier declared correctly but not honoured is 🟨, graded like
any other missing spec. Non-interactive members of higher tiers
(`progress`, `breadcrumb`, `table`, `fieldset`, `button-group` in the
predecessor) owe the matrix and the accessibility check but no
interaction spec — their absence is not a finding.

## 4. Correctness

- Reactivity lost by destructuring `props`, or by passing a `.value` where a
  ref was meant.
- `watch` / `watchEffect` where a `computed` is the correct tool.
- `toValue()` over `unref()` for `MaybeRefOrGetter` inputs.
- `v-for` without a stable `key`, or a `key` derived from the index over a
  reorderable list.
- Listeners, observers and timers created without cleanup on unmount.
- Edge cases around `asChild` and polymorphic `as`: a single root element
  required, attribute merging, and what happens when the consumer passes a
  component rather than a tag.
- Controlled/uncontrolled state: does a `v-model` and a `defaultValue` both
  being supplied behave sanely?

## 5. Performance

- Work done in the render path that belongs in a `computed`.
- A styles object or class string rebuilt on every render rather than
  hoisted to module scope (check the resolved file, §0).
- Teleport/portal contents mounted eagerly when the component is closed.
- Reactive wrappers around large or deeply nested data where `shallowRef`
  or `markRaw` is correct.
- Unnecessary deep watchers.

## 6. Security

- `v-html` anywhere. If it is genuinely required, is the input sanitised and
  is the requirement documented?
- `:href` and `:src` bound to consumer-supplied data without scheme
  checking — `javascript:` is the case that matters.
- `asChild` and `<component :is>` letting a consumer render an arbitrary
  tag or component; note where that is the intended API and where it is an
  accident.
- Class strings or icon names interpolated from untrusted input.
- A dependency added by this component that the registry item does not
  declare, or one that is deprecated or unmaintained.

## 7. Accessibility

Ark UI and Zag.js own keyboard interaction, focus management and the core
ARIA wiring. This section reviews the layer above that — the places where a
wrapper can throw Ark's behaviour away.

- An Ark part replaced by a raw element, which silently drops its ARIA
  attributes, ids and keyboard handling. This is the highest-value check in
  the section.
- Icon-only controls with no `aria-label`. Nothing enforces this
  automatically, so check it by hand every time.
- Decorative icons missing `aria-hidden="true"`, and meaningful icons with
  no accessible name.
- Label association: a visible label wired to its control, or an
  `aria-labelledby` / `aria-describedby` that points at an id the component
  actually renders.
- Focus visibility on every interactive part, not just the root, and focus
  not removed by an `outline-none` without a `focus-visible:` replacement.
- Contrast on the variant tokens the component ships, especially `ghost`,
  `outline` and any muted foreground.
- Motion behind `prefers-reduced-motion` where the component animates.
- Touch target size on compact variants.

For a deep audit, point the user at `/audit-accessibility`. That is not a
reason to skip the misses above.

## 8. Output format

1. A short summary of what the component does, in plain language, and which
   conventions the target was found to follow (§0).
2. Findings, grouped in this order, each ordered by severity:
   **Registry invariants**, **Tier drift**, **Correctness**,
   **Performance**, **Security**, **Accessibility**. Omit **Tier drift**
   where the target does not use `meta.tier`.
3. **Overall suggestions** — including any convention gap between this
   repository and a sibling repository, recorded as a note.
4. Omit any group that has no findings, or give it a single ✅ line. Never
   write a paragraph explaining that a category was clean.

## 9. Notes

- If context is insufficient, ask before assuming. A wrong finding costs
  more than a question.
- Use `context7` for the API surface of Vue, VueUse, Ark UI or Tailwind
  rather than recalling it.
- **Check the target's Tailwind major before flagging unfamiliar variant
  syntax.** Tailwind v4 added descendant and child selectors that read as
  typos if you are thinking in v3: `*:` compiles to `:is(& > *)` and `**:`
  to `:is(& *)`, so `**:data-[scope$='-input']:border-none` is valid and
  composes with the `data-*` variant. Verify before calling one a mistake.
