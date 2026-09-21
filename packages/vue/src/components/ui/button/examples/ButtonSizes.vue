<script setup lang="ts">
import type { ButtonSize } from '@/components/ui/button'

import { Button, buttonStyles } from '@/components/ui/button'
import { ArrowUpIcon } from '@/components/ui/icons'

const sizes = Object.keys(buttonStyles.size) as ButtonSize[]
</script>

<template>
  <div
    class="
      flex flex-col items-start gap-8
      sm:flex-row
    "
  >
    <div
      v-for="size in sizes"
      :key="size"
      class="flex items-start gap-2"
    >
      <template v-if="size.startsWith('icon')">
        {{ size }}:&nbsp;
      </template>
      <template v-else>
        <Button :size="size" variant="outline">
          {{ size }}
        </Button>
      </template>

      <Button
        :size="size"
        variant="outline"
        aria-label="Submit"
      >
        <ArrowUpIcon data-part="icon" />
      </Button>
    </div>
  </div>
</template>
