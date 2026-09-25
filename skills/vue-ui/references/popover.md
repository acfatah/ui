<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/popover.mdx. Do not edit. -->

# Popover

Registry item `vue/popover`.

Displays rich content in a floating layer, anchored to the element that opened
it. Built on Ark UI's `Popover`; the content is teleported to `<body>` and
placed against its trigger.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <Popover.Root>
    <Popover.Trigger as-child>
      <Button variant="outline">
        Open popover
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Arrow />
      <div class="flex flex-col gap-2">
        <Popover.Title>Dimensions</Popover.Title>
        <Popover.Description>
          Set the dimensions for the layer.
        </Popover.Description>
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="popover-demo-width">Width</Label>
        <input
          id="popover-demo-width"
          value="100%"
          class="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 text-sm"
        >
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="popover-demo-height">Height</Label>
        <input
          id="popover-demo-height"
          value="25px"
          class="col-span-2 h-8 rounded-md border border-input bg-transparent px-3 text-sm"
        >
      </div>
    </Popover.Content>
  </Popover.Root>
</template>
```

## Usage

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <Popover.Root>
    <Popover.Trigger as-child>
      <Button variant="outline">
        Open
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>About</Popover.Title>
      <Popover.Description>
        Place content for the popover here.
      </Popover.Description>
    </Popover.Content>
  </Popover.Root>
</template>
```

The content is a `dialog`. Give it a `Popover.Title`, or an `aria-label`
on `Popover.Content` when it is too small for one, so assistive technology
announces what opened.

With `lazy-mount`, or a title shown by `v-if`, use `aria-label` on
`Popover.Content`. Ark checks for a title only when the popover is created,
so a title that appears later does not name the content.

A popover opened inside another closes with it. Ark does not deliver
`request-dismiss` to your listener, so to react to that close, listen to
the outer popover's `@update:open` (or `@open-change`) instead.

## Examples

### Default

`Popover.Trigger` toggles the popover and `Popover.Content` holds what it
shows. The trigger is unstyled, so it takes a `Button` through `as-child`.
`Popover.Title` and `Popover.Description` label and describe the content.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <Popover.Root>
    <Popover.Trigger as-child>
      <Button variant="outline">
        Open
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>About</Popover.Title>
      <Popover.Description>
        Place content for the popover here.
      </Popover.Description>
    </Popover.Content>
  </Popover.Root>
</template>
```

### Controlled

Bind `v-model:open` to hold the open state in your own ref; closing from
outside the popover updates it. Leave it off to let the popover hold its own
state.

```vue
<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'

const open = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <!-- Controlled: your ref holds the state, `v-model:open` syncs it. -->
    <Popover.Root v-model:open="open">
      <Popover.Trigger as-child>
        <Button variant="outline">
          Controlled
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Controlled</Popover.Title>
        <Popover.Description>
          Closing from outside the popover updates the ref.
        </Popover.Description>
      </Popover.Content>
    </Popover.Root>
    <span class="text-sm text-muted-foreground">open: {{ open }}</span>

    <!-- Uncontrolled: the popover holds its own state. -->
    <Popover.Root>
      <Popover.Trigger as-child>
        <Button variant="outline">
          Uncontrolled
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Uncontrolled</Popover.Title>
        <Popover.Description>
          The popover tracks its own open state.
        </Popover.Description>
      </Popover.Content>
    </Popover.Root>
  </div>
</template>
```

### Placement

`positioning.placement` picks the side the content opens on. It flips to the
opposite side when there is no room. `Popover.Arrow` points back at the
trigger from whichever side it lands on. These popovers are too small for a
title, so `aria-label` names each one.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'

const placements = ['left', 'top', 'bottom', 'right'] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Popover.Root
      v-for="placement in placements"
      :key="placement"
      :positioning="{ placement }"
    >
      <Popover.Trigger as-child>
        <Button variant="outline">
          {{ placement }}
        </Button>
      </Popover.Trigger>
      <!-- Too small for a title: `aria-label` names the dialog instead. -->
      <Popover.Content
        class="w-auto"
        :aria-label="`${placement} popover`"
      >
        <Popover.Arrow />
        Opens on the {{ placement }}.
      </Popover.Content>
    </Popover.Root>
  </div>
</template>
```

### Anchor

`Popover.Anchor` positions the content against another element while the
trigger still opens it.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <Popover.Root>
    <div class="flex items-center gap-4">
      <Popover.Anchor class="rounded-md border border-dashed px-4 py-2 text-sm">
        Anchored here
      </Popover.Anchor>
      <Popover.Trigger as-child>
        <Button variant="outline">
          Open
        </Button>
      </Popover.Trigger>
    </div>
    <Popover.Content>
      <Popover.Title>Anchored</Popover.Title>
      <Popover.Description>
        Positioned against the anchor, not the trigger.
      </Popover.Description>
    </Popover.Content>
  </Popover.Root>
</template>
```

### Close behavior

`:close-on-interact-outside="false"` keeps the popover open on an outside
click, for content the user should not lose by accident. Escape and
`Popover.CloseTrigger` still close it. Leave Escape on: with both off, focus
can move on and leave the popover covering the page.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <!--
    Stays open on an outside click; Escape and the close button shut it.
    Keep Escape: with both off, focus can leave and strand the popover
    over the page.
  -->
  <Popover.Root :close-on-interact-outside="false">
    <Popover.Trigger as-child>
      <Button variant="outline">
        Open
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>Unsaved changes</Popover.Title>
      <Popover.Description>
        Clicking outside leaves this open.
      </Popover.Description>
      <Popover.CloseTrigger as-child>
        <Button
          size="sm"
          variant="secondary"
        >
          Close
        </Button>
      </Popover.CloseTrigger>
    </Popover.Content>
  </Popover.Root>
</template>
```

### Modal

`modal` traps focus inside the content, hides the rest of the page from
screen readers and blocks scrolling until the popover closes. The close
trigger is labelled "close" by default, whatever its text, so give it
visible text with the same word, or set its own `aria-label`.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover } from '@/components/ui/popover'
</script>

<template>
  <!--
    Modal traps focus inside the content, hides the rest of the page from
    screen readers and blocks scrolling until it closes.
  -->
  <Popover.Root modal>
    <Popover.Trigger as-child>
      <Button variant="outline">
        Open modal popover
      </Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>Focus is trapped</Popover.Title>
      <Popover.Description>
        Tab cycles inside the popover. Escape or Close shuts it.
      </Popover.Description>
      <Popover.CloseTrigger as-child>
        <Button size="sm">
          Close
        </Button>
      </Popover.CloseTrigger>
    </Popover.Content>
  </Popover.Root>
</template>
```

## References

- [Ark UI Popover](https://ark-ui.com/docs/components/popover)
- [shadcn/ui Popover](https://ui.shadcn.com/docs/components/popover)
