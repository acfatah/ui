<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SwitchHiddenInputProps } from './types'

import { Switch } from '@ark-ui/vue/switch'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { switchHiddenInputStyles } from './styles'

interface Props extends SwitchHiddenInputProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Zag renders a plain checkbox, which screen readers announce as one.
  `role="switch"` is valid on a checkbox input and announces on/off.
-->
<template>
  <Switch.HiddenInput
    v-bind="forwardedProps"
    role="switch"
    :class="cn(switchHiddenInputStyles, props.class)"
  >
    <slot />
  </Switch.HiddenInput>
</template>
