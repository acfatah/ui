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
