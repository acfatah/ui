<script setup lang="ts">
import { Description } from '@/components/ui/description'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="grid gap-2">
    <Label for="username">
      Username
    </Label>
    <input
      id="username"
      class="h-9 rounded-md border px-3 text-sm"
      aria-describedby="username-description"
    >
    <Description id="username-description">
      This is your public display name.
    </Description>
  </div>
</template>
