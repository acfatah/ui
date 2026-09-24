<script setup lang="ts">
import type { ValidateArgs } from '@/components/ui/tags-input'

import { TagsInput } from '@/components/ui/tags-input'

// Lower-case the tag before it is checked, then accept only slugs.
const sanitizeValue = (value: string) => value.trim().toLowerCase()
const validate = ({ inputValue }: ValidateArgs) => /^[a-z0-9-]+$/.test(inputValue)
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <TagsInput.Root
      placeholder="Try My Tag, then my-tag"
      :sanitize-value="sanitizeValue"
      :validate="validate"
    >
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Slugs only</TagsInput.Label>
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

    <!-- Duplicates are rejected by default; `allow-duplicates` lets them in. -->
    <TagsInput.Root
      placeholder="Add vue again"
      allow-duplicates
      :default-value="['vue', 'vue']"
    >
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Duplicates allowed</TagsInput.Label>
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
