import { TagsInput as ArkTagsInput } from '@ark-ui/vue/tags-input'

import TagsInputClearTrigger from './TagsInputClearTrigger.vue'
import TagsInputControl from './TagsInputControl.vue'
import TagsInputHiddenInput from './TagsInputHiddenInput.vue'
import TagsInputInput from './TagsInputInput.vue'
import TagsInputItem from './TagsInputItem.vue'
import TagsInputItemDeleteTrigger from './TagsInputItemDeleteTrigger.vue'
import TagsInputItemInput from './TagsInputItemInput.vue'
import TagsInputItemPreview from './TagsInputItemPreview.vue'
import TagsInputItemText from './TagsInputItemText.vue'
import TagsInputLabel from './TagsInputLabel.vue'
import TagsInputRoot from './TagsInputRoot.vue'

export const TagsInput = {
  /**
   * TagsInputRoot component
   *
   * Owns the tag values, the text being typed, and every flag that governs
   * adding, editing and deleting tags.
   */
  Root: TagsInputRoot,

  /**
   * TagsInputLabel component
   *
   * Labels the text input, styled by the `label` component.
   */
  Label: TagsInputLabel,

  /**
   * TagsInputControl component
   *
   * The bordered field holding the tags, the input and the clear trigger.
   */
  Control: TagsInputControl,

  /**
   * TagsInputItem component
   *
   * One tag. Renders a preview, text, delete trigger and edit input when
   * given no children.
   */
  Item: TagsInputItem,

  /**
   * TagsInputItemPreview component
   *
   * The visible tag. Hidden while the tag is being edited.
   */
  ItemPreview: TagsInputItemPreview,

  /**
   * TagsInputItemText component
   */
  ItemText: TagsInputItemText,

  /**
   * TagsInputItemDeleteTrigger component
   *
   * Renders an X icon when given no children.
   */
  ItemDeleteTrigger: TagsInputItemDeleteTrigger,

  /**
   * TagsInputItemInput component
   *
   * The input shown in place of the preview while a tag is edited.
   */
  ItemInput: TagsInputItemInput,

  /**
   * TagsInputInput component
   *
   * Where new tags are typed.
   */
  Input: TagsInputInput,

  /**
   * TagsInputClearTrigger component
   *
   * Removes every tag. Hidden while there are none. Renders an X icon when
   * given no children.
   */
  ClearTrigger: TagsInputClearTrigger,

  /**
   * TagsInputHiddenInput component
   *
   * Submits the tags with a form, joined by ", ".
   */
  HiddenInput: TagsInputHiddenInput,

  /**
   * TagsInputContext component
   *
   * Exposes the machine's API through its default slot.
   *
   * See: https://ark-ui.com/docs/components/tags-input#context
   */
  Context: ArkTagsInput.Context,

  /**
   * TagsInputRootProvider component
   *
   * See: https://ark-ui.com/docs/components/tags-input#root-provider
   */
  RootProvider: ArkTagsInput.RootProvider,
}
