---
name: audit-accessibility
description: Audit a Vue component for accessibility (keyboard navigation, ARIA roles/states, focus management, labelling, color/contrast, motion) and report severity-graded, actionable findings without editing code. Takes the target component directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [ComponentNameOrPath]"
---

# Audit accessibility

Audit the given Vue component(s) for accessibility compliance. Provide
ACTIONABLE findings without making direct code changes.

## 0. Establish the target

This skill is repo-agnostic. It reports nothing until it knows what it read.

1. **Target directory and component** come from the arguments
   (`[target-dir] [ComponentNameOrPath]`). If either is missing, ask. Do not
   guess, and do not assume `packages/registry` — that path belongs to one
   specific repository.
2. **Discover what the target actually provides** before reading imports.
   A component is two files at minimum, and the evidence is split across
   them:

   ```bash
   ls <target>/src/components/ui/<component>/   # .vue, styles.ts, types.ts
   ls <target>/src/components/ui/icons/         # the icon indirection module
   ```

   That first listing settles **where the class strings are**, which this
   audit depends on repeatedly. Two layouts are live:

   | Target | Class strings | Icons |
   |---|---|---|
   | Current conventions | `styles.ts`, plain TS, composed by `cn` | `@/components/ui/icons` |
   | Pre-rewrite (`shadcn-vue-ark`) | `variant.ts`, a `cva`/`tv` call | imported directly from the icon package |

   Below, "`styles.ts`" means whichever of the two the listing found. Do not
   report a missing `styles.ts` or a missing `icons/` as a finding — a target
   on the older layout is not an accessibility defect.

3. **Read the target repo's own `CLAUDE.md` and `docs/`** if present. A
   repository's own conventions win over this skill wherever they differ.

Examples below use `@/` as the alias and `src/components/ui/<name>/` as the
component root because both repositories use them. Verify, don't assume.

**Read-only contract.** This skill reads and reports. It writes nothing, runs
no formatter, and applies no fix — including fixes it is confident about.

## Scope

Focus on the following areas, in priority order:

### 1. Keyboard Navigation
- All interactive elements reachable via `Tab` / `Shift+Tab`
- Arrow key navigation for composite widgets (menu, listbox, tabs, radio group)
- `Escape` closes overlays (dialogs, dropdowns, popovers)
- `Enter` / `Space` activate buttons and toggles
- No keyboard traps (focus cannot escape a region unintentionally)

### 2. ARIA Roles, States & Properties
- Correct role applied (`role="dialog"`, `role="menu"`, `role="listbox"`, etc.)
- Required ARIA attributes present (`aria-expanded`, `aria-haspopup`,
  `aria-controls`, `aria-labelledby`, `aria-describedby`)
- Dynamic states updated reactively (`aria-disabled`, `aria-checked`,
  `aria-selected`, `aria-busy`)
- No redundant ARIA (e.g., `role="button"` on `<button>`)

### 3. Focus Management
- Focus moves to the correct element when a dialog/popover opens
- Focus returns to the trigger when a dialog/popover closes
- `aria-modal="true"` set on modal dialogs
- No focus loss when content changes dynamically
- **Focus-ring classes live in `styles.ts`, not the template.** Grep the part's
  export for `outline-none` and `focus-visible:`. A part that sets
  `outline-none` with no `focus-visible:ring-*` replacement removed the only
  focus indicator — 🟥, and it is greppable without reading the SFC.

### 4. Labelling
- All interactive elements have an accessible name
  (via `aria-label`, `aria-labelledby`, visible text, or `<label>`)
- Icon-only buttons have `aria-label` or `<span class="sr-only">`
- Form fields linked to their label with `for`/`id` or `aria-labelledby`
- Error messages linked with `aria-describedby`
- **Icons**: where the target has an indirection module they arrive through
  `@/components/ui/icons`; on the older layout they come straight from the
  icon package. Either way a decorative icon needs `aria-hidden="true"`, and
  an icon-only control needs an accessible name — nothing enforces this
  automatically, so check it by hand. A `size: 'icon'` key in the component's
  styles is the greppable tell that an icon-only control exists at all.

### 5. Color & Contrast
- **Judge contrast from the Tailwind tokens in `styles.ts`** — `bg-primary`,
  `text-primary-foreground` and friends — resolved against the target's theme
  CSS. The template carries no class strings to read.
- Text meets WCAG AA contrast ratio (4.5:1 normal, 3:1 large text)
- Focus indicators visible against all background colors
- State not conveyed by color alone (use icons, text, or patterns too)
- `disabled:opacity-50` (present in `buttonStyles.base` today) is a contrast
  finding, not a styling one: opacity alone can drop a control under 4.5:1
  against its own background.

### 6. Motion & Animation
- Animations respect `prefers-reduced-motion`. In Tailwind v4 that is the
  `motion-reduce:` variant, in `styles.ts` alongside the animation it guards.
- Any `@keyframes` or `--animate-*` token the component needs ships through
  `cssVars` + `css` in `_registry.ts` (see `create-component` §8). A
  reduced-motion escape hatch that exists only in the docs site never reaches
  the consumer — check the manifest, not the rendered page.

## Output Format

Start with a short summary of what the component does.

Then report findings grouped by area:

- **Keyboard Navigation**
- **ARIA**
- **Focus Management**
- **Labelling**
- **Color & Contrast**
- **Motion**

Severity scale:
- 🟥 Critical — blocks assistive technology users completely
- 🟧 High — significantly degrades the experience
- 🟨 Medium — noticeable but has a workaround
- 🟩 Low — minor improvement opportunity
- ✅ LGTM — no issues found in this area

Every finding cites `file:line` and, where one applies, the WCAG success
criterion it fails.

## Verification

A finding that names no test is a finding that regresses silently. Storybook
and `@storybook/addon-a11y` are gone, so say where the assertion would live.

- Component accessibility assertions are Vitest **browser-mode** specs driven
  by Playwright, colocated with the component. Browser mode exists precisely
  because focus, portals and ARIA need a real DOM.
- Composables and `src/lib/` modules run in the plain node project and are out
  of scope here — they have no DOM to audit (see `create-composable` §6).
- Each 🟥 and 🟧 finding names the assertion that would catch it, in one line:

  ```ts
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  ```

  This skill still writes no test. Naming it is what makes the finding
  actionable.
- Where the target already has an automated accessibility run, use it and say
  so. Where it does not, report manually — check the target's `package.json`
  scripts rather than inventing a command.

## Notes

- **Ark UI handles many ARIA patterns automatically, but `data-scope` /
  `data-part` are not the signal.** Those are styling hooks;
  `create-component` §1 adds them by hand to non-Ark components too, so their
  presence is evidence of nothing ARIA-related.
- Ark injects real ARIA at runtime. Establish what it injects for the specific
  part via `context7` against `@ark-ui/vue` (and the relevant `@zag-js/*`
  machine) before flagging an attribute as missing, and name that source in the
  finding.
- A part rendered through `ark.*` or an `@ark-ui/vue/<component>` part inherits
  Ark's machine. A bare element in the same directory does not. That boundary
  is where the real findings sit.
- Boundary against the sibling skill: `review-component` is the broad
  senior review that touches accessibility among five other axes. This skill is
  accessibility only, in depth.
- Reference: WCAG 2.2 (https://www.w3.org/TR/WCAG22/), APG patterns
  (https://www.w3.org/WAI/ARIA/apg/patterns/).
