<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <!--
    Give an item children to compose its parts yourself. This one drops the
    delete trigger, so tags leave only by Backspace or the clear trigger.
  -->
  <TagsInput.Root
    placeholder="Add a release"
    :default-value="['alpha', 'beta']"
    class="w-80"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Releases</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Item
          v-for="(value, index) in api.value"
          :key="index"
          :index="index"
          :value="value"
        >
          <TagsInput.ItemPreview class="pr-2">
            <TagsInput.ItemText>{{ value }}</TagsInput.ItemText>
          </TagsInput.ItemPreview>
          <TagsInput.ItemInput />
        </TagsInput.Item>
        <TagsInput.Input />
        <TagsInput.ClearTrigger />
      </TagsInput.Control>
    </TagsInput.Context>
    <TagsInput.HiddenInput />
  </TagsInput.Root>
</template>
