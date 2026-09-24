<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputControlProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputControlStyles } from './styles'

interface Props extends TagsInputControlProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.Control
    v-bind="forwardedProps"
    :class="cn(tagsInputControlStyles, props.class)"
  >
    <slot />
  </TagsInput.Control>
</template>
