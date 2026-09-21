<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { GitBranchIcon } from '@/components/ui/icons'
</script>

<template>
  <Button variant="outline" size="sm">
    <GitBranchIcon data-part="icon" />
    New Branch
  </Button>
</template>
