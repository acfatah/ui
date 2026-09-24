<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputItemTextProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputItemTextStyles } from './styles'

interface Props extends TagsInputItemTextProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.ItemText
    v-bind="forwardedProps"
    :class="cn(tagsInputItemTextStyles, props.class)"
  >
    <slot />
  </TagsInput.ItemText>
</template>
