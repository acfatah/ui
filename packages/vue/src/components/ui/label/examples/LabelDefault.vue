<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      id="terms"
      type="checkbox"
      class="peer size-4"
    >
    <Label for="terms">
      Accept terms and conditions
    </Label>
  </div>
</template>
