<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SwitchLabelProps } from './types'

import { Switch } from '@ark-ui/vue/switch'
import { reactiveOmit } from '@vueuse/core'

import { Label } from '@/components/ui/label'
import { useForwardProps } from '@/composables/useForwardProps'

interface Props extends SwitchLabelProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class', 'asChild')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Switch.Root already renders a <label>, so the label styles go onto a
  <span>: a second <label> nested inside it would be invalid. With
  `asChild` they go onto the consumer's child instead.
-->
<template>
  <Switch.Label
    v-bind="forwardedProps"
    as-child
  >
    <Label
      as-child
      :class="props.class"
    >
      <slot v-if="props.asChild" />
      <span v-else><slot /></span>
    </Label>
  </Switch.Label>
</template>
