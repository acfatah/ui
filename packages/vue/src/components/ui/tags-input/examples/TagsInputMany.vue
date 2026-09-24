<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'

const skills = [
  'typescript',
  'vue',
  'tailwind',
  'accessibility',
  'testing',
  'design-systems',
  'a-very-long-tag-that-does-not-fit-on-one-line-of-the-field',
  'performance',
  'i18n',
]
</script>

<template>
  <!-- Tags wrap onto new lines, and a tag longer than the field truncates. -->
  <TagsInput.Root
    placeholder="Add a skill"
    :default-value="skills"
    class="w-72"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Skills</TagsInput.Label>
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
