<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <Switch.Root default-checked>
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Wi-Fi</Switch.Label>
  </Switch.Root>
</template>
