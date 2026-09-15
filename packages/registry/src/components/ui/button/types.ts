import type { HTMLAttributes } from 'vue'

import type { buttonStyles } from './styles'

export type ButtonSize = keyof typeof buttonStyles.size
export type ButtonVariant = keyof typeof buttonStyles.variant

export interface ButtonProps {
  asChild?: boolean
  class?: HTMLAttributes['class']
  disabled?: boolean
  loading?: boolean
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
}
