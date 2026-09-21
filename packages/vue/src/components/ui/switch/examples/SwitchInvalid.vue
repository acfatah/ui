<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <!-- `invalid` sets aria-invalid on the input and outlines the track. -->
  <Switch.Root
    invalid
    required
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <div class="flex flex-col gap-0.5">
      <Switch.Label>Accept the terms</Switch.Label>
      <Switch.Description>
        You must accept the terms to continue.
      </Switch.Description>
    </div>
  </Switch.Root>
</template>
