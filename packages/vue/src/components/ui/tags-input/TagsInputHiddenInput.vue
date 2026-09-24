<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputHiddenInputProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'

import { useForwardProps } from '@/composables/useForwardProps'

interface Props extends TagsInputHiddenInputProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TagsInput.HiddenInput
    v-bind="forwardedProps"
    :class="props.class"
  >
    <slot />
  </TagsInput.HiddenInput>
</template>
