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
