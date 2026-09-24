<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputItemPreviewProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputItemPreviewStyles } from './styles'

interface Props extends TagsInputItemPreviewProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.ItemPreview
    v-bind="forwardedProps"
    :class="cn(tagsInputItemPreviewStyles, props.class)"
  >
    <slot />
  </TagsInput.ItemPreview>
</template>
