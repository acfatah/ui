# Tier contract for specs

What a spec owes, by tier. Each tier owes everything the tier below owes.
The authoritative table is the target `README.md`, "Test depth is tiered";
this file expands its spec half. The demo half is `document-component`'s.

A **conditional** item (marked *if*) applies only when the prop or feature
exists in the component's `types.ts`. That gate keeps simple components
lean: a static element has no states, and forcing them produces toy
tests.

## Every tier

- **Props coverage**: every public prop set in some test, enforced by
  `bun run check:props`.
- **Rendering**: the root element and role, `data-scope` / `data-part`,
  defaults applied.
- **Class merging**: a consumer `class` overrides the conflicting style
  class (this is `cn` at work).
- **axe**: `expectNoAxeViolations` on the default render.

## T1 — no machine, no portal

- Variants and sizes (*if* the styles object has those axes): a requested
  value applies its class and drops the default's.
- No interaction spec is owed. Behaviour the component implements itself
  (button's inert `loading`, `asChild` handling) is still specified — the
  tier is a floor, not a ceiling.

## T2 — machine, renders in flow

- **State matrix**:
  - the "on" state (checked, selected, pressed, expanded);
  - disabled (*if*): activation does nothing and the ARIA says so;
  - controlled against uncontrolled (*if* `modelValue` / `defaultValue`
    or `v-model`): the prop drives the state, and the emit fires with
    the new value;
  - invalid, readonly, orientation (*if* each exists).
- **One primary-flow spec**: the archetype recipe below, end to end.
- **axe** on the "on" state and on disabled.

## T3 — machine plus `Positioner` + `Teleport`

- **Open**: trigger opens it; the teleported content renders, found
  through `page` (the document), not the render container.
- **Placement** (*if* `positioning` / side / align props): the requested
  placement reaches the positioner (`data-placement` or the Ark
  attribute), without asserting pixel coordinates.
- **Dismiss**: `Escape` and outside click close it; focus returns to the
  trigger.
- **axe** against the open state, scoped to the teleported content.

## T4 — composite or heavy

- **Domain states** the component exists for: range selection, disabled
  dates, collapsed sidebar, sorted or filtered table.
- **Edge cases** from the catalog below whose trigger applies.
- **One spec per core sub-flow**, each an archetype recipe.

## Edge-case catalog

Each case is owed only when its trigger holds.

| Edge case | Trigger |
| --- | --- |
| Empty / no results | renders a collection |
| Overflow / long content | text or list can exceed its container |
| Many items | list length is user-driven |
| RTL | directional layout, icons or placement (`dir` prop) |
| Async / loading | remote work or a `loading` prop |
| Invalid / error | an `invalid` or validation prop |
| Disabled | a `disabled` prop on anything interactive |

## Archetype recipes

The primary flow per kind of component, in `vitest-browser-vue` terms.
Locators on the render result (`screen.getByRole`) see only the render
container; teleported content needs `page.getByRole` from `vitest/browser`.
`expect.element(locator)` retries until Ark's transitions settle, so
assert through it after every open or close rather than reading the DOM
once.

- **Toggle** (switch, checkbox, toggle, radio group): click flips
  `aria-checked` / `aria-pressed`; `Space` (and arrows for a group) does
  the same; disabled ignores both.
- **Overlay** (dialog, sheet, popover, hover card, tooltip, command):
  trigger opens, focus moves into the content, `Escape` or outside click
  closes, focus returns to the trigger.
- **Typeahead** (combobox, select, tags input): open the listbox, type to
  filter, `ArrowDown` highlights, `Enter` selects, the trigger shows the
  value, the listbox closes.
- **Form input** (input, number input, pin input, slider): type or clear,
  `aria-invalid` when invalid, the value reaches a submitted form.
- **Menu / keyboard nav** (dropdown, menubar, tabs, accordion,
  pagination, calendar): activate, roving arrow focus, `Enter` / `Space`
  selects, `Escape` closes. For pickers, only the open → select → commit
  path, not every keyboard edge.

## Determinism

- No `Date.now()` or `Math.random()` in a spec or its fixtures; pin dates
  with `@internationalized/date` (`parseDate('2026-06-16')`).
- Await transitions through `expect.element`, never a fixed timeout.
- No fake timers by default — Zag schedules through microtasks and
  `requestAnimationFrame`, which fake timers desync. Use them only for
  explicit delays (tooltip open delay) and restore after.
