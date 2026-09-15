<script setup lang="ts">
import type { ButtonProps } from './types'

import { ark } from '@ark-ui/vue'
import { cn } from 'cn'
import { computed } from 'vue'

import { buttonStyles } from './styles'

const props = withDefaults(defineProps<ButtonProps>(), {
  size: 'md',
  type: 'button',
  variant: 'default',
})

/*
  `loading` disables the button as well as marking it busy. Returning
  undefined rather than false keeps the attribute off the element
  entirely, so `:disabled` and `[aria-disabled]` selectors do not match a
  button that is merely idle.
*/
const nativeDisabled = computed(() => props.disabled || props.loading || undefined)
const isLoading = computed(() => props.loading || undefined)
</script>

<template>
  <ark.button
    data-scope="button"
    data-part="root"
    :as-child="props.asChild"
    :type="props.type"
    :disabled="nativeDisabled"
    :aria-disabled="nativeDisabled"
    :aria-busy="isLoading"
    :data-loading="isLoading"
    :class="cn(
      buttonStyles.base,
      buttonStyles.variant[props.variant],
      buttonStyles.size[props.size],
      props.class,
    )"
  >
    <slot />
  </ark.button>
</template>
