<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PopoverArrowProps } from './types'

import { Popover } from '@ark-ui/vue/popover'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { popoverArrowStyles, popoverArrowTipStyles } from './styles'

interface Props extends PopoverArrowProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Ark splits the arrow into a sized box and a rotated tip. The tip is
  always wanted, so it is the default slot content and `<Popover.Arrow />`
  is complete on its own.
-->
<template>
  <Popover.Arrow
    v-bind="forwardedProps"
    :class="cn(popoverArrowStyles, props.class)"
  >
    <slot>
      <Popover.ArrowTip :class="popoverArrowTipStyles" />
    </slot>
  </Popover.Arrow>
</template>
