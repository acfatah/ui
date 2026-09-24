<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PopoverTitleProps } from './types'

import { Popover } from '@ark-ui/vue/popover'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { popoverTitleStyles } from './styles'

interface Props extends PopoverTitleProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <Popover.Title
    v-bind="forwardedProps"
    :class="cn(popoverTitleStyles, props.class)"
  >
    <slot />
  </Popover.Title>
</template>
