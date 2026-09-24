<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/label.mdx. Do not edit. -->

# Label

Registry item `vue/label`.

Renders an accessible label associated with controls. Built on Ark UI's
`ark.label` factory; styles live in a framework-free `styles.ts`.

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      id="terms"
      type="checkbox"
      class="peer size-4"
    >
    <Label for="terms">
      Accept terms and conditions
    </Label>
  </div>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <Label for="email">
    Email
  </Label>
</template>
```

## Examples

### Disabled

The label dims when the control before it is disabled. The control needs
the `peer` class and must come first in the markup.

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <!--
    The label dims itself when the control before it is disabled. That
    needs the control to carry `peer` and to come first in the markup.
  -->
  <div class="flex items-center gap-2">
    <input
      id="newsletter"
      type="checkbox"
      class="peer size-4"
      disabled
    >
    <Label for="newsletter">
      Subscribe to the newsletter
    </Label>
  </div>
</template>
```

### As child

`asChild` puts the label styles on your own element instead of a
`<label>`, for a caption that belongs to no single control.

```vue
<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <!--
    `asChild` puts the label styles on your own element instead of a
    <label>, for a caption that belongs to no single control.
  -->
  <Label as-child>
    <span>Notification settings</span>
  </Label>
</template>
```

## References

- [Ark UI factory](https://ark-ui.com/docs/guides/composition#the-ark-factory)
- [shadcn/ui Label](https://ui.shadcn.com/docs/components/label)
