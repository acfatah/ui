<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <!--
    `placeholder` goes on Root: it shows only while there are no tags.
    Context exposes the tags as `api.value`; each Item needs index and
    value. Control, not Root, draws the bordered field.
  -->
  <TagsInput.Root placeholder="Add a tag">
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Tags</TagsInput.Label>
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
