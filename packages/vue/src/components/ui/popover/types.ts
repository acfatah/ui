// Types extracted from @ark-ui/vue@5.39.2 (re-exports @zag-js/popover@1.x).
// Faithful 1:1 copy — re-sync by hand when upgrading @ark-ui/vue.

// ── Positioning primitives (inlined from @zag-js/popper → @floating-ui/dom) ──
export type PlacementSide = 'top' | 'right' | 'bottom' | 'left'

export type PlacementAlign = 'start' | 'end'

export type Placement = PlacementSide | `${PlacementSide}-${PlacementAlign}`

export interface Rect { x: number, y: number, width: number, height: number }

export interface SideObject { top: number, right: number, bottom: number, left: number }

export type ClientRectObject = Rect & SideObject

export interface VirtualElement {
  getBoundingClientRect: () => ClientRectObject
  getClientRects?: () => Array<ClientRectObject> | DOMRectList
  contextElement?: Element
}

export type Boundary = 'clippingAncestors' | Element | Element[] | Rect

export interface AutoUpdateOptions {
  ancestorScroll?: boolean
  ancestorResize?: boolean
  elementResize?: boolean
  layoutShift?: boolean
  animationFrame?: boolean
}

export interface ComputePositionReturn {
  x: number
  y: number
  placement: Placement
  strategy: 'absolute' | 'fixed'
  middlewareData: Record<string, any>
}

export interface AnchorRect {
  x?: number | undefined
  y?: number | undefined
  width?: number | undefined
  height?: number | undefined
}

export interface PositioningOptions {
  /**
   * Whether styles applied by the positioning utility should be restored on cleanup.
   */
  restoreStyles?: boolean | undefined

  /**
   * Whether to apply computed position styles (`--x`, `--y`, `--z-index`) to the floating element.
   * Set to `false` when the consumer applies these from context (e.g. for exit animations).
   * @default true
   */
  applyStyles?: boolean | undefined

  /**
   * Whether the popover should be hidden when the reference element is detached
   */
  hideWhenDetached?: boolean | undefined

  /**
   * The strategy to use for positioning
   */
  strategy?: 'absolute' | 'fixed' | undefined

  /**
   * The initial placement of the floating element
   */
  placement?: Placement | undefined

  /**
   * The offset of the floating element
   */
  offset?: {
    mainAxis?: number | undefined
    crossAxis?: number | undefined
  } | undefined

  /**
   * The main axis offset or gap between the reference and floating elements
   */
  gutter?: number | undefined

  /**
   * The secondary axis offset or gap between the reference and floating elements
   */
  shift?: number | undefined

  /**
   * The virtual padding around the viewport edges to check for overflow
   */
  overflowPadding?: number | undefined

  /**
   * The minimum padding between the arrow and the floating element's corner.
   * @default 4
   */
  arrowPadding?: number | undefined

  /**
   * Whether to flip the placement
   */
  flip?: boolean | Placement[] | undefined

  /**
   * Whether the popover should slide when it overflows.
   */
  slide?: boolean | undefined

  /**
   * Whether the floating element can overlap the reference element
   * @default false
   */
  overlap?: boolean | undefined

  /**
   * Whether to make the floating element same width as the reference element
   */
  sameWidth?: boolean | undefined

  /**
   * Whether the popover should fit the viewport.
   */
  fitViewport?: boolean | undefined

  /**
   * Whether to use the size middleware from Floating UI.
   * It computes and sets CSS variables (`--reference-width`, `--reference-height`, `--available-width`, `--available-height`) used by `sameWidth` and `fitViewport`.
   *
   * Disabling it improves scroll performance with heavy content by avoiding layout thrashing on each update.
   * Only applies when both `sameWidth` and `fitViewport` are false — the middleware is always used when either is enabled.
   * @default true
   */
  sizeMiddleware?: boolean | undefined

  /**
   * The overflow boundary of the reference element
   * Accepts a function returning a Boundary, a Boundary directly,
   * or the shorthand string 'clipping-ancestors' which maps to Floating UI's 'clippingAncestors'.
   */
  boundary?: (() => Boundary) | Boundary | 'clipping-ancestors' | undefined

  /**
   * Options to activate auto-update listeners
   */
  listeners?: boolean | AutoUpdateOptions | undefined

  /**
   * Function called when the placement is computed
   */
  onComplete?: ((data: ComputePositionReturn) => void) | undefined

  /**
   * Function called when the floating element is positioned or not
   */
  onPositioned?: ((data: {
    placed: boolean
  }) => void) | undefined

  /**
   * Function that returns the anchor element.
   * Useful when you want to use a different element as the anchor.
   */
  getAnchorElement?: (() => HTMLElement | VirtualElement | null) | undefined

  /**
   *  Function that returns the anchor rect
   * @deprecated Use `getAnchorElement` instead
   */
  getAnchorRect?: ((element: HTMLElement | VirtualElement | null) => AnchorRect | null) | undefined

