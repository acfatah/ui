<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <!-- Double-click a tag, or highlight it and press Enter, to edit it. -->
    <TagsInput.Root placeholder="Add a status" :default-value="['draft', 'review']">
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Editable (default)</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Item
            v-for="(value, index) in api.value"
            :key="index"
            :index="index"
            :value="value"
          />
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Context>
      <TagsInput.HiddenInput />
    </TagsInput.Root>

    <TagsInput.Root
      placeholder="Add a status"
      :editable="false"
      :default-value="['draft', 'review']"
    >
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Not editable</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Item
            v-for="(value, index) in api.value"
            :key="index"
            :index="index"
            :value="value"
          />
          <TagsInput.Input />
        </TagsInput.Control>
      </TagsInput.Context>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  </div>
</template>
