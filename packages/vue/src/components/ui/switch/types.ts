// Types extracted from @ark-ui/vue@5.39.2 (re-exports @zag-js/switch@1.x).
// Faithful 1:1 copy — re-sync by hand when upgrading @ark-ui/vue.

import type { HTMLAttributes } from 'vue'

// ── Detail types (inlined from @zag-js/switch) ───────────────────────────────
export interface CheckedChangeDetails {
  checked: boolean
}

// ── Root ─────────────────────────────────────────────────────────────────────
export interface SwitchRootProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean

  /**
   * The controlled checked state of the switch
   */
  checked?: boolean

  /**
   * The initial checked state of the switch when rendered.
   * Use when you don't need to control the checked state of the switch.
   */
  defaultChecked?: boolean

  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean

  /**
   * The id of the form that the switch belongs to
   */
  form?: string

  /**
   * The unique identifier of the machine.
   */
  id?: string

  /**
   * The ids of the elements in the switch. Useful for composition.
   */
  ids?: Partial<{
    root: string
    hiddenInput: string
    control: string
    label: string
    thumb: string
  }>

  /**
   * If `true`, the switch is marked as invalid.
   */
  invalid?: boolean

  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  label?: string

  /**
   * The name of the input field in a switch
   * (Useful for form submission).
   */
  name?: string

  /**
   * Whether the switch is read-only
   */
  readOnly?: boolean

  /**
   * If `true`, the switch input is marked as required,
   */
  required?: boolean

  /**
   * The value of checkbox input. Useful for form submission.
   * @default "on"
   */
  value?: string
}

export interface SwitchRootEmits {
  /**
   * Function to call when the switch is clicked.
   */
  'checkedChange': [details: CheckedChangeDetails]

  /**
   * The callback fired when the model value changes.
   */
  'update:checked': [checked: boolean]
}

// ── Sub-parts (minimal — just asChild) ───────────────────────────────────────
export interface SwitchControlProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface SwitchHiddenInputProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface SwitchLabelProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface SwitchThumbProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

// ── Local additions (not part of Ark's surface) ──────────────────────────────
export interface SwitchProps extends SwitchRootProps {
  class?: HTMLAttributes['class']

  /**
   * Disables the switch and marks it busy while work it started is pending.
   */
  loading?: boolean
}
