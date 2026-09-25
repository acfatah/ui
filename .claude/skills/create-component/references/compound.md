# Compound components (T2 and up)

How to build a component that wraps a multi-part Ark machine: it imports
`<Name>` from `@ark-ui/vue/<name>` and renders several of its parts. That
makes it at least T2. T3 adds a portal on top of everything here.

Copy from the target's T2 reference component, named in its `README.md`
(`acfatah/ui`: `switch`), and read it beside this file. The sections
below explain what it does and why, so the pattern carries to a
component the reference does not resemble.

## Parts

- One SFC per Ark part you style, `<Name><Part>.vue`, wrapping
  `<Name>.<Part>`. Take the part list from Ark's docs for the component
  (`context7`), not from the predecessor, which may have dropped some.
- A part Ark lacks but the design wants (`Switch.Description`) is a
  plain SFC with no Ark part inside. It usually wraps a shared
  component; see "Composing another component".
- Ark's `RootProvider` is exposed unwrapped in `namespace.ts`
  (`RootProvider: ArkSwitch.RootProvider`). There is nothing to style.
- A part that is always wanted gets its child as default slot content:
  `SwitchControl` renders `<SwitchThumb />` inside `<slot>`, so
  `<Switch.Control />` is complete and a consumer can still replace the
  thumb.

## Forwarding

Every Ark part receives its props through a forwarder, never through
`props` directly:

```ts
// Root: has emits
const props = defineProps<SwitchProps>()
const emit = defineEmits<SwitchRootEmits>()
const delegatedProps = reactiveOmit(props, ['class', 'disabled', 'loading'])
const forwardedProps = useForwardPropsEmits(delegatedProps, emit)

// Any other part: no emits
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
```

The forwarder passes only what the parent set, plus declared defaults.
Vue casts an absent Boolean prop to `false`; bound directly, every
unset `checked` would reach Ark as an explicit `false` and turn an
uncontrolled switch into a controlled one stuck off, and every unset
`disabled` or `readOnly` would override Ark's own default.

`reactiveOmit` removes `class` and each **local prop** (below) before
forwarding. A prop the SFC recomputes, such as `disabled`, is omitted
too and bound explicitly.

Emits are Ark's, copied into `types.ts` (`'update:checked'`,
`'checkedChange'`). They make `v-model:checked` work with no extra code.

## Data attributes

Zag puts `data-scope` and `data-part` on every Ark machine part, along
with its state attributes (`data-state`, `data-disabled`,
`data-invalid`, `data-readonly`). Leave both off the template of an Ark
part. Set the pair yourself on a part Ark does not render, with the
component's scope, so it styles and queries as one of its parts:

```vue
<Description data-scope="switch" data-part="description" ...>
```

## Local props

A prop Ark does not have (`loading`) lives in `types.ts` under a
"Local additions" heading, on an interface that extends the copied Ark
props and adds `class`:

```ts
export interface SwitchProps extends SwitchRootProps {
  class?: HTMLAttributes['class']
  loading?: boolean
}
```

Derived state is a `computed` that returns `undefined` when inactive,
bound after `v-bind="forwardedProps"`:

```ts
const isDisabled = computed(() => props.disabled || props.loading || undefined)
const isLoading = computed(() => props.loading || undefined)
```

`undefined` keeps the attribute off an idle component and leaves Ark's
default in place; `false` would do neither. `loading` on a machine means
disabled plus `aria-busy` and `data-loading`.

## Composing another component

A part may render another component (`SwitchLabel` renders `label`):

- Import it by direct path, `@/components/ui/label`. The registry build
  derives the `registryDependencies` edge from that import; no manual
  entry.
- Nest it under the Ark part with `as-child`, so Ark's props and ids
  land on the shared component's element. Pass `props.class` to the
  inner component, which owns the styles.
- Check the element it produces against where it sits. `Switch.Root`
  is a `<label>`, so `SwitchLabel` renders `Label as-child` onto a
  `<span>`; a second `<label>` inside the root is invalid.
- Hand the consumer's `asChild` to the inner component. The Ark part's
  `as-child` is hard-coded, so a forwarded `asChild` is overridden and
  silently does nothing: omit it (`reactiveOmit(props, 'class',
  'asChild')`) and bind `:as-child="props.asChild"` on the inner
  component (`TagsInputLabel`), or render the slot in place of the
  default wrapper (`SwitchLabel`). The spec asserts the consumer's
  child carries the part's `data-part` and styles, not only that it
  exists.

## ARIA

Read what Zag renders before trusting it: the `get*Props` functions in
`@zag-js/<name>`'s `dist/<name>.connect.mjs`. Bun's isolated linker keeps
Zag out of the root `node_modules/@zag-js`, so locate it with:

```bash
find node_modules -path '*@zag-js/<name>/dist/<name>.connect.mjs'
```

Compare roles and states with the WAI-ARIA pattern for the widget. Fill
a gap in the part that renders the element, with a template comment
giving the reason, as `SwitchHiddenInput` adds `role="switch"` to Zag's
plain checkbox.

## Styles

One plain-string export per part, `<name><Part>Styles`, unless a part
has variant axes. State styling keys off Zag's data attributes:
`data-[state=checked]:bg-primary`, `data-disabled:opacity-50`,
`data-invalid:border-destructive`. Every state prop in `types.ts` gets a
visible style somewhere; `invalid` with no style only changes ARIA, and
its demo looks identical to the default.

## Examples owed

The T2 demo contract (the target `README.md` tier table), each gated on
the prop existing:

