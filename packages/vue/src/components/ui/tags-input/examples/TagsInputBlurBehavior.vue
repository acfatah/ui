<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <!-- Text left in the input becomes a tag when focus leaves. -->
    <TagsInput.Root placeholder="Type, then tab away" blur-behavior="add">
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Add on blur</TagsInput.Label>
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

    <!-- Text left in the input is discarded when focus leaves. -->
    <TagsInput.Root placeholder="Type, then tab away" blur-behavior="clear">
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Clear on blur</TagsInput.Label>
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
