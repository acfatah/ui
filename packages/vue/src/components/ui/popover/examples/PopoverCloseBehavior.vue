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
