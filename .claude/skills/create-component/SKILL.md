---
name: create-component
description: Author a Vue UI component end to end in a shadcn registry — directory layout, styles.ts, decoupled types.ts, context.ts, namespace.ts, _registry.ts, index.ts. Takes the target components directory as an argument. Manual invocation only.
disable-model-invocation: true
argument-hint: "[target-dir] [ComponentName]"
---

# Creating new UI components

Patterns and conventions for authoring a component in a shadcn registry
built on Ark UI. This file is the orchestrator; the focused sub-step
playbooks live in `references/` (read them when you reach that step).

| Sub-step | Reference |
|---|---|
| `namespace.ts` (dotted export) | `references/namespace.md` |
| `context.ts` (shared state) | `references/context.md` |
| `_registry.ts` (manifest) | `references/registry.md` |
| `Props`/`Emits` interfaces | `references/props-emits.md` |

## 0. Establish the target

This skill is repo-agnostic. It writes nothing until it knows where.

1. **Target directory and component name** come from the arguments
   (`[target-dir] [ComponentName]`). If either is missing, ask. Do not
   guess, and do not assume `packages/registry` or `packages/vue` —
   each path belongs to one specific repository.
2. **Discover what the target actually provides** before writing imports.
   List these and use what is there, rather than assuming the paths in this
   document:

   ```bash
   ls <target>/src/composables/
   ls <target>/src/components/ui/icons/
   cat <target>/tsconfig.json          # confirm the @/ alias
   cat <target>/src/components/ui/*/styles.ts | head   # re-exports?
   ```

3. **Read the target repo's own `CLAUDE.md` and `docs/`** if present. A
   repository's own conventions win over this skill wherever they differ.

Examples below use `@/` as the alias and `src/components/ui/<name>/` as the
component root because both repositories use them. Verify, don't assume.

## Directory structure

```text
components/ui/{component-name}/
├── {ComponentName}.vue        (simple components)
├── {ComponentName}Root.vue    (complex components)
├── {ComponentName}Item.vue    (if applicable)
├── {ComponentName}Content.vue (if applicable)
├── {ComponentName}Trigger.vue (if applicable)
├── index.ts
├── types.ts
├── styles.ts
├── context.ts                 (complex components with shared state)
├── namespace.ts               (complex components)
└── _registry.ts
```

There is no `variant.ts`. Everything that was in it is now in `styles.ts`.

## 1. Vue component structure

```vue
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { {ArkComponent} } from '@ark-ui/vue/{ark-component}'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
// Import useForwardProps or useForwardPropsEmits as needed

import { {componentName}{Part}Styles } from './styles'

interface Props {
  class?: HTMLAttributes['class']
  // Add other props as needed
}

const props = withDefaults(defineProps<Props>(), {
  // Set default values if needed
})

const delegatedProps = reactiveOmit(props, 'class')
// useForwardProps for components without emits
// useForwardPropsEmits for components with emits
</script>

<template>
  <{ArkComponent}.{Part}
    data-scope="{component-name-kebab}"
    data-part="{part-name-kebab}"
    v-bind="forwardedProps"
    :class="cn({componentName}{Part}Styles, props.class)"
  >
    <slot />
  </{ArkComponent}.{Part}>
</template>
```

For non-Ark components, add `data-scope` (component name, kebab-case) and
`data-part` (sub-element role, kebab-case) attributes. Replace any legacy
`data-slot` with `data-scope` / `data-part`.

For the full `Props`/`Emits` scaffolding (Ark-backed vs native-wrapper cases),
see `references/props-emits.md`.

## 2. Component types

- **Simple** (Button, Badge, Spinner, Separator): single `.vue`, types in
  `types.ts`, classes in `styles.ts`.
- **Complex** (Accordion, Checkbox, RadioGroup, Field): multiple part `.vue`
  files, a Root container, `namespace.ts`, often `context.ts`.

## 3. Styles (`styles.ts`)

No Tailwind class strings live in templates. They live in `styles.ts` as
plain TypeScript, which a component imports. There is no variant library —
no `cva`, no `tailwind-variants`. `cn` from the `cn` package does all
composition.

This keeps styles greppable, diffable and readable without parsing a Vue
template, and it is the entire multi-framework hedge: `styles.ts` has no
Vue in it.

### Where the real file lives

Check in §0 whether the target repo keeps styles in a separate shared
package. `acfatah/ui` does: the real file is
`shared/styles/components/ui/<name>/styles.ts`, and the component
directory holds a one-line re-export so `./styles` resolves in
development:

```ts
// packages/vue/src/components/ui/button/styles.ts
export * from '~shared/styles/components/ui/button/styles'
```