| Example | Shows |
| --- | --- |
| `<Name>Demo` | a realistic composition, the page hero |
| `<Name>Default` | the minimal composition |
| the on state (`Checked`, `Selected`, `Open`) | `default-*` set |
| `<Name>Disabled` | `disabled`, off and on |
| `<Name>Controlled` | `v-model:*` beside `default-*`, commented |
| `<Name>Invalid`, `<Name>ReadOnly`, `<Name>Orientation` | if the prop exists |
| one per local prop (`<Name>Loading`) | the component's own behaviour |

All through the namespace (`Switch.Root`), per the documented API
convention.

## Portals (T3)

What a T3 adds on top of everything above. Copy from the T3 reference
(`acfatah/ui`: `popover`) and read it beside this section.

- **The content part owns the portal.** It renders
  `<Teleport to="body">`, then Ark's `<Name>.Positioner`, then
  `<Name>.Content`. Write both markers even though Ark could teleport at
  runtime: the registry build derives T3 from them, and a reader sees
  where the content lands. Bind the teleport to the root's `portalled`
  (`:disabled="!ctx.portalled"`, `ctx` from Ark's `use<Name>Context`):
  with `portalled` off Zag stops proxying Tab, so the content must sit
  in place for the DOM order to be the tab order.
- **Attributes go to the content, not the positioner.** Set
  `inheritAttrs: false` and bind `v-bind="{ ...$attrs, ...forwardedProps }"`
  on the content. The positioner is Zag's; leave it unstyled.
- **Zag positions through CSS variables.** It sets `--x`, `--y` and
  `--z-index` on the positioner, copying `--z-index` from the content's
  own `z-index`, and `--transform-origin` for the side it placed on. So
  the content carries `z-50` and `origin-(--transform-origin)`, never a
  hand-written offset. Spacing from the trigger is `positioning.gutter`,
  not a margin.
- **Animate with `tw-animate-css`**, keyed on Zag's attributes:
  `data-[state=open]:animate-in`, `data-[state=closed]:animate-out`,
  `data-[side=bottom]:slide-in-from-top-2`. Ark's presence waits for the
  exit animation before hiding, so both directions play. The utilities
  come from `tw-animate-css`, which no source file imports: name it in
  the item's `dependencies` and add `css: { '@import "tw-animate-css"':
  {} }`, so the item works without `vue/project-setup`'s `global.css`
  ("Component-owned CSS" in `registry.md`). Add
  `motion-reduce:animate-none`: `tw-animate-css` has no reduced-motion
  rule, and with no animation Ark hides the content at once.
- **An arrow is two parts.** `<Name>.Arrow` is sized by `--arrow-size`
  and coloured by `--arrow-background`, both set in its styles;
  `<Name>.ArrowTip` is its default slot content, so `<Name>.Arrow />` is
  complete.
- **Title and description are Ark parts**, because they supply the ids
  the content's `aria-labelledby` and `aria-describedby` point at. A
  description composes the shared `description` component through
  `as-child`: omit the consumer's `asChild` from what reaches the Ark
  part and pass it to the inner component, or it is silently ignored.
  The content is a `dialog`, so every example gives it a title, or an
  `aria-label` on the content when it is too small for one. Zag checks
  for the title once, when the machine starts, so with `lazyMount` or a
  `v-if` title the page tells consumers to use `aria-label`.
- **Triggers are unstyled.** Trigger, anchor and close trigger forward
  props and take a `Button` through `as-child`, so they need no styles
  export and no `class` handling.
- **The close trigger is labelled by Zag**, from `translations`
  (`closeTriggerLabel`, "close" by default), and that label replaces its
  text as the accessible name. Examples give it visible text with the
  same word, so the label stays in the name; a consumer's `aria-label`
  on the part replaces the default.
- **The root renders no element**, so it takes no `class`; forward its
  props and emits whole. Two Ark gaps come with it (5.39.2), in every
  overlay root: the presence emits `enterComplete` undeclared, a Vue dev
  warning on reopen that declaring it cannot fix (the fragment root then
  warns about an extraneous listener), so leave it; and `requestDismiss`
  is declared but never wired to Zag, so it never fires. Its spec is an
  `it.fails` tripwire beside a green test that the nested overlay closes
  with its parent.
- **Docs islands are `client:only="vue"`.** Astro drops `Teleport`
  output during SSR, so a hydrated overlay finds no content. The
  `document-component` page template has the details.

Examples owed at T3 add `<Name>Placement` (*if* `positioning` exists)
to the T2 rows; `Anchor`, `Modal` and close behaviour follow their
props. Do not ship a `default-open` demo: it opens on page load and,
with `autoFocus`, takes focus from the page. The spec covers it. Never
turn off both Escape and outside-click dismissal in an example: focus can
move on and leave the overlay covering the page.

## Test setup

Add the Ark subpath to the browser project's `optimizeDeps.include` in
`vitest.config.ts` when the component is created. The reason is in the
`test-component` skill, `references/spec-patterns.md`, "First run of a
new component".

## Done

Every item holds for every part:

- each Ark part forwards through `useForwardProps` or
  `useForwardPropsEmits`, with `class` and local props omitted;
- no Ark part carries a hand-written `data-scope` / `data-part`, and
  every non-Ark part does;
- each state prop in `types.ts` has a visible style;
- Zag's ARIA has been read against the widget's pattern;
- one example per owed row, and the Ark subpath is pre-bundled;
- at T3, the content part teleports its positioner, takes the
  attributes, and carries `z-50` and `origin-(--transform-origin)`.
