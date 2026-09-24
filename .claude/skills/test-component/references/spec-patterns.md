# Spec patterns

Conventions for `<ComponentName>.spec.ts`, taken from the target's
reference specs. Read the one for your tier beside this file. In
`acfatah/ui`: `button/Button.spec.ts` for a single-element T1,
`switch/Switch.spec.ts` for a multi-part T2 (composed fixture, state
matrix, controlled `v-model`, toggle flow), `popover/Popover.spec.ts`
for a T3 (teleported content, placement, dismissal, focus return), and
`tags-input/TagsInput.spec.ts` for a T4 (collection rendered through
`Context`, one `describe` per sub-flow, domain states, edge cases).

## Imports and setup

```ts
import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import Button from './Button.vue'
```

This is the order the package's linter enforces; `bun run format` fixes
it if in doubt. Add `page` to the `vitest/browser` import only for
teleported content (T3 and up).

- Import the part's `.vue` directly, not the barrel or the namespace; the
  spec tests one part.
- A local `render<Name>(props, slot)` helper when most tests render the
  same way. Tests that need `attrs` or a container call `render` directly.

## Multi-part components

- One spec for the component, rendering the full composition a consumer
  writes through a local `render<Name>(rootProps, parts)` helper: a
  `defineComponent` with a template, root props bound with `v-bind`,
  each part's props from a `parts` object. Import each part's `.vue`.
- Key `parts` by capitalised part name (`Label`, `Control`), never the
  lower-case name: `check:props` matches object keys by name alone, so a
  `label:` key "covers" any part's `label` prop whether or not a test
  sets it. The same collision can come from Ark's own shapes (`ids.label`);
  when it does, say so in a comment, since a waiver will never be read.
- Pointer flows click the **visible** target. Specs load no Tailwind CSS,
  so a styled track or thumb has no size and Playwright refuses it as
  not visible; a hidden input is visually hidden by Ark. Click the label
  text, which sits inside the root `<label>` and toggles the same way.

## Asserting

- **Attributes and roles** through `expect.element(locator)`, which
  retries: `toHaveAttribute`, `toBeDisabled`, `toBeInTheDocument`.
- **Absence** of an attribute on the element itself:
  `(await locator.element()).hasAttribute('disabled')` is `false`. An idle
  component carries no state attributes at all, so `[aria-disabled]`
  selectors never match it.
- **Classes** through `classList.contains`, never a `className` substring:
  `bg-primary` is a substring of `hover:bg-primary/90`, so a substring
  check misreads a correct merge.
- **Events** with a spy passed as an attribute:
  `render(Button, { attrs: { onClick } })`, then
  `expect(onClick).not.toHaveBeenCalled()`.
- **A blocked click** with `userEvent.click(el, { force: true })`: without
  `force` Playwright refuses to click a disabled element, and the test
  proves nothing.
- **Focus** through `document.activeElement` after `userEvent.tab()` or a
  key press.
- **Portals** through `page.getByRole(...)`, since teleported content sits
  outside the render container.
- **axe**: settle the render first (`await expect.element(locator)...`),
  then `await expectNoAxeViolations(screen.container)`, or the teleported
  element for a portal. `color-contrast` is off in the helper; do not
  re-enable it in specs.

## Fixtures

- A form or other container the component needs: create it, pass it as
  `container`, remove it at the end of the test.
- Slot content as a template string, e.g. `'<a href="#target">Go</a>'` for
  `asChild`. Use a hash href, so a click that slips through changes
  `location.hash` — which the test can assert on — rather than
  navigating away.

## Writing tests

- Name each test for the behaviour, present tense, lower case: `'keeps
  focus on a loading button and blocks its activation'`.
- A comment above an assertion when the reason is not obvious from the
  code: why a default is explicit, why `aria-disabled` rather than
  `disabled`. One short block, not a narrative.
- One behaviour per test. A state matrix is several tests, not one test
  with a loop inside it.
