# Re-syncing component types after an Ark UI change

The full procedure behind `SKILL.md`. It covers both halves of the
decoupling: the rule a component's types follow, and how to keep them
faithful when `@ark-ui/vue` or its `@zag-js/*` dependencies move.

Paths below are relative to the **target package root** established in
`SKILL.md` §0 (`acfatah/ui`: `packages/vue`; `shadcn-vue-ark`:
`packages/registry`).

> **Provenance of the component-specific data.** The directory map, the
> shared-primitive table, the accepted-error baseline and the component
> map were all observed in `shadcn-vue-ark`, which has the full component
> set. The originals are
> `repos/ui-registry/docs/CONTEXT-component-types-{definition,resync}.md`.
> In any other target, re-derive each table from what the target
> actually ships before trusting it. A row naming a component the target
> does not have is not a finding.

## Why the types are hand-written

A registry ships raw component source. A consumer who installs a
component receives its `.vue` verbatim, including any
`import type { AccordionRootProps } from '@ark-ui/vue/accordion'`. That
one import drags in a deep generic chain:

```
AccordionRootProps
  └─ AccordionRootBaseProps extends RootProps, RenderStrategyProps, PolymorphicProps
       └─ RootProps  (re-exports @zag-js/accordion types)
            └─ @zag-js/accordion → @zag-js/types, @zag-js/core (machines, services…)
```

In a consumer project that surfaces as "Type instantiation is excessively
deep and possibly infinite", slow `vue-tsc`, and a hard coupling to
`@zag-js` internals. So every file copied into a consumer resolves its
types from itself, `vue`, and legitimate external runtime libraries —
never from `@ark-ui/vue` or `@zag-js`. There is no codegen and no
type-equivalence test; drift is re-synced by hand, which is this
procedure.

## The invariant

For every component under `src/components/ui/<name>/`:

1. **Zero Ark/zag TYPE imports** in any `.vue`, `types.ts` or
   `context.ts`. Runtime **value** imports stay: the Ark component, `ark`,
   `mergeProps`, `createListCollection`, `useXxxContext()` calls.
2. **Faithful 1:1.** Each local interface reproduces Ark's
   prop/emit/detail/context surface verbatim — every prop, exact type,
   full JSDoc and `@default`. No curating, no dropping.
3. **Provenance stamped** with the Ark version it was copied from
   (Step 4).
4. **Local conventions stay in the `.vue`.** `class`, variant props and
   positioning-abstraction props (`align`, `side`, `sideOffset`,
   `alignOffset`) live in the `.vue` local `interface Props extends
   XxxRootProps`, not in `types.ts`. `types.ts` carries only the
   Ark-derived surface.
5. **Shared-primitive copies stay byte-identical** (Step 3).

Keep non-Ark external types: `HTMLAttributes` from `vue`, `DateValue`
from `@internationalized/date`, and any other type from a runtime library
the consumer already installs. Scope is strictly `@ark-ui/vue` plus its
`@zag-js` types.

A component whose `types.ts` derives its variant types from a styles
object (`keyof typeof buttonStyles.variant`) and inlines only `asChild`
is in scope for the invariant but has little to re-sync. A component with
no Ark-derived types carries no stamp and is out of scope.

## What gets eliminated

| Kind | Looks like | Replacement |
|---|---|---|
| Props / Emits interfaces | `import type { AccordionRootProps } from '@ark-ui/vue/accordion'` | Hand-written `XxxRootProps` / `XxxRootEmits` in `types.ts` |
| `PolymorphicProps` | `import type { PolymorphicProps } from '@ark-ui/vue'` | Inline `asChild?: boolean` with Ark's JSDoc |
| Leaf detail types | `ValueChangeDetails`, `CollectionItem`, `ListCollection`… | Inline the small `@zag-js/*` interface, drop the namespace qualifier |
| Context API types | `import type { UseFileUploadContext } from '@ark-ui/vue/file-upload'` | Hand-written context interface in `types.ts`, imported by `context.ts` |

For context APIs, copy only the **public** members the component tree
actually consumes. Getters returning `any` are acceptable where that keeps
the local type assignable. The provider bridge still calls Ark's runtime
`useXxxContext()`; only the `createContext<…>` annotation moves.

## Quick start

```bash
cd <target>

node -p "require('@ark-ui/vue/package.json').version"                  # resolved
grep -rho "@ark-ui/vue@[0-9][0-9.]*" src/components/ui/*/types.ts \
  | sort | uniq -c                                                     # claimed

# per component: reconcile types.ts against the Ark .d.ts (Step 2),
# keep shared copies identical (Step 3), re-stamp (Step 4), then gates (Step 5)
```

