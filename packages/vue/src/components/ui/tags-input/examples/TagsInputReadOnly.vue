<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <TagsInput.Root
    placeholder="Add a topic"
    read-only
    :default-value="['design', 'research']"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Topics</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Item
          v-for="(value, index) in api.value"
          :key="index"
          :index="index"
          :value="value"
        />
        <TagsInput.Input />
        <TagsInput.ClearTrigger />
      </TagsInput.Control>
    </TagsInput.Context>
    <TagsInput.HiddenInput />
  </TagsInput.Root>
</template>
