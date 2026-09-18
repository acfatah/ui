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
  Returning undefined rather than false keeps an attribute off the element
  entirely, so `:disabled` and `[aria-disabled]` selectors do not match a
  button that is merely idle.
*/
const isDisabled = computed(() => props.disabled || undefined)
const isInert = computed(() => props.disabled || props.loading || undefined)
const isLoading = computed(() => props.loading || undefined)
const tabindex = computed(() => (props.asChild && props.disabled ? -1 : undefined))

const classes = computed(() => cn(
  buttonStyles.base,
  buttonStyles.variant[props.variant],
  buttonStyles.size[props.size],
  props.class,
))

function onClick(event: MouseEvent) {
  if (!isInert.value)
    return

  event.preventDefault()
  event.stopImmediatePropagation()
}
</script>

<template>
  <ark.button
    data-scope="button"
    data-part="root"
    :as-child="props.asChild"
    :type="props.asChild ? undefined : props.type"
    :disabled="isDisabled"
    :aria-disabled="isInert"
    :aria-busy="isLoading"
    :data-loading="isLoading"
    :tabindex="tabindex"
    :class="classes"
    @click="onClick"
  >
    <slot />
  </ark.button>
</template>
