<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputInputProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputInputStyles } from './styles'

interface Props extends TagsInputInputProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.Input
    v-bind="forwardedProps"
    :class="cn(tagsInputInputStyles, props.class)"
  >
    <slot />
  </TagsInput.Input>
</template>