## Step 1 — Detect the version delta

Compare the resolved version with the stamps (Quick start). The `.d.ts`
source lives at `node_modules/@ark-ui/vue/dist/components/<subpath>/`
inside the target package. Resolve it **through that symlink**. Bun keeps
its store in `node_modules/.bun` at the **repository root**, so a
`find node_modules/.bun` run from inside the package returns nothing.

`@zag-js/*` detail and collection types live at
`node_modules/@zag-js/<name>/dist/`, also symlinks. Exact resolved zag
versions are visible at the repository root under
`node_modules/.bun/@zag-js+<name>@<ver>+…/`.

The old `.d.ts` is usually gone after an upgrade. Do not try to diff
versions; **re-read the current `.d.ts` and reconcile each local
interface field by field**, which works regardless.

## Step 2 — Re-sync each affected component

1. **Find the Ark `.d.ts`.** Directory name and Ark subpath are not
   always the same. Observed in `shadcn-vue-ark`:

   | Component dir | Ark subpath |
   |---|---|
   | `calendar`, `range-calendar` | `date-picker` |
   | `command` | `listbox` (+ `dialog` for `CommandDialog`) |
   | `drawer`, `sheet` | `dialog` |
   | `context-menu`, `dropdown-menu`, `menubar` | `menu` |
   | `resizable` | `splitter` |
   | everything else | same name as the dir |

   In the target, confirm from the component's runtime import
   (`from '@ark-ui/vue/<subpath>'`). `<subpath>/<subpath>.types.d.ts`
   holds the Vue-shaped `RootProps` / `RootEmits` — use these, not the raw
   `@zag-js` props. Per-part `*.vue.d.ts` hold sub-part props.
   `<subpath>/index.d.ts` lists every exported interface; use it to catch
   a new part.
2. **Reconcile `RootProps` / `RootEmits`.** Add new props, fix changed
   types, drop removed ones, including `update:modelValue` and the other
   `update:*` emits.
3. **Reconcile inlined detail types** against
   `node_modules/@zag-js/<name>/dist/index.d.ts`.
   - Outside-events (`FocusOutsideEvent`, `InteractOutsideEvent`,
     `PointerDownOutsideEvent`) come from `@zag-js/dismissable` or
     `@zag-js/interact-outside`. They are `CustomEvent<EventDetails<…>>`;
     copy the exact `EventDetails<T>` shape.
   - `PositioningOptions` — see Landmine A.
   - `CollectionItem` / `ListCollection` — see Landmine C.
   - `DateValue` stays imported from `@internationalized/date` — see
     Landmine B.
4. **Reconcile sub-part props.** Keep required part props required
   (`AccordionItem.value`, `TabsTrigger.value`, `StepsItem.index`…). Name
   each local interface exactly as the `.vue` imports it.
5. **Reconcile context types** if `context.ts` uses a `Use*Context`,
   `Use*Return` or `*Api` interface.
6. **Re-point nothing.** The `.vue` and `context.ts` already import from
   `./types`. Only `types.ts`, and occasionally a `.vue` local `Props` for
   a genuinely new prop, change.

## Step 3 — Keep shared-primitive copies identical

Components that wrap the same Ark primitive but have **no
`registryDependencies` edge** each own an identical copy of the type set,
because a consumer may install only one of them. Change the canonical
copy, replicate verbatim, and verify with `diff`. Observed in
`shadcn-vue-ark`:

| Ark primitive | Canonical | Copies |
|---|---|---|
| `menu` | `dropdown-menu/types.ts` | `context-menu/types.ts`, `menubar/types.ts` |
| `dialog` | `dialog/types.ts` | `drawer/types.ts`, `sheet/types.ts`*, `command/types.ts`* |
| `date-picker` | `calendar/types.ts` | `range-calendar/types.ts` |

\* `sheet` appends a local `SheetContentProps`; `command` holds the
`listbox` set plus its own `dialog` copy. The shared block must match;
only the documented extra differs.

```bash
diff src/components/ui/dropdown-menu/types.ts src/components/ui/context-menu/types.ts   # must be empty
```

The only sanctioned cross-component type import runs along an existing
`registryDependencies` edge (precedent: `date-picker/types.ts` re-exports
`LayoutTypes` from `../calendar/types`, so `calendar` must keep exporting
it). Never invent a new one.

## Step 4 — Update provenance stamps

