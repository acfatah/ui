# Create Props and Emits type interfaces

Create `Props` and `Emits` interfaces for the component(s) under the given
directory (or directories). Skip all tests. Pick the pattern by component type.

## Case A: Ark-backed component (extend the decoupled type from `types.ts`)

When the component wraps an Ark UI part, extend the hand-inlined type from the
component's `types.ts` and forward Ark's emits via `defineEmits<XxxEmits>()`.
Do NOT re-list Ark's props by hand, and never import a type from `@ark-ui/vue`.

```vue
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'

import { useForwardPropsEmits } from '@/composables/useForwardPropsEmits'

import type { FileUploadRootEmits, FileUploadRootProps } from './types'

interface Props extends FileUploadRootProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<FileUploadRootEmits>()
const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardPropsEmits(delegatedProps, emit)
</script>
```

## Case B: native / non-Ark input wrapper (standalone interfaces)

When the component is a native HTML input wrapper (no Ark prop surface to
extend), declare standalone `Props`/`Emits` and bridge `modelValue` with
`useVModel`.

```vue
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from 'cn'

interface Props {
  defaultValue?: File[]
  modelValue?: File[]
  multiple?: boolean
  accept?: string
  name?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}

interface Emits {
  (e: 'update:modelValue', payload: File[]): void
  (e: 'change', payload: File[]): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
</script>
```
