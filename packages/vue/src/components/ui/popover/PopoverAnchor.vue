<script setup lang="ts">
import type { PopoverAnchorProps } from './types'

import { Popover } from '@ark-ui/vue/popover'

import { useForwardProps } from '@/composables/useForwardProps'

const props = defineProps<PopoverAnchorProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <Popover.Anchor v-bind="forwardedProps">
    <slot />
  </Popover.Anchor>
</template>
