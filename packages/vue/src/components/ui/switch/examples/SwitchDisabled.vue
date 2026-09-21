<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <div class="flex flex-col gap-4">
    <Switch.Root disabled>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Bluetooth</Switch.Label>
    </Switch.Root>

    <Switch.Root
      disabled
      default-checked
    >
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Location services</Switch.Label>
    </Switch.Root>
  </div>
</template>
