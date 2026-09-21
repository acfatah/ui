<script setup lang="ts">
import type { DescriptionProps } from './types'

import { ark } from '@ark-ui/vue'
import { cn } from 'cn'

import { descriptionStyles } from './styles'

const props = defineProps<DescriptionProps>()
</script>

<template>
  <ark.p
    data-scope="description"
    data-part="root"
    :as-child="props.asChild"
    :class="cn(descriptionStyles, props.class)"
  >
    <slot />
  </ark.p>
</template>
