<script setup lang="ts">
import type { PopoverRootEmits, PopoverRootProps } from './types'

import { Popover } from '@ark-ui/vue/popover'

import { useForwardPropsEmits } from '@/composables/useForwardPropsEmits'

const props = defineProps<PopoverRootProps>()
const emit = defineEmits<PopoverRootEmits>()
const forwardedProps = useForwardPropsEmits(props, emit)
</script>

<!--
  Renders no element of its own, so it takes no `class`. It owns the open
  state and the machine every other part reads.
-->
<template>
  <Popover.Root v-bind="forwardedProps">
    <slot />
  </Popover.Root>
</template>
