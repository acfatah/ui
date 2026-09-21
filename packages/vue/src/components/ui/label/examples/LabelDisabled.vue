<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>

<template>
  <!--
    The label dims itself when the control before it is disabled. That
    needs the control to carry `peer` and to come first in the markup.
  -->
  <div class="flex items-center gap-2">
    <input
      id="newsletter"
      type="checkbox"
      class="peer size-4"
      disabled
    >
    <Label for="newsletter">
      Subscribe to the newsletter
    </Label>
  </div>
</template>
