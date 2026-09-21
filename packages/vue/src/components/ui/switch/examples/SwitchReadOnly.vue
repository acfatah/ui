<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <!--
    Read-only stays focusable and is announced, but ignores clicks and
    keys. Use it for a setting the user can see but not change here.
  -->
  <Switch.Root
    read-only
    default-checked
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>Managed by your organisation</Switch.Label>
  </Switch.Root>
</template>
