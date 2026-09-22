<script setup lang="ts">
import type { LabelProps } from './types'

import { ark } from '@ark-ui/vue'
import { cn } from 'cn'

import { labelStyles } from './styles'

const props = defineProps<LabelProps>()
</script>

<template>
  <ark.label
    data-scope="label"
    data-part="root"
    :as-child="props.asChild"
    :class="cn(labelStyles, props.class)"
  >
    <slot />
  </ark.label>
</template>
