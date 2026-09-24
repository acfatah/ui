<script setup lang="ts">
import type { PopoverTriggerProps } from './types'

import { Popover } from '@ark-ui/vue/popover'

import { useForwardProps } from '@/composables/useForwardProps'

const props = defineProps<PopoverTriggerProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <Popover.Trigger v-bind="forwardedProps">
    <slot />
  </Popover.Trigger>
</template>
