<script setup lang="ts">
import { ref } from 'vue'

import { TagsInput } from '@/components/ui/tags-input'

const tags = ref(['vue', 'ark-ui'])
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <!-- Controlled: your ref holds the tags, `v-model` syncs it. -->
    <TagsInput.Root v-model="tags" placeholder="Add a tag">
      <TagsInput.Label>Controlled ({{ tags.join(', ') || 'none' }})</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Item
          v-for="(value, index) in tags"
          :key="index"
          :index="index"
          :value="value"
        />
        <TagsInput.Input />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>

    <!-- Uncontrolled: the tags input holds the tags from its initial value. -->
    <TagsInput.Root placeholder="Add a tag" :default-value="['vue', 'ark-ui']">
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Uncontrolled (defaultValue)</TagsInput.Label>
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
