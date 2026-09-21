# Spec patterns

Conventions for `<ComponentName>.spec.ts`, taken from `Button.spec.ts`,
the reference spec. Read it beside this file.

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
