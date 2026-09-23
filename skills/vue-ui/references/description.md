<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/description.mdx. Do not edit. -->

# Description

Registry item `vue/description`.

Supporting text that gives a control, title or heading more context. Built
on Ark UI's `ark.p` factory; styles live in a framework-free `styles.ts`.

Other components wrap it for their own description part, such as
`Switch.Description`, so help text looks the same across the UI.

```vue
<script setup lang="ts">
import { Description } from '@/components/ui/description'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="grid gap-2">
    <Label for="username">
      Username
    </Label>
    <input
      id="username"
      class="h-9 rounded-md border px-3 text-sm"
      aria-describedby="username-description"
    >
    <Description id="username-description">
      This is your public display name.
    </Description>
  </div>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { Description } from '@/components/ui/description'
</script>

<template>
  <Description>
    This is your public display name.
  </Description>
</template>
```

## Examples

### With link

A link placed directly inside the description is underlined, and takes
the primary colour on hover.

```vue
<script setup lang="ts">
import { Description } from '@/components/ui/description'
</script>

<template>
  <!-- A link directly inside the description is underlined. -->
  <Description>
    Read the <a href="#privacy">privacy policy</a> before you continue.
  </Description>
</template>
```

## References

- [Ark UI factory](https://ark-ui.com/docs/guides/composition#the-ark-factory)