```ts
// Types extracted from @ark-ui/vue@5.37.0 (re-exports @zag-js/<name>@1.x).
// Faithful 1:1 copy - re-sync by hand when upgrading @ark-ui/vue.
```

- Bump the version in every file you touch, to the **resolved** version.
- A file that inlines only `asChild` may use the shorter
  ``// `asChild` inlined from @ark-ui/vue@5.37.0 `PolymorphicProps`.``
  Bump it the same way.
- Files whose types are not Ark-derived carry no stamp. Leave them.
- Afterwards the claimed-versions grep from Quick start should print a
  single version.

## Step 5 — Verify (the gates)

Run only the commands the target's `package.json` actually has, and say
which were skipped because they do not exist.

### 1. Robust scan — zero Ark/zag type imports

A plain `grep "import type.*@ark-ui/vue"` fails both ways: it misses
multi-line imports, and because the code omits semicolons `.*` bridges a
local `import type { X } from './types'` into a later runtime
`import { ark } from '@ark-ui/vue'`. Use this brace-scoped scanner from
the target package root:

```python
import re, pathlib
ui = pathlib.Path("src/components/ui")
MOD = r"(@ark-ui/vue[^'\"]*|@zag-js[^'\"]*)"
pats = [
    re.compile(r"import\s+type\s*\{[^{}]*\}\s*from\s*['\"]" + MOD + r"['\"]"),
    re.compile(r"import\s+type\s+[A-Za-z_$][\w$]*\s+from\s*['\"]" + MOD + r"['\"]"),
    re.compile(r"import\s+type\s*\*\s*as\s+[A-Za-z_$][\w$]*\s+from\s*['\"]" + MOD + r"['\"]"),
    re.compile(r"import\s*\{[^{}]*\btype\s+[A-Za-z_$][^{}]*\}\s*from\s*['\"]" + MOD + r"['\"]"),
]
hits = {}
for f in sorted(ui.rglob("*")):
    if f.suffix not in (".ts", ".vue") or not f.is_file():
        continue
    txt = f.read_text(encoding="utf-8", errors="replace")
    found = sorted({m.group(1) for p in pats for m in p.finditer(txt)})
    if found:
        hits.setdefault(f.relative_to(ui).parts[0], []).append((str(f.relative_to(ui)), found))
print(">>> CLEAN <<<" if not hits else "\n".join(
    f"[{c}]\n" + "\n".join(f"    {p} -> {m}" for p, m in v) for c, v in sorted(hits.items())))
```

Expect `>>> CLEAN <<<`.

### 2. Typecheck with `vue-tsc`

Use `bun run typecheck` if the script is `vue-tsc` (true in both
`acfatah/ui` and `shadcn-vue-ark` today). If a target's script is plain
`tsc`, run `bunx vue-tsc --noEmit` instead: `tsc` cannot resolve `.vue`
imports and buries the signal under `TS2307` noise.

**Accepted baseline.** Observed in `shadcn-vue-ark` (2026-06-14): 4
`TS2345` errors, from Landmine D (`navigation-menu`, `steps` ×2,
`file-upload`). Five `DateValue` `TS2322` errors from Landmine B resolved
through a dependency dedup and may return if `@internationalized/date`
duplicates again. Establish the target's own baseline **before** the
re-sync; anything new afterwards is yours to fix. If an upgrade resolves
an accepted error, record the new baseline.

### 3. Tests

Run the target's component tests (`acfatah/ui`: `bun run test`, Vitest
browser mode). They are the runtime smoke for touched components,
critical for generic/collection and context-heavy ones. Where the target
has no test for a touched component, say so rather than skipping
silently.

### 4. Lint and format

```bash
bun run lint src/components/ui/<name>      # check mode first
bun run format src/components/ui/<name>    # then fix
```

Re-`diff` shared-primitive copies afterwards; identical input formats
identically.

### 5. Registry build — only where it exists

If the target has a registry build (`shadcn-vue-ark`:
`bun run registry:build`), run it and confirm the output is Ark-type-free
with a brace-scoped pattern, since built JSON embeds each file on one
line:

```bash
grep -oE "import type \{[^{}]*\} from '@(ark-ui/vue|zag-js)" public/r/<name>.json   # expect: empty
```

`acfatah/ui` has no build CLI yet. Say so and skip.

## Conventions to preserve

