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
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Switch.Root already renders a <label>, so the label styles go onto a
  <span>: a second <label> nested inside it would be invalid.
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
      <span><slot /></span>
    </Label>
  </Switch.Label>
</template>
