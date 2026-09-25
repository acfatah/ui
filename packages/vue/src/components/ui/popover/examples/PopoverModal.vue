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
