<script setup lang="ts">
import { ref } from 'vue'

import { Switch } from '@/components/ui/switch'

const checked = ref(false)
const loading = ref(false)

/*
  `loading` disables the switch and marks it busy while the change it
  started is saved. The timeout stands in for a request.
*/
function save(value: boolean) {
  loading.value = true
  setTimeout(() => {
    checked.value = value
    loading.value = false
  }, 1500)
}
</script>

<template>
  <Switch.Root
    :checked="checked"
    :loading="loading"
    @update:checked="save"
  >
    <Switch.HiddenInput />
    <Switch.Control />
    <Switch.Label>{{ loading ? 'Saving…' : 'Sync across devices' }}</Switch.Label>
  </Switch.Root>
</template>
