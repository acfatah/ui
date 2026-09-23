<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/switch.mdx. Do not edit. -->

# Switch

Registry item `vue/switch`.

A control that allows the user to toggle between checked and not checked.
Built on Ark UI's `Switch`; styles live in a framework-free `styles.ts`.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <div class="flex w-72 flex-col gap-6">
    <Switch.Root default-checked>
      <Switch.HiddenInput />
      <Switch.Control />
      <div class="flex flex-col gap-0.5">
        <Switch.Label>Marketing emails</Switch.Label>
        <Switch.Description>
          Receive product news and updates.
        </Switch.Description>
      </div>
    </Switch.Root>

    <Switch.Root>
      <Switch.HiddenInput />
      <Switch.Control />
      <div class="flex flex-col gap-0.5">
        <Switch.Label>Security alerts</Switch.Label>
        <Switch.Description>
          Get notified about suspicious activity.
        </Switch.Description>
      </div>
    </Switch.Root>
  </div>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <Switch.Root>
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Airplane mode</Switch.Label>
  </Switch.Root>
</template>
```

## Examples

### Default

`Switch.Root` renders a `<label>`, so clicking anywhere on it toggles.
`Switch.HiddenInput` is the native checkbox that takes focus and submits with
a form; `Switch.Control` draws the track and its thumb.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <Switch.Root>
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Airplane mode</Switch.Label>
  </Switch.Root>
</template>
```

### Checked

`default-checked` starts the switch on.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <Switch.Root default-checked>
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Wi-Fi</Switch.Label>
  </Switch.Root>
</template>
```

### Disabled

`disabled` takes the switch out of the tab order and ignores clicks, in
either state.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <div class="flex flex-col gap-4">
    <Switch.Root disabled>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Bluetooth</Switch.Label>
    </Switch.Root>

    <Switch.Root
      disabled
      default-checked
    >
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Location services</Switch.Label>
    </Switch.Root>
  </div>
</template>
```

### Controlled

Bind `v-model:checked` to hold the state in your own ref. Leave it off
and pass `default-checked` to let the switch hold its own state.

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { Switch } from '@/components/ui/switch'

const checked = ref(true)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Controlled: your ref holds the state, `v-model:checked` syncs it. -->
    <Switch.Root v-model:checked="checked">
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Controlled (checked: {{ checked }})</Switch.Label>
    </Switch.Root>

    <!-- Uncontrolled: the switch holds the state from its initial value. -->
    <Switch.Root default-checked>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Uncontrolled (defaultChecked)</Switch.Label>
    </Switch.Root>
  </div>
</template>
```

### Invalid

`invalid` sets `aria-invalid` on the input and outlines the track.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <!-- `invalid` sets aria-invalid on the input and outlines the track. -->
  <Switch.Root
    invalid
    required
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <div class="flex flex-col gap-0.5">
      <Switch.Label>Accept the terms</Switch.Label>
      <Switch.Description>
        You must accept the terms to continue.
      </Switch.Description>
    </div>
  </Switch.Root>
</template>
```

### Read only

`read-only` keeps the switch focusable and announced but ignores clicks
and keys, for a setting the user can see but not change here.

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <!--
    Read-only stays focusable and is announced, but ignores clicks and
    keys. Use it for a setting the user can see but not change here.
  -->
  <Switch.Root
    read-only
    default-checked
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Managed by your organisation</Switch.Label>
  </Switch.Root>
</template>
```

### Loading

`loading` disables the switch and marks it busy with `aria-busy` while the
change it started is saved.

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { Switch } from '@/components/ui/switch'

const checked = ref(false)
const loading = ref(false)

/*
  `loading` disables the switch and marks it busy while the change it
  started is saved. The timeout stands in for a request.
*/
function save(value: boolean) {
  loading.value = true
  setTimeout(() => {
    checked.value = value
    loading.value = false
  }, 1500)
}
</script>

<template>
  <Switch.Root
    :checked="checked"
    :loading="loading"
    @update:checked="save"
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>{{ loading ? 'Saving…' : 'Sync across devices' }}</Switch.Label>
  </Switch.Root>
</template>
```

## References

- [Ark UI Switch](https://ark-ui.com/docs/components/switch)
- [shadcn/ui Switch](https://ui.shadcn.com/docs/components/switch)
