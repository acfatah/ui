<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PopoverDescriptionProps } from './types'

import { Popover } from '@ark-ui/vue/popover'
import { reactiveOmit } from '@vueuse/core'

import { Description } from '@/components/ui/description'
import { useForwardProps } from '@/composables/useForwardProps'

interface Props extends PopoverDescriptionProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class', 'asChild')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Ark's part supplies the id the content's `aria-describedby` points at;
  the shared `description` component supplies the look.
-->
<template>
  <Popover.Description
    v-bind="forwardedProps"
    as-child
  >
    <Description
      :as-child="props.asChild"
      :class="props.class"
    >
      <slot />
    </Description>
  </Popover.Description>
</template>
