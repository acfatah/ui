// Types extracted from @ark-ui/vue@5.39.2 (re-exports @zag-js/tags-input@1.x).
// Faithful 1:1 copy — re-sync by hand when upgrading @ark-ui/vue.

import type { HTMLAttributes } from 'vue'

// ── Outside-event details (inlined from @zag-js/interact-outside) ────────────
export interface EventDetails<T> {
  originalEvent: T
  contextmenu: boolean
  focusable: boolean
  target: EventTarget
}

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>

export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>

export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent

// ── Detail types (inlined from @zag-js/tags-input) ───────────────────────────
export interface ValueChangeDetails {
  value: string[]
}

export interface InputValueChangeDetails {
  inputValue: string
}

export interface HighlightChangeDetails {
  highlightedValue: string | null
}

export type ValidityState = 'rangeOverflow' | 'invalidTag'

export interface ValidityChangeDetails {
  reason: ValidityState
}

export interface ValidateArgs {
  inputValue: string
  value: string[]
}

export interface IntlTranslations {
  clearTriggerLabel?: string | undefined
  deleteTagTriggerLabel?: ((value: string) => string) | undefined
  tagSelected?: ((value: string) => string) | undefined
  tagAdded?: ((value: string) => string) | undefined
  tagsPasted?: ((value: string[]) => string) | undefined
  tagEdited?: ((value: string) => string) | undefined
  tagUpdated?: ((value: string) => string) | undefined
  tagDeleted?: ((value: string) => string) | undefined
  noTagsSelected?: string | undefined
  inputLabel?: ((count: number) => string) | undefined
}

export interface ItemProps {
  index: string | number
  value: string
  disabled?: boolean | undefined
}

// ── Root ─────────────────────────────────────────────────────────────────────
export interface TagsInputRootProps {
  /**
   * Whether to add a tag when you paste values into the tag input
   * @default false
   */
  addOnPaste?: boolean

  /**
   * Whether to allow duplicate tags
   * @default false
   */
  allowDuplicates?: boolean

  /**
   * Whether to allow tags to exceed max. In this case,
   * we'll attach `data-invalid` to the root
   */
  allowOverflow?: boolean

  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean

  /**
   * Whether the input should be auto-focused
   */
  autoFocus?: boolean

  /**
   * The behavior of the tags input when the input is blurred
   * - `"add"`: add the input value as a new tag
   * - `"clear"`: clear the input value
   */
  blurBehavior?: 'clear' | 'add'

  /**
   * The initial tag input value when rendered.
   * Use when you don't need to control the tag input value.
   */
  defaultInputValue?: string

  /**
   * The initial tag value when rendered.
   * Use when you don't need to control the tag value.
   */
  defaultValue?: string[]

  /**
   * The character that serves has:
   * - event key to trigger the addition of a new tag
   * - character used to split tags when pasting into the input
   *
   * @default ","
   */
  delimiter?: string | RegExp

  /**
   * Whether the tags input should be disabled
   */
  disabled?: boolean

  /**
   * Whether a tag can be edited after creation, by pressing `Enter` or double clicking.
   * @default true
   */
  editable?: boolean

  /**
   * The associate form of the underlying input element.
   */
  form?: string

  /**
   * The unique identifier of the machine.
   */
  id?: string

  /**
   * The ids of the elements in the tags input. Useful for composition.
   */
  ids?: Partial<{
    root: string
    input: string
    hiddenInput: string
    clearBtn: string
    label: string
    control: string
    item: (opts: ItemProps) => string
    itemDeleteTrigger: (opts: ItemProps) => string
    itemInput: (opts: ItemProps) => string
  }>

  /**
   * The controlled tag input's value
   */
  inputValue?: string

  /**
   * Whether the tags input is invalid
   */
  invalid?: boolean

  /**
   * The max number of tags
   * @default Infinity
   */
  max?: number

  /**
   * The max length of the input.
   */
  maxLength?: number

  /**
   * The v-model value of the tags input
   */
  modelValue?: string[]

  /**
   * The name attribute for the input. Useful for form submissions
   */
  name?: string

  /**
   * The placeholder text for the input when there are no tags
   */
  placeholder?: string

  /**
   * Whether the tags input should be read-only
   */
  readOnly?: boolean

  /**
   * Whether the tags input is required
   */
  required?: boolean

  /**
   * Function to sanitize the tag value before adding it
   */
  sanitizeValue?: (value: string) => string

  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations

  /**
   * Returns a boolean that determines whether a tag can be added.
   * Useful for preventing duplicates or invalid tag values.
   */
  validate?: (details: ValidateArgs) => boolean
}

export interface TagsInputRootEmits {
  /**
   * Function called when the focus is moved outside the component
   */
  'focusOutside': [event: FocusOutsideEvent]

  /**
   * Callback fired when a tag is highlighted by pointer or keyboard navigation
   */
  'highlightChange': [details: HighlightChangeDetails]

  /**
   * Callback fired when the input value is updated
   */
  'inputValueChange': [details: InputValueChangeDetails]

  /**
   * Function called when an interaction happens outside the component
   */
  'interactOutside': [event: InteractOutsideEvent]

  /**
   * Function called when the pointer is pressed down outside the component
   */
  'pointerDownOutside': [event: PointerDownOutsideEvent]

  /**
   * Callback fired when the tag values is updated
   */
  'valueChange': [details: ValueChangeDetails]

  /**
   * Callback fired when the max tag count is reached or the `validateTag` function returns `false`
   */
  'valueInvalid': [details: ValidityChangeDetails]

  /**
   * The callback fired when the model value changes.
   */
  'update:modelValue': [value: string[]]

  /**
   * The callback fired when the input value changes.
   */
  'update:inputValue': [value: string]
}

// ── Sub-parts ────────────────────────────────────────────────────────────────
export interface TagsInputClearTriggerProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputControlProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputHiddenInputProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputInputProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputItemProps extends ItemProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputItemDeleteTriggerProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputItemInputProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputItemPreviewProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputItemTextProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface TagsInputLabelProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

// ── Local additions (not part of Ark's surface) ──────────────────────────────
export interface TagsInputProps extends TagsInputRootProps {
  class?: HTMLAttributes['class']
}
