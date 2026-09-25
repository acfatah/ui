<script setup lang="ts">
import type { PopoverCloseTriggerProps } from './types'

import { Popover } from '@ark-ui/vue/popover'

import { useForwardProps } from '@/composables/useForwardProps'

const props = defineProps<PopoverCloseTriggerProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <Popover.CloseTrigger v-bind="forwardedProps">
    <slot />
  </Popover.CloseTrigger>
</template>
