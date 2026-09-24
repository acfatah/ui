<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TagsInputItemProps } from './types'

import { TagsInput } from '@ark-ui/vue/tags-input'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardProps } from '@/composables/useForwardProps'

import { tagsInputItemStyles } from './styles'
import TagsInputItemDeleteTrigger from './TagsInputItemDeleteTrigger.vue'
import TagsInputItemInput from './TagsInputItemInput.vue'
import TagsInputItemPreview from './TagsInputItemPreview.vue'
import TagsInputItemText from './TagsInputItemText.vue'

interface Props extends TagsInputItemProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  With no children an item renders the full tag: a preview holding the
  text and a delete trigger, and the input Ark shows while it is edited.
-->
<template>
  <TagsInput.Item
    v-bind="forwardedProps"
    :class="cn(tagsInputItemStyles, props.class)"
  >
    <slot>
      <TagsInputItemPreview>
        <TagsInputItemText>{{ props.value }}</TagsInputItemText>
        <TagsInputItemDeleteTrigger />
      </TagsInputItemPreview>
      <TagsInputItemInput />
    </slot>
  </TagsInput.Item>
</template>