- A table of style values is `it.each` over the styles object
  (`Object.keys(buttonStyles.variant)`), so every variant and size gets a
  row and a new value is tested without editing the spec. Assert every
  class of the requested value is present, and the default value's own
  classes absent.

## Portals (T3)

`popover/Popover.spec.ts` is the pattern.

- **Find teleported content through the document.** Name it by role
  (`page.getByRole('dialog', { name })`) when asserting through
  `expect.element`, and read attributes off
  `document.querySelector('[data-scope=…][data-part=…]')`. Assert it is
  *not* inside `screen.container`, and that its positioner's parent is
  `document.body`: that is the teleport assertion T3 owes.
- **Closed content is hidden, not absent.** Ark mounts it on the first
  render unless `lazyMount` is set, so assert `hidden` or visibility,
  not existence. `lazyMount` and `unmountOnExit` get a test each.
- **Put a plain `Outside` button in the fixture**, before the root.
  Clicking the page body lands wherever its centre is, which may be the
  content; a named button outside the popover is deterministic, and it
  doubles as a `finalFocusEl` or `persistentElements` target.
- **Dismissal is one `it.each`** over Escape, an outside click and the
  close trigger, each asserting the content is gone and the trigger's
  `aria-expanded` is `false`. Focus return, `restoreFocus`,
  `closeOnEscape` and `closeOnInteractOutside` get a test each.
- **Placement asserts attributes**, never pixels: `data-side` and
  `data-placement` on the content for each side.
- **axe runs on the open content**, scoped to the positioner: plain,
  `modal`, and named by `aria-label` with no title.
- **`portalled` off keeps the content in place**: assert the positioner
  is inside `screen.container`.
- **Emits get a test each** where a flow triggers them (`escapeKeyDown`,
  `interactOutside`, `pointerDownOutside`, `focusOutside`,
  `exitComplete`). `check:props` counts props only, so nothing else
  flags an untested emit.
- **Unmount removes the teleport.** One test unmounts and asserts no
  `[data-scope]` node is left in `body`, so tests cannot bleed into each
  other. `vitest-browser-vue` cleans up after each test; the assertion
  proves it for the portal.

## Collections and typed input (T4)

From the `tags-input` reference spec.

- Render the collection the way a consumer does, from the machine's
  value through Ark's `<Name>.Context` slot, so an add or delete
  re-renders items without the fixture owning the state. Read the
  result back from the DOM (`[data-part="item-text"]`) with
  `expect.poll`, never from a ref the test does not own.
- **Type one entry at a time** when an entry commits on a key.
  Playwright types faster than Zag clears the input after a commit, so
  `keyboard('vue,ark,')` loses characters. Poll for the first tag, then
  type the next.
- **Paste without the clipboard.** Browser paste needs a permission the
  runner does not grant. Click the input, poll until the root carries
  `data-focus` (Zag handles focus in a microtask and ignores input
  events before it), then set `input.value` and dispatch
  `new InputEvent('input', { inputType: 'insertFromPaste' })`.
- An input part rendered self-closing drops its child under `asChild`.
  Every Ark part keeps a `<slot />`, inputs included; the `asChild` spec
  is what catches a missing one.

## First run of a new component

Each Ark subpath a component imports (`@ark-ui/vue/switch`) is listed in
the browser project's `optimizeDeps.include` in `vitest.config.ts`. An
unlisted one is discovered mid-run, Vite reloads, Ark lands on a second
copy of Vue, and every test fails with `Cannot read properties of null
(reading 'ce')`. Add the subpath rather than re-running until it passes.

## Props coverage waivers

`check:props` needs every public prop set in some spec as an object key
(`props: { dir: 'rtl' }`). A prop that genuinely cannot be exercised in a
browser spec is waived in the spec file, with a reason after an em dash:

```ts
// props-coverage-ignore: lang, ids — forwarded to Ark unchanged; asserted by Ark's own suite
```

Every waiver prints on each `check:props` run and belongs in the report.
A waiver is for a prop with nothing observable to assert, never for a
prop that is merely tedious to test.
