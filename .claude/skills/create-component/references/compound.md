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
- one example per owed row, and the Ark subpath is pre-bundled.
