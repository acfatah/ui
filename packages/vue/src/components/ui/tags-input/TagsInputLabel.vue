<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputLabelProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'

import { Label } from '@/components/ui/label'
import { useForwardProps } from '@/composables/useForwardProps'

interface Props extends TagsInputLabelProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class', 'asChild')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Ark renders a <label> for the text input and `label` renders one too,
  so Ark's props land on `label`'s element through as-child. The
  consumer's `asChild` goes to `label`, which then renders their child.
-->
<template>
  <TagsInput.Label
    v-bind="forwardedProps"
    as-child
  >
    <Label
      :as-child="props.asChild"
      :class="props.class"
    >
      <slot />
    </Label>
  </TagsInput.Label>
</template>
