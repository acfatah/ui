export const switchRootStyles = `
  inline-flex space-x-2 bg-transparent outline-none
  data-disabled:pointer-events-none data-disabled:opacity-50
  [&:focus-within_[data-part=control]]:border-ring
  [&:focus-within_[data-part=control]]:ring-[3px]
  [&:focus-within_[data-part=control]]:ring-ring/50
`

export const switchControlStyles = `
  inline-flex h-4.5 w-8 shrink-0 items-center rounded-full border border-transparent
  shadow-xs transition-all outline-none
  data-[state=checked]:bg-primary
  data-[state=unchecked]:bg-input
  data-invalid:border-destructive
  dark:data-[state=unchecked]:bg-input/80
`

export const switchThumbStyles = `
  pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform
  data-[state=checked]:translate-x-[calc(100%-2px)]
  data-[state=unchecked]:translate-x-0
  dark:data-[state=checked]:bg-primary-foreground
  dark:data-[state=unchecked]:bg-foreground
`

export const switchHiddenInputStyles = 'peer sr-only'
