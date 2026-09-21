import { Switch as ArkSwitch } from '@ark-ui/vue/switch'

import SwitchControl from './SwitchControl.vue'
import SwitchDescription from './SwitchDescription.vue'
import SwitchHiddenInput from './SwitchHiddenInput.vue'
import SwitchLabel from './SwitchLabel.vue'
import SwitchRoot from './SwitchRoot.vue'
import SwitchThumb from './SwitchThumb.vue'

export const Switch = {
  /**
   * SwitchRoot component
   *
   * Renders a <label> holding the whole switch, so a click anywhere on it
   * toggles. Owns the checked state.
   */
  Root: SwitchRoot,

  /**
   * SwitchControl component
   *
   * The track. Renders a `Thumb` when given no children.
   */
  Control: SwitchControl,

  /**
   * SwitchThumb component
   */
  Thumb: SwitchThumb,

  /**
   * SwitchLabel component
   */
  Label: SwitchLabel,

  /**
   * SwitchDescription component
   *
   * Supporting text, styled by the `description` component.
   */
  Description: SwitchDescription,

  /**
   * SwitchHiddenInput component
   *
   * The native checkbox that takes focus and submits with a form. Required.
   */
  HiddenInput: SwitchHiddenInput,

  /**
   * SwitchRootProvider component
   *
   * See: https://ark-ui.com/docs/components/switch#root-provider
   */
  RootProvider: ArkSwitch.RootProvider,
}
