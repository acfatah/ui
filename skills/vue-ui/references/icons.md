<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/icons.mdx. Do not edit. -->

# Icons

Registry item `vue/icons`.

Components import every icon from `@/components/ui/icons`, never from an icon
package, so swapping icon sets is one edit. The module is one file of named
re-exports from [Lucide](https://lucide.dev), and you own it once installed.

```vue
<script setup lang="ts">
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  GitBranchIcon,
  LoaderCircleIcon,
} from '@/components/ui/icons'

const icons = [
  { name: 'ArrowUpIcon', icon: ArrowUpIcon },
  { name: 'ArrowUpRightIcon', icon: ArrowUpRightIcon },
  { name: 'ChevronRightIcon', icon: ChevronRightIcon },
  { name: 'GitBranchIcon', icon: GitBranchIcon },
  { name: 'LoaderCircleIcon', icon: LoaderCircleIcon },
]
</script>

<template>
  <ul
    class="
      grid grid-cols-2 gap-3
      sm:grid-cols-3
    "
  >
    <li
      v-for="{ name, icon } in icons"
      :key="name"
      class="flex flex-col items-center gap-2 rounded-md border p-4 text-xs text-muted-foreground"
    >
      <component
        :is="icon"
        class="size-5 text-foreground"
        aria-hidden="true"
      />
      <code>{{ name }}</code>
    </li>
  </ul>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { ArrowUpIcon } from '@/components/ui/icons'
</script>

<template>
  <ArrowUpIcon aria-hidden="true" />
</template>
```

Inside a component, an icon takes `data-part="icon"` so the component can size
and space it. See [Button, With icon](button.md#with-icon).

## Adding an icon

Add a named export to `components/ui/icons/index.ts`:

```ts
export {
  ArrowUpIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
  GitBranchIcon,
  LoaderCircleIcon,
} from '@lucide/vue'
```

## Swapping icon sets

Re-point the exports at a different package, or at hand-written SFCs. Keep the
export names and nothing else changes.

```ts
export { default as ArrowUpIcon } from './ArrowUp.vue'
export { default as ChevronRightIcon } from './ChevronRight.vue'
```

> **Note:** `lucide-vue-next` is deprecated on npm in favour of `@lucide/vue`. Use
> `@lucide/vue`.

## Accessibility

- An icon beside visible text is decorative; hide it with `aria-hidden="true"`.
- An icon-only control needs an accessible name, such as `aria-label` on the
  button.

## References

- [Lucide for Vue](https://lucide.dev/guide/packages/lucide-vue)
