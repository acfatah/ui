<script setup lang="ts">
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  GitBranchIcon,
  LoaderCircleIcon,
} from '@/components/ui/icons'

const icons = [
  { name: 'ArrowUpIcon', icon: ArrowUpIcon },
  { name: 'ArrowUpRightIcon', icon: ArrowUpRightIcon },
  { name: 'ChevronRightIcon', icon: ChevronRightIcon },
  { name: 'GitBranchIcon', icon: GitBranchIcon },
  { name: 'LoaderCircleIcon', icon: LoaderCircleIcon },
]
</script>

<template>
  <ul
    class="
      grid grid-cols-2 gap-3
      sm:grid-cols-3
    "
  >
    <li
      v-for="{ name, icon } in icons"
      :key="name"
      class="flex flex-col items-center gap-2 rounded-md border p-4 text-xs text-muted-foreground"
    >
      <component
        :is="icon"
        class="size-5 text-foreground"
        aria-hidden="true"
      />
      <code>{{ name }}</code>
    </li>
  </ul>
</template>
