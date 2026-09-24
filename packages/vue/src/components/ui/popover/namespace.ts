import { Popover as ArkPopover } from '@ark-ui/vue/popover'

import PopoverAnchor from './PopoverAnchor.vue'
import PopoverArrow from './PopoverArrow.vue'
import PopoverCloseTrigger from './PopoverCloseTrigger.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverDescription from './PopoverDescription.vue'
import PopoverRoot from './PopoverRoot.vue'
import PopoverTitle from './PopoverTitle.vue'
import PopoverTrigger from './PopoverTrigger.vue'

export const Popover = {
  /**
   * PopoverRoot component
   *
   * Renders no element. Owns the open state and positioning options.
   */
  Root: PopoverRoot,

  /**
   * PopoverTrigger component
   *
   * Toggles the popover. Unstyled: pair it with `Button` through `as-child`.
   */
  Trigger: PopoverTrigger,

  /**
   * PopoverAnchor component
   *
   * Positions the content against this element instead of the trigger.
   */
  Anchor: PopoverAnchor,

  /**
   * PopoverContent component
   *
   * Teleported to `body` inside Ark's positioner. Holds the popover body.
   */
  Content: PopoverContent,

  /**
   * PopoverArrow component
   *
   * Points the content at its anchor. Renders its own tip.
   */
  Arrow: PopoverArrow,

  /**
   * PopoverTitle component
   *
   * Labels the content through `aria-labelledby`.
   */
  Title: PopoverTitle,

  /**
   * PopoverDescription component
   *
   * Describes the content through `aria-describedby`, styled by the
   * `description` component.
   */
  Description: PopoverDescription,

  /**
   * PopoverCloseTrigger component
   *
   * Closes the popover. Unstyled: pair it with `Button` through `as-child`.
   */
  CloseTrigger: PopoverCloseTrigger,

  /**
   * PopoverRootProvider component
   *
   * See: https://ark-ui.com/docs/components/popover#root-provider
   */
  RootProvider: ArkPopover.RootProvider,
}
