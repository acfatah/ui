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