Write the class strings in the shared file, never in the re-export. The
re-export is not published: `_registry.ts` ships the shared file with a
`target` beside the component. If the target keeps `styles.ts` in the
component directory, as `acfatah/shadcn-vue-ark` does, write it there.

### Naming

`<componentName><Part>Styles`, camelCase. A single-element component drops
the part: `buttonStyles`. One export per part — never a nested object of
all parts.

### Two shapes

**A part with no variants exports a plain string.**

```ts
// accordion/styles.ts
export const accordionRootStyles = 'w-full'
export const accordionItemStyles = 'border-b'
export const accordionTriggerStyles = 'flex flex-1 items-center justify-between py-4'
export const accordionContentStyles = 'overflow-hidden text-sm'
```

```vue
<!-- AccordionTrigger.vue -->
:class="cn(accordionTriggerStyles, props.class)"
```

**A part with variants exports an object** with `base` plus one record per
variant axis.

```ts
// button/styles.ts
export const buttonStyles = {
  base: 'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',

  variant: {
    default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
    destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
    outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },

  size: {
    sm: 'h-8 gap-1.5 rounded-md px-3',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 rounded-md px-6',
    icon: 'size-9',
  },
}
```

```vue
<!-- Button.vue -->
<script setup lang="ts">
import { ark } from '@ark-ui/vue'
import { cn } from 'cn'

import type { ButtonProps } from './types'
import { buttonStyles } from './styles'

const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'md',
  type: 'button',
  variant: 'default',
})
</script>

<template>
  <ark.button
    data-scope="button"
    data-part="root"
    :class="cn(
      buttonStyles.base,
      buttonStyles.variant[props.variant],
      buttonStyles.size[props.size],
      props.class,
    )"
  >
    <slot />
  </ark.button>
</template>
```

`icon` is an ordinary `size` key, not a special mechanism. The svg sizing
rules sit in `base`, so a leading-icon button and an icon-only button share
them.

### Defaults

Defaults live in `withDefaults` in the SFC. There is no `defaultVariants`
equivalent in `styles.ts`.

This is deliberate: `withDefaults` makes `props.variant` non-optional *in
the type*, so `buttonStyles.variant[props.variant]` indexes cleanly with no
`?? 'default'` at the call site. A defaults key in `styles.ts` would leave
the prop optional and force a fallback at every index.

A JS consumer passing a bogus string gets `undefined` from the lookup,
which `cn` drops — the component renders unstyled but functional rather
than throwing.

### Compound variants

There is **no** `compoundVariants` key. Nothing reads one. A rule that
depends on two axes at once is an explicit `computed` in the SFC, appended
to the `cn(...)` call:

```ts
const compound = computed(() =>
  props.variant === 'link' && props.size === 'icon' ? 'size-auto p-0' : '',
)
```

```vue
:class="cn(base, variantClass, sizeClass, compound, props.class)"
```

### Variant types

Derived in `types.ts` with `keyof typeof` — see section 4. No `as const` is
needed; object-literal keys are already literal under `keyof`.

Adding a variant is a one-line edit to `styles.ts`. The type widens on its
own, and a consumer who installed the component does exactly the same thing
to their copy.

## 4. Component types (`types.ts`)

Variant types derive from the styles object:

```ts
// button/types.ts
import type { HTMLAttributes } from 'vue'

import type { buttonStyles } from './styles'

export type ButtonVariant = keyof typeof buttonStyles.variant
export type ButtonSize = keyof typeof buttonStyles.size

export interface ButtonProps {
  asChild?: boolean
  class?: HTMLAttributes['class']
  disabled?: boolean
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
}
```

For richer prop surfaces, types are DECOUPLED from Ark: never import a type
from `@ark-ui/vue` or `@zag-js`. Hand-write a faithful 1:1 copy of Ark's
surface in `types.ts`, stamped with the version it was copied from, then
extend it:

```ts
// types.ts
// Types extracted from @ark-ui/vue@5.37.0 (re-exports @zag-js/select@1.x).
// Faithful 1:1 copy - re-sync by hand when upgrading @ark-ui/vue.
import type { HTMLAttributes } from 'vue'

export type CollectionItem = any

export interface SelectRootProps<T extends CollectionItem = CollectionItem> {
  // ... reproduce Ark's prop surface verbatim
}

export interface SelectProps extends SelectRootProps<CollectionItem> {
  align?: 'start' | 'center' | 'end'
  class?: HTMLAttributes['class']
  invalid?: boolean
  loading?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
}
```

`asChild` for polymorphic parts is inlined as `asChild?: boolean` (do not
import `PolymorphicProps`). Keep `class` and `variant` in the `.vue` local
Props, not in the copied Ark surface.

## 5. Injection pattern (context.ts)

Complex components that share Root state with descendants use a `context.ts`
(`createContext` provide/inject). Full pattern and Tooltip example:
`references/context.md`.

