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
