<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <!--
    `asChild` puts the label styles on your own element instead of a
    <label>, for a caption that belongs to no single control.
  -->
  <Label as-child>
    <span>Notification settings</span>
  </Label>
</template>
