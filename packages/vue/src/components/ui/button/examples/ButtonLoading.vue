<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { LoaderCircleIcon } from '@/components/ui/icons'
</script>

<!--
  `loading` marks the button busy and blocks activation without setting
  the native `disabled` attribute, so it keeps focus rather than dropping
  it to <body> the moment a submit starts. The spinner is ordinary slot
  content; the button does not draw one for you.
-->
<template>
  <Button
    size="sm"
    variant="outline"
    loading
  >
    <LoaderCircleIcon data-part="icon" class="animate-spin" />
    Submit
  </Button>
</template>
