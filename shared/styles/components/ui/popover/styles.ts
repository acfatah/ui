export const popoverContentStyles = `
  z-50 flex w-72 origin-(--transform-origin) flex-col gap-4 rounded-md border bg-popover p-4
  text-sm text-popover-foreground shadow-md outline-hidden
  data-[state=closed]:animate-out data-[state=closed]:fade-out-0
  data-[state=closed]:zoom-out-95
  data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
  data-[side=bottom]:slide-in-from-top-2
  data-[side=left]:slide-in-from-right-2
  data-[side=right]:slide-in-from-left-2
  data-[side=top]:slide-in-from-bottom-2
  motion-reduce:animate-none
`

export const popoverArrowStyles = `
  [--arrow-background:var(--color-popover)]
  [--arrow-size:--spacing(2.5)]
`

export const popoverArrowTipStyles = 'border-t border-l'

export const popoverTitleStyles = 'leading-none font-medium'
