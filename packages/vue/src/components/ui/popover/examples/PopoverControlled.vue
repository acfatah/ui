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
