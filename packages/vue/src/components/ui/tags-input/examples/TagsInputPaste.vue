<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <!--
    Paste "ada@example.com; linus@example.com" to add both. The delimiter
    splits pasted text and, typed, adds the tag before it.
  -->
  <TagsInput.Root
    placeholder="Paste addresses"
    add-on-paste
    :delimiter="/[,;]/"
    class="w-80"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Recipients</TagsInput.Label>
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
