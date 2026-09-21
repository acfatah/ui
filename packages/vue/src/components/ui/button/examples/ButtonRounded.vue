<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpIcon } from '@/components/ui/icons'
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    aria-label="Scroll up"
    class="rounded-full"
  >
    <ArrowUpIcon data-part="icon" />
  </Button>
</template>
