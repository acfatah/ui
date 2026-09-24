<script setup lang="ts">
import { ref } from 'vue'

import { TagsInput } from '@/components/ui/tags-input'

const message = ref('')
</script>

<template>
  <div class="flex w-80 flex-col gap-6">
    <!-- `max` stops adding at three tags; the extra text stays in the input. -->
    <TagsInput.Root
      placeholder="Add a colour"
      :max="3"
      :default-value="['red', 'green']"
    >
      <TagsInput.Context v-slot="api">
        <TagsInput.Label>Colours (up to 3)</TagsInput.Label>
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

    <!--
      `allow-overflow` lets tags past `max` in, marks the field invalid and
      fires `valueInvalid` with the reason `rangeOverflow`.
    -->
    <div class="flex flex-col gap-2">
      <TagsInput.Root
        placeholder="Add a colour"
        :max="3"
        allow-overflow
        :default-value="['red', 'green']"
        @value-change="({ value }) => value.length <= 3 && (message = '')"
        @value-invalid="message = 'Three colours at most.'"
      >
        <TagsInput.Context v-slot="api">
          <TagsInput.Label>Colours (overflow allowed)</TagsInput.Label>
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
      <p
        class="text-sm text-destructive"
        aria-live="polite"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>