  /**
   * A callback that will be called when the popover needs to calculate its
   * position.
   */
  updatePosition?: ((data: {
    updatePosition: () => Promise<void>
    floatingElement: HTMLElement | null
  }) => void | Promise<void>) | undefined
}

// ── Outside-event details (inlined from @zag-js/dismissable → @zag-js/interact-outside) ──
export interface EventDetails<T> {
  originalEvent: T
  contextmenu: boolean
  focusable: boolean
  target: EventTarget
}

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>

export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>

export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent

// ── Detail types (inlined from @zag-js/popover) ──────────────────────────────
export interface OpenChangeDetails {
  open: boolean
}

export interface TriggerValueChangeDetails {
  /**
   * The value of the trigger
   */
  value: string | null

  /**
   * The trigger element
   */
  triggerElement: HTMLElement | null
}

export interface IntlTranslations {
  closeTriggerLabel?: string | undefined
}

// ── Root ─────────────────────────────────────────────────────────────────────
export interface PopoverRootProps {
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   *
   * @default true
   */
  autoFocus?: boolean

  /**
   * Whether to close the popover when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean

  /**
   * Whether to close the popover when the user clicks outside of the popover.
   * @default true
   */
  closeOnInteractOutside?: boolean

  /**
   * The initial open state of the popover when rendered.
   * Use when you don't need to control the open state of the popover.
   */
  defaultOpen?: boolean

  /**
   * The initial trigger value when rendered.
   * Use when you don't need to control the trigger value.
   */
  defaultTriggerValue?: string | null

  /**
   * Element to receive focus when the popover is closed
   */
  finalFocusEl?: () => HTMLElement | null

  /**
   * The unique identifier of the machine.
   */
  id?: string

  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: Partial<{
    anchor: string
    trigger: string
    content: string
    title: string
    description: string
    closeTrigger: string
    positioner: string
    arrow: string
  }>

  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: () => HTMLElement | null

  /**
   * Whether to enable lazy mounting
   * @default false
   */
  lazyMount?: boolean

  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - scrolling is blocked
   * - focus is trapped within the popover
   *
   * @default false
   */
  modal?: boolean

  /**
   * The controlled open state of the popover
   */
  open?: boolean

  /**
   * Returns the persistent elements that:
   * - should not have pointer-events disabled
   * - should not trigger the dismiss event
   */
  persistentElements?: (() => Element | null)[]

  /**
   * Whether the popover is portalled. This will proxy the tabbing behavior regardless of the DOM position
   * of the popover content.
   *
   * @default true
   */
  portalled?: boolean

  /**
   * The user provided options used to position the popover content
   */
  positioning?: PositioningOptions

  /**
   * Whether to restore focus to the element that had focus before the popover was opened
   *
   * @default true
   */
  restoreFocus?: boolean

  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations

  /**
   * The value of the trigger that currently open the popover
   */
  triggerValue?: string | null

  /**
   * Whether to unmount on exit.
   * @default false
   */
  unmountOnExit?: boolean
}

export interface PopoverRootEmits {
  /**
   * Function called when the escape key is pressed
   */
  'escapeKeyDown': [event: KeyboardEvent]

  /**
   * Function called when the animation ends in the closed state
   */
  'exitComplete': []

  /**
   * Function called when the focus is moved outside the component
   */
  'focusOutside': [event: FocusOutsideEvent]

  /**
   * Function called when an interaction happens outside the component
   */
  'interactOutside': [event: InteractOutsideEvent]

  /**
   * Function invoked when the popover opens or closes
   */
  'openChange': [details: OpenChangeDetails]

  /**
   * Function called when the pointer is pressed down outside the component
   */
  'pointerDownOutside': [event: PointerDownOutsideEvent]

  /**
   * Function called when this layer is closed due to a parent layer being closed
   */
  'requestDismiss': [
    event: CustomEvent<{
      originalLayer: HTMLElement
      targetLayer: HTMLElement | undefined
      originalIndex: number
      targetIndex: number
    }>,
  ]

  /**
   * Function called when the trigger value changes
   */
  'triggerValueChange': [details: TriggerValueChangeDetails]

  /**
   * The callback fired when the open state changes.
   */
  'update:open': [open: boolean]

  /**
   * The callback fired when the trigger value changes.
   */
  'update:triggerValue': [triggerValue: string | null]
}

// ── Sub-parts ────────────────────────────────────────────────────────────────
export interface PopoverTriggerProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean

  /**
   * The value that identifies this specific trigger
   */
  value?: string
}

export interface PopoverAnchorProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface PopoverContentProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface PopoverArrowProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface PopoverTitleProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface PopoverDescriptionProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}

export interface PopoverCloseTriggerProps {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean
}
