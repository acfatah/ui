<!-- Generated from the acfatah/ui docs page apps/docs/src/content/docs/components/tags-input.mdx. Do not edit. -->

# Tags Input

Registry item `vue/tags-input`.

A text input that turns what is typed into a list of removable, editable tags.
Built on Ark UI's `TagsInput`; styles live in a framework-free `styles.ts`.

```vue
<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <TagsInput.Root placeholder="Add a framework" :default-value="['vue', 'ark-ui', 'tailwind']">
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Frameworks</TagsInput.Label>
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
```

## Usage

```vue
<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
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
```

## Examples

### Default

`TagsInput.Root` owns the tags and the text being typed. Render one
`TagsInput.Item` per value, read through `TagsInput.Context`; with no
children an item draws the tag, its delete button and the input used to edit
it. Type and press `Enter`, or the delimiter (`,` by default), to add a tag.
`TagsInput.HiddenInput` submits the tags with a form, joined by `, `.

```vue
<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
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
```

### Disabled

`disabled` disables the input, the delete buttons and the clear button, with
or without tags.

```vue
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
```

### Controlled

Bind `v-model` to hold the tags in your own ref. Leave it off and pass
`default-value` to let the tags input hold its own. `v-model:input-value`
does the same for the text being typed.

```vue
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
```

### Invalid

`invalid` sets `aria-invalid` on the input and outlines the field.

```vue
<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <TagsInput.Root
    placeholder="Add a label"
    invalid
    :default-value="['urgent']"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Labels</TagsInput.Label>
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
```

### Read only

`read-only` shows the tags but ignores typing, deleting and clearing. The
field stays focusable.

```vue
<script setup lang="ts">
import { TagsInput } from '@/components/ui/tags-input'
</script>

<template>
  <TagsInput.Root
    placeholder="Add a topic"
    read-only
    :default-value="['design', 'research']"
  >
    <TagsInput.Context v-slot="api">
      <TagsInput.Label>Topics</TagsInput.Label>
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
```

### Blur behavior

`blur-behavior="add"` turns text left in the input into a tag when focus
leaves; `"clear"` discards it. Without it, the text stays in the input.

```vue
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
```

### Custom item

Give `TagsInput.Item` children to compose a tag from its parts:
`ItemPreview` holds `ItemText` and `ItemDeleteTrigger`, and `ItemInput`
replaces the preview while the tag is edited. This one drops the delete
button.

```vue
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
```

### Editable

Tags are editable by default: double-click one, or highlight it with the
arrow keys and press `Enter`. `Enter` saves the edit and `Escape` cancels it.
`:editable="false"` turns editing off.

```vue
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
```

### Many tags

Tags wrap onto new lines as the field fills, and a tag longer than the field
truncates rather than widening it.

```vue
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
```

### Max

`max` stops adding once the field holds that many tags; the extra text stays
in the input. `allow-overflow` lets tags past `max` in instead, marks the
field invalid and fires `valueInvalid` with the reason `rangeOverflow`.

```vue
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
```

### Paste

`add-on-paste` turns pasted text into tags, split on the delimiter.
`delimiter` takes a string or a regular expression, and also adds the typed
tag when entered.

```vue
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
```

### Validate

`sanitize-value` rewrites a tag before it is checked (it trims by default),
and `validate` refuses a tag by returning `false`, firing `valueInvalid` with
the reason `invalidTag`. Duplicates are dropped unless `allow-duplicates` is
set.

```vue
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
```

## References

- [Ark UI Tags Input](https://ark-ui.com/docs/components/tags-input)
- [shadcn-vue Tags Input](https://www.shadcn-vue.com/docs/components/tags-input)
