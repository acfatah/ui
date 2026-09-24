<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PopoverContentProps } from './types'

import { Popover, usePopoverContext } from '@ark-ui/vue/popover'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { popoverContentStyles } from './styles'

interface Props extends PopoverContentProps {
  class?: HTMLAttributes['class']
}

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
const popover = usePopoverContext()
</script>

<!--
  Attributes go to the content, not the positioner: the content is the
  element a consumer styles, labels and queries. The positioner is Zag's
  and carries only the computed placement. The teleport follows the
  root's `portalled`, so the DOM order matches the tab order Zag assumes.
-->
<template>
  <Teleport
    to="body"
    :disabled="!popover.portalled"
  >
    <Popover.Positioner>
      <Popover.Content
        v-bind="{ ...$attrs, ...forwardedProps }"
        :class="cn(popoverContentStyles, props.class)"
      >
        <slot />
      </Popover.Content>
    </Popover.Positioner>
  </Teleport>
</template>
