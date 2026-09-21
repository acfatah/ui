<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronRightIcon } from '@/components/ui/icons'
</script>

<template>
  <div class="flex items-start gap-2">
    <Button>
      Default
    </Button>

    <Button
      size="icon"
      aria-label="Next"
    >
      <ChevronRightIcon data-part="icon" />
    </Button>
  </div>
</template>
