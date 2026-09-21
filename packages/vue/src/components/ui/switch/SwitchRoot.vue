<script setup lang="ts">
import type { SwitchProps, SwitchRootEmits } from './types'

import { Switch } from '@ark-ui/vue/switch'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { computed } from 'vue'

import { useForwardPropsEmits } from '@/composables/useForwardPropsEmits'

import { switchRootStyles } from './styles'

const props = defineProps<SwitchProps>()
const emit = defineEmits<SwitchRootEmits>()
const delegatedProps = reactiveOmit(props, ['class', 'disabled', 'loading'])
const forwardedProps = useForwardPropsEmits(delegatedProps, emit)

/*
  Returning undefined rather than false leaves Ark's own default in place
  and keeps the attributes off an idle switch.
*/
const isDisabled = computed(() => props.disabled || props.loading || undefined)
const isLoading = computed(() => props.loading || undefined)
</script>

<template>
  <Switch.Root
    v-bind="forwardedProps"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="isLoading"
    :data-loading="isLoading"
    :class="cn(switchRootStyles, props.class)"
  >
    <slot />
  </Switch.Root>
</template>
