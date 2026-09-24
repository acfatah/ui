<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <TagsInput.Root placeholder="Add a tag" disabled>
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Disabled, empty</TagsInput.Label>
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

    <TagsInput.Root
      placeholder="Add a tag"
      disabled
      :default-value="['design', 'research']"
    >
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Disabled, with tags</TagsInput.Label>
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
  </div>
</template>
