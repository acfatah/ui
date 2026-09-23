<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/button.mdx. Do not edit. -->

# Button

Registry item `vue/button`.

Displays a button or a component that looks like a button. Built on Ark UI's
`ark.button` factory; styles live in a framework-free `styles.ts`.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpIcon } from '@/components/ui/icons'
</script>

<template>
  <div
    class="
      flex flex-wrap items-center gap-2
      md:flex-row
    "
  >
    <Button variant="outline">
      Button
    </Button>

    <Button
      variant="outline"
      size="icon"
      aria-label="Submit"
    >
      <ArrowUpIcon data-part="icon" />
    </Button>
  </div>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="outline">
    Button
  </Button>
</template>
```

## Examples

### Sizes

Every `size`. The `icon` sizes are square and expect a single icon with an
`aria-label`.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpRightIcon } from '@/components/ui/icons'
</script>

<template>
  <div
    class="
      flex flex-col items-start gap-8
      sm:flex-row
    "
  >
    <div class="flex items-start gap-2">
      <Button size="xs" variant="outline">
        xs
      </Button>
      <Button
        size="icon-xs"
        aria-label="Submit"
        variant="outline"
      >
        <ArrowUpRightIcon data-part="icon" />
      </Button>
    </div>

    <div class="flex items-start gap-2">
      <Button size="sm" variant="outline">
        Small
      </Button>
      <Button
        size="icon-sm"
        aria-label="Submit"
        variant="outline"
      >
        <ArrowUpRightIcon data-part="icon" />
      </Button>
    </div>

    <div class="flex items-start gap-2">
      <Button variant="outline">
        Default
      </Button>
      <Button
        size="icon"
        aria-label="Submit"
        variant="outline"
      >
        <ArrowUpRightIcon data-part="icon" />
      </Button>
    </div>

    <div class="flex items-start gap-2">
      <Button variant="outline" size="lg">
        Large
      </Button>
      <Button
        size="icon-lg"
        aria-label="Submit"
        variant="outline"
      >
        <ArrowUpRightIcon data-part="icon" />
      </Button>
    </div>
  </div>
</template>
```

### Default

The variant a button gets with no prop: `bg-primary` with the primary
foreground, darkening on hover. Shown with an icon-only companion.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronRightIcon } from '@/components/ui/icons'
</script>

<template>
  <div class="flex items-start gap-2">
    <Button>
      Default
    </Button>

    <Button
      size="icon"
      aria-label="Next"
    >
      <ChevronRightIcon data-part="icon" />
    </Button>
  </div>
</template>
```

### Secondary

A muted `bg-secondary` surface for lower-emphasis actions next to a
primary one.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="secondary">
    Secondary
  </Button>
</template>
```

### Error

The error fill, `bg-error` with `text-error-foreground` and matching
focus-ring tones; for irreversible actions such as deleting data. Like the
other status variants below, hover shifts the fill towards the page
foreground, which keeps the label's contrast rather than lowering it.
The tokens are described in Status colors.

> **Note:** shadcn/ui calls this variant `destructive`. Here the variants share the
> status token names: `error`, `success`, `info` and `warning`.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="error">
    Error
  </Button>
</template>
```

### Success

The success fill, `bg-success` with `text-success-foreground`, for
confirming or completing an action.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="success">
    Success
  </Button>
</template>
```

### Info

The info fill, `bg-info` with `text-info-foreground`, for neutral,
informational actions that should still stand out.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="info">
    Info
  </Button>
</template>
```

### Warning

The warning fill, `bg-warning` with `text-warning-foreground`, for
actions that deserve a second look before the user commits.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="warning">
    Warning
  </Button>
</template>
```

### Outline

Bordered with a transparent background; picks up a subtle `bg-input/30`
surface in dark mode.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="outline">
    Outline
  </Button>
</template>
```

### Ghost

No chrome until hover, so it sits quietly in dense toolbars.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="ghost">
    Ghost
  </Button>
</template>
```

### Link

Styled as a link — `text-primary`, underlining on hover — while behaving
as a button.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="link">
    Link
  </Button>
</template>
```

### Rounded

Override the radius through `class`; `cn` resolves the conflict.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpIcon } from '@/components/ui/icons'
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    aria-label="Scroll up"
    class="rounded-full"
  >
    <ArrowUpIcon data-part="icon" />
  </Button>
</template>
```

### With icon

Icons come from `@/components/ui/icons`, the single icon indirection, and take
`data-part="icon"`.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { GitBranchIcon } from '@/components/ui/icons'
</script>

<template>
  <Button variant="outline" size="sm">
    <GitBranchIcon data-part="icon" />
    New Branch
  </Button>
</template>
```

### Loading

`loading` marks the button busy and blocks activation without setting native
`disabled`, so focus stays on the button. The spinner is slot content you
supply.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { LoaderCircleIcon } from '@/components/ui/icons'
</script>

<!--
  `loading` marks the button busy and blocks activation without setting
  the native `disabled` attribute, so it keeps focus rather than dropping
  it to <body> the moment a submit starts. The spinner is ordinary slot
  content; the button does not draw one for you.
-->
<template>
  <Button
    size="sm"
    variant="outline"
    loading
  >
    <LoaderCircleIcon data-part="icon" class="animate-spin" />
    Submit
  </Button>
</template>
```

### As child

`as-child` renders the single child element instead of a `<button>`, merging
props and styles onto it. Use it for links that look like buttons.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button as-child>
    <a href="/login">Login</a>
  </Button>
</template>
```

## References

- [Ark UI factory](https://ark-ui.com/docs/guides/composition#the-ark-factory)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
