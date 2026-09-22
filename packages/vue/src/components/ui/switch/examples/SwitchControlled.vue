<script setup lang="ts">
import { ref } from 'vue'

import { Switch } from '@/components/ui/switch'

const checked = ref(true)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Controlled: your ref holds the state, `v-model:checked` syncs it. -->
    <Switch.Root v-model:checked="checked">
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Controlled (checked: {{ checked }})</Switch.Label>
    </Switch.Root>

    <!-- Uncontrolled: the switch holds the state from its initial value. -->
    <Switch.Root default-checked>
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Uncontrolled (defaultChecked)</Switch.Label>
    </Switch.Root>
  </div>
</template>
