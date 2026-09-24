<script setup lang="ts">
import type { TagsInputProps, TagsInputRootEmits } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardPropsEmits } from '@/composables/useForwardPropsEmits'

import { tagsInputRootStyles } from './styles'

const props = defineProps<TagsInputProps>()
const emit = defineEmits<TagsInputRootEmits>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardPropsEmits(delegatedProps, emit)
</script>

<template>
  <TagsInput.Root
    v-bind="forwardedProps"
    :class="cn(tagsInputRootStyles, props.class)"
  >
    <slot />
  </TagsInput.Root>
</template>
