<script setup lang="ts">
import type { DescriptionProps } from '@/components/ui/description'

import { Description } from '@/components/ui/description'

const props = defineProps<DescriptionProps>()
</script>

<template>
  <Description
    data-scope="switch"
    data-part="description"
    :as-child="props.asChild"
    :class="props.class"
  >
    <slot />
  </Description>
</template>
