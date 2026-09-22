export const buttonStyles = {
  base: `
    inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium
    whitespace-nowrap transition-all outline-none
    focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
    disabled:pointer-events-none disabled:opacity-50
    aria-disabled:pointer-events-none aria-disabled:opacity-50
    aria-invalid:border-error aria-invalid:ring-error/20
    dark:aria-invalid:ring-error/40
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,

  variant: {
    default: `
      bg-primary text-primary-foreground shadow-xs
      hover:bg-primary/90
    `,
    secondary: `
      bg-secondary text-secondary-foreground shadow-xs
      hover:bg-secondary/80
    `,
    error: `
      bg-error text-error-foreground shadow-xs
      hover:bg-[color-mix(in_oklch,var(--color-error)_85%,var(--color-foreground))]
      focus-visible:ring-error/20
      dark:focus-visible:ring-error/40
    `,
    success: `
      bg-success text-success-foreground shadow-xs
      hover:bg-[color-mix(in_oklch,var(--color-success)_85%,var(--color-foreground))]
      focus-visible:ring-success/20
      dark:focus-visible:ring-success/40
    `,
    info: `
      bg-info text-info-foreground shadow-xs
      hover:bg-[color-mix(in_oklch,var(--color-info)_85%,var(--color-foreground))]
      focus-visible:ring-info/20
      dark:focus-visible:ring-info/40
    `,
    warning: `
      bg-warning text-warning-foreground shadow-xs
      hover:bg-[color-mix(in_oklch,var(--color-warning)_85%,var(--color-foreground))]
      focus-visible:ring-warning/20
      dark:focus-visible:ring-warning/40
    `,
    outline: `
      border border-border bg-background shadow-xs
      hover:bg-accent hover:text-accent-foreground
      dark:border-input dark:bg-input/30
      dark:hover:bg-input/50
    `,
    ghost: `
      hover:bg-accent hover:text-accent-foreground
      dark:hover:bg-accent/50
    `,
    link: `
      text-primary underline-offset-4
      hover:underline
    `,
  },

  size: {
    'xs': `
      h-6 gap-1 rounded-sm px-2 text-xs
      has-[>svg]:px-1.5
      [&_svg:not([class*='size-'])]:size-3
    `,
    'sm': `
      h-8 gap-1.5 px-3
      has-[>svg]:px-2.5
    `,
    'md': `
      h-9 px-4 py-2
      has-[>svg]:px-3
    `,
    'lg': `
      h-10 px-6
      has-[>svg]:px-4
    `,
    'icon-xs': 'size-6',
    'icon-sm': 'size-8',
    'icon': 'size-9',
    'icon-lg': 'size-10',
  },
}
