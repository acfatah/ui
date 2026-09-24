export const tagsInputRootStyles = `
  flex w-full flex-col gap-2
  data-disabled:pointer-events-none data-disabled:opacity-50
`

export const tagsInputControlStyles = `
  flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input
  bg-transparent px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none
  focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50
  data-invalid:border-destructive data-invalid:ring-destructive/20
  data-readonly:bg-muted/50
  dark:bg-input/30
  dark:data-invalid:ring-destructive/40
`

export const tagsInputInputStyles = `
  min-w-16 flex-1 bg-transparent px-1 text-sm outline-none
  placeholder:text-muted-foreground
  disabled:cursor-not-allowed
`

export const tagsInputItemStyles = `
  inline-flex max-w-full items-center
`

export const tagsInputItemPreviewStyles = `
  inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-secondary pr-1 pl-2
  text-xs font-medium text-secondary-foreground ring-offset-background
  data-highlighted:ring-2 data-highlighted:ring-ring data-highlighted:ring-offset-1
  forced-colors:data-highlighted:outline-2 forced-colors:data-highlighted:outline-offset-1
`

export const tagsInputItemTextStyles = 'truncate'

export const tagsInputItemInputStyles = `
  h-6 min-w-16 rounded-md bg-transparent px-2 text-xs outline-none
  ring-1 ring-ring
`

export const tagsInputItemDeleteTriggerStyles = `
  relative inline-flex size-4 shrink-0 items-center justify-center rounded-sm
  text-secondary-foreground/80 transition-colors outline-none
  after:absolute after:-inset-1
  hover:text-secondary-foreground
  disabled:pointer-events-none
  [&_svg]:pointer-events-none [&_svg]:size-3
`

export const tagsInputClearTriggerStyles = `
  relative ml-auto inline-flex size-5 shrink-0 items-center justify-center rounded-sm
  text-muted-foreground transition-colors outline-none
  hover:text-foreground
  focus-visible:ring-[3px] focus-visible:ring-ring/50
  after:absolute after:-inset-0.5
  disabled:pointer-events-none
  [&_svg]:pointer-events-none [&_svg]:size-4
`
