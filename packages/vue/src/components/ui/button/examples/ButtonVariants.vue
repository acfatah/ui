<script setup lang="ts">
import type { ButtonVariant } from '@/components/ui/button'

import { Button, buttonStyles } from '@/components/ui/button'
import { ChevronRightIcon } from '@/components/ui/icons'

const variants = Object.keys(buttonStyles.variant) as ButtonVariant[]
</script>

<template>
  <div
    class="
      flex flex-col items-start gap-8
      sm:flex-row
    "
  >
    <div
      v-for="variant in variants"
      :key="variant"
      class="flex items-start gap-2"
    >
      <Button
        :variant="variant"
        class="w-min"
      >
        {{ variant }}
      </Button>

      <Button
        :variant="variant"
        size="icon"
        aria-label="Next"
      >
        <ChevronRightIcon data-part="icon" />
      </Button>
    </div>
  </div>
</template>