## 6. index.ts export pattern

Both flat exports and the namespace object ship. Only the namespace is
documented — see section 7.

Simple:

```ts
export { default as {ComponentName} } from './{ComponentName}.vue'
export * from './types'
export { {componentName}Styles } from './styles'
```

Complex:

```ts
export { {ComponentName} } from './namespace'
export { default as {ComponentName}Root } from './{ComponentName}Root.vue'
export { default as {ComponentName}Content } from './{ComponentName}Content.vue'
export { default as {ComponentName}Item } from './{ComponentName}Item.vue'
// ... other sub-components
export * from './types'
```

## 7. namespace.ts pattern

Complex components expose a dotted `Foo.Root` / `Foo.Part` namespace object
and re-export it from `index.ts`.

**The namespace is the one documented convention.** Flat exports ship too,
but every example, demo and agent rule uses `Accordion.Root`, never
`AccordionRoot`. Two documented conventions is how agents become
inconsistent.

Full RadioGroup template: `references/namespace.md`.

## 8. _registry.ts pattern

Each component has a metadata-only manifest. Files and `import`-derived
dependencies are scanned automatically. NEVER list composables or lib files
in `files[]` (the build throws). Any custom CSS the component needs (a
`@utility` class, `@keyframes`, or a `--animate-*` / theme token) ships via
`cssVars` + `css` so it installs with the component. Full pattern and the
packaging model: `references/registry.md`.

## 9. Import conventions

Verify each of these against the target (section 0) before using it.

- Ark UI components: `@ark-ui/vue/{component-name}`
- Ark UI base element (runtime value): `import { ark } from '@ark-ui/vue'` (e.g.
  `<ark.button>`). Do NOT import `PolymorphicProps` as a type; inline
  `asChild?: boolean` in `types.ts`
- Vue utilities: `@vueuse/core` (e.g. `reactiveOmit`)
- Class name merging: `import { cn } from 'cn'` — the npm package, not a
  local `lib/utils` re-export
- Composables (`use*` only): `@/composables/useForwardPropsEmits`,
  `@/composables/useForwardProps`, `@/composables/useForwardExpose`
- Helpers: `@/lib/createContext`. Pure factories and functions live in
  `src/lib/`, not `src/composables/` — see the `create-composable` skill
- Dynamic/asChild: `import { Dynamic } from '@/lib/dynamic'`
- Styles: `./styles`
- **Icons: `@/components/ui/icons` only.** No component imports an icon
  package directly, ever. The icons module is one file of named re-exports
  that the consumer owns, so swapping icon sets is one edit rather than
  hundreds:

  ```ts
  // src/components/ui/icons/index.ts
  export { CheckIcon, ChevronDownIcon, XIcon } from '@lucide/vue'
  ```

  ```vue
  import { ChevronDownIcon } from '@/components/ui/icons'
  ```

  Note `lucide-vue-next` is deprecated on npm in favour of `@lucide/vue`.
  Either way it is named in the icons module and nowhere else.

## 10. Styling conventions

- Tailwind CSS v4; `cn()` composes, `styles.ts` holds the strings
- `data-scope` / `data-part` for styling context
- Responsive prefixes where needed; consistent focus and state styles
- Icon-only controls need an `aria-label`. Nothing enforces this
  automatically — check it yourself.

## 11. Type safety

- TypeScript throughout; define types in `types.ts`, not inline
- Variant types via `keyof typeof` against `styles.ts`
- Types decoupled from Ark (see section 4); inline `asChild?: boolean` for
  `ark.*` primitives
- `HTMLAttributes` from Vue for the `class` prop type

## Step-by-step

1. Establish the target directory and component name (section 0), and
   discover the target's composables, icons module and alias.
2. Create `components/ui/{component-name}/`
3. Decide simple vs complex
4. Create `styles.ts` (string shape or object shape, section 3)
5. Create `types.ts` (`references/props-emits.md` for the interfaces)
6. Create the `.vue` files
7. Create `context.ts` if it needs shared state (`references/context.md`)
8. Create `index.ts`
9. Create `namespace.ts` if complex (`references/namespace.md`)
10. Create `_registry.ts` (`references/registry.md`)
11. Run the target's formatter over the new component directory (commonly
    `bun run format <component-directory>` from the target package root),
    then its typecheck.

## Best practices

- Follow Ark UI accessibility guidelines; use `context7` for Ark/shadcn docs
- Keep components composable; forward props for attribute delegation
- Add JSDoc comments in namespace files; include proper data attributes
- Do not destructure style parts into bare local names. A `trigger` const
  sits beside Ark's trigger part and any template ref of the same name —
  import `accordionTriggerStyles` and use it under that name.
