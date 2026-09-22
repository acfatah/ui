<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SwitchThumbProps } from './types'

import { Switch } from '@ark-ui/vue/switch'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { switchThumbStyles } from './styles'

interface Props extends SwitchThumbProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <Switch.Thumb
    v-bind="forwardedProps"
    :class="cn(switchThumbStyles, props.class)"
  >
    <slot />
  </Switch.Thumb>
</template>