| Do | Don't |
|---|---|
| Keep `class`, variant and positioning props in the `.vue` local `Props` | Move them into `types.ts` |
| Inline `PolymorphicProps` as `asChild?: boolean` | Re-import `PolymorphicProps` |
| Keep runtime value imports | Remove them — Ark is still the runtime engine |
| Keep non-Ark external types | Inline them — scope is Ark plus its zag types |
| Name local interfaces exactly as the `.vue` imports them | Rename them |
| Re-anchor a local `Placement` alias to the concrete inlined union | Derive it from `XxxRootProps['positioning']['placement']` — circular, `TS2456` |

Vue compiler limit: a `<script setup>` `defineProps` generic interface
cannot always `extends` an imported props type. Write the props inline
where that bites (precedent in `shadcn-vue-ark`: `checkbox`
`CheckboxGroup`).

## Landmines — runtime-binding assignability

The main failure mode: a hand-written type that no longer matches the
type the `.vue` binds on the **runtime** Ark component. The local copy
must stay structurally assignable.

### A. `PositioningOptions` and Floating UI leaf types

`PositioningOptions` is `@zag-js/popper`'s, re-exporting leaf types from
`@floating-ui/dom` and `@floating-ui/utils`. The faithful inlined leaves:

```ts
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Alignment = 'start' | 'end'                 // no 'center' - breaks assignability
export type Placement = Side | `${Side}-${Alignment}`
export interface Rect { x: number, y: number, width: number, height: number }
export interface SideObject { top: number, right: number, bottom: number, left: number }
export type ClientRectObject = Rect & SideObject
export interface VirtualElement {
  getBoundingClientRect: () => ClientRectObject
  getClientRects?: () => Array<ClientRectObject> | DOMRectList
  contextElement?: Element
}
export type Boundary = 'clippingAncestors' | Element | Element[] | Rect
```

In `PositioningOptions`:
`boundary?: (() => Boundary) | Boundary | 'clipping-ancestors'`,
`getAnchorElement?: (() => HTMLElement | VirtualElement | null)`,
`getAnchorRect?: ((el: HTMLElement | VirtualElement | null) => AnchorRect | null)`,
`onComplete?: ((data: any) => void)`. If Ark bumps `@floating-ui/*`,
re-check these against the new `@floating-ui/utils` dist.

### B. `DateValue` brand clash

Ark types `DateValue` as `@zag-js/date-utils`'s; components import it
from `@internationalized/date`. With more than one
`@internationalized/date` copy in the tree, the two are nominally
incompatible (`#private` brand) and produce `TS2322` at the bindings.
Accepted. Do not "fix" it with `@zag-js` types or `any`.

### C. `ListCollection` class versus interface

`@zag-js/collection`'s `ListCollection` is a class with private members;
the local copy is a structural interface. Two fixes, both to preserve:

- Loosen the contravariant self-reference:
  `isEqual: (other: any) => boolean`.
- A minimal, commented `as any` at the `:collection` binding seam, since
  the runtime component wants the class with its privates (`TS2739`).

`CollectionItem` is `any`, matching zag. Generics thread as
`XxxRootProps<T extends CollectionItem = CollectionItem>`.

### D. `useForwardProps` and required props

When a sub-part has a required Ark prop, `vue-tsc` cannot prove it flows
through `useForwardProps` / `useForwardPropsEmits` and reports `TS2345`.
A composable-typing limitation, not a faithfulness defect. Keep the prop
required; do not make it optional to silence the error.

## Component map (observed in `shadcn-vue-ark`)

Re-derive for the target.

- **Generics / collections:** `select`, `combobox`, `command`.
- **Hand-written context API:** `file-upload`, `select`, `tooltip`
  (provider), `radio-group` (provider), the menu provider, `command`.
- **Positioning abstraction:** `popover`, `hover-card`, `tooltip`,
  `dropdown-menu`, `context-menu`, `menubar`, `select`, `combobox`.
- **Custom non-Ark `context.ts`, leave alone:** `avatar`, `pagination`,
  `toggle-group`, `tooltip` (`TooltipOptions`), `timeline`.
- **No Ark-derived types:** `breadcrumb`, `table`, `skeleton`, `spinner`,
  `sonner`, `carousel`, `data-table`, and the `date-picker`,
  `datetime-picker` and `sidebar` wrappers.

## Definition of done

1. Robust scan → `>>> CLEAN <<<`.
2. `vue-tsc` → no errors beyond the target's pre-re-sync baseline.
3. Component tests pass for touched components, or their absence is
   stated.
4. Lint and format clean; shared-primitive copies still `diff`-identical.
5. Stamps bumped to the resolved version; one version left.
6. Registry build clean and Ark-type-free, where the target has one.
