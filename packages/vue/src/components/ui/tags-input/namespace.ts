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
   * adding, editing and deleting tags. Set `placeholder` here, not on
   * `Input`: here it shows only while there are no tags. Passes nothing
   * to its slot; read the tags through `Context`.
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
   * Border, focus ring and invalid styles live here, not on `Root`.
   */
  Control: TagsInputControl,

  /**
   * TagsInputItem component
   *
   * One tag. Requires `index` and `value`. Renders a preview, text, delete
   * trigger and edit input when given no children.
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
   * Where new tags are typed. A `placeholder` set here stays visible
   * after tags are added; set it on `Root` instead.
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
   * Submits the tags with a form as one string joined by ", ", whatever
   * the delimiter is.
   */
  HiddenInput: TagsInputHiddenInput,

  /**
   * TagsInputContext component
   *
   * Exposes the machine's API through its default slot. Render the tags
   * from it: `<TagsInput.Context v-slot="api">`, then `api.value`.
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
