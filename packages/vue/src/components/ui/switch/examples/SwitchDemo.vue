<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <div class="flex w-72 flex-col gap-6">
    <Switch.Root default-checked>
      <Switch.HiddenInput />
      <Switch.Control />
      <div class="flex flex-col gap-0.5">
        <Switch.Label>Marketing emails</Switch.Label>
        <Switch.Description>
          Receive product news and updates.
        </Switch.Description>
      </div>
    </Switch.Root>

    <Switch.Root>
      <Switch.HiddenInput />
      <Switch.Control />
      <div class="flex flex-col gap-0.5">
        <Switch.Label>Security alerts</Switch.Label>
        <Switch.Description>
          Get notified about suspicious activity.
        </Switch.Description>
      </div>
    </Switch.Root>
  </div>
</template>
