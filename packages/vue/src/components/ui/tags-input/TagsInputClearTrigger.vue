<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputClearTriggerProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { XIcon } from '@/components/ui/icons'
import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputClearTriggerStyles } from './styles'

interface Props extends TagsInputClearTriggerProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.ClearTrigger
    v-bind="forwardedProps"
    :class="cn(tagsInputClearTriggerStyles, props.class)"
  >
    <slot>
      <XIcon aria-hidden="true" />
    </slot>
  </TagsInput.ClearTrigger>
</template>
