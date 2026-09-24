<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputItemInputProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputItemInputStyles } from './styles'

interface Props extends TagsInputItemInputProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.ItemInput
    v-bind="forwardedProps"
    :class="cn(tagsInputItemInputStyles, props.class)"
  >
    <slot />
  </TagsInput.ItemInput>
</template>
