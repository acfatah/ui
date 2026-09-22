<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SwitchControlProps } from './types'

import { Switch } from '@ark-ui/vue/switch'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { switchControlStyles } from './styles'
import SwitchThumb from './SwitchThumb.vue'

interface Props extends SwitchControlProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <Switch.Control
    v-bind="forwardedProps"
    :class="cn(switchControlStyles, props.class)"
  >
    <slot>
      <SwitchThumb />
    </slot>
  </Switch.Control>
</template>
