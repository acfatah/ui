import { TagsInput as ArkTagsInput } from '@ark-ui/vue/tags-input'
import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { defineComponent, ref } from 'vue'

import { tagsInputControlStyles } from './styles'
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

const components = {
  TagsInputClearTrigger,
  TagsInputContext: ArkTagsInput.Context,
  TagsInputControl,
  TagsInputHiddenInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDeleteTrigger,
  TagsInputItemInput,
  TagsInputItemPreview,
  TagsInputItemText,
  TagsInputLabel,
  TagsInputRoot,
}

// Keyed by part name, capitalised, so no key reads as a root prop.
interface Parts {
  ClearTrigger?: Record<string, unknown>
  Control?: Record<string, unknown>
  HiddenInput?: Record<string, unknown>
  Input?: Record<string, unknown>
  Item?: Record<string, unknown>
  Label?: Record<string, unknown>
}

/*
  The full composition a consumer writes: items rendered from the
  machine's value through Context, each with its default children, and a
  button outside the field to move focus to.
*/
async function renderTagsInput(root: Record<string, unknown> = {}, parts: Parts = {}) {
  return await render(defineComponent({
    components,
    setup: () => ({ root, parts }),
    template: `
      <div>
        <TagsInputRoot v-bind="root">
          <TagsInputContext v-slot="api">
            <TagsInputLabel v-bind="parts.Label">Tags</TagsInputLabel>
            <TagsInputControl v-bind="parts.Control">
              <TagsInputItem
                v-for="(value, index) in api.value"
                :key="index"
                :index="index"
                :value="value"
                v-bind="parts.Item"
              />
              <TagsInputInput v-bind="parts.Input" />
              <TagsInputClearTrigger v-bind="parts.ClearTrigger" />
            </TagsInputControl>
          </TagsInputContext>
          <TagsInputHiddenInput v-bind="parts.HiddenInput" />
        </TagsInputRoot>
        <button type="button">Elsewhere</button>
      </div>
    `,
  }))
}

type Screen = Awaited<ReturnType<typeof renderTagsInput>>

function inputOf(screen: Screen) {
  return screen.getByRole('textbox', { name: 'Tags' })
}

function part(screen: Screen, name: string) {
  return screen.container.querySelector(`[data-scope="tags-input"][data-part="${name}"]`)!
}

// The tag values as rendered, in order.
function tagsOf(screen: Screen) {
  return [...screen.container.querySelectorAll('[data-part="item-text"]')]
    .map(element => element.textContent?.trim())
}

// The text of the highlighted tag, if any.
function highlightedOf(screen: Screen) {
  return screen.container.querySelector('[data-part="item-preview"][data-highlighted] [data-part="item-text"]')?.textContent
}

async function typeInto(screen: Screen, text: string) {
  await userEvent.click(inputOf(screen))
  await userEvent.keyboard(text)
}

/*
  A browser paste needs clipboard permission, so dispatch what Zag reads
  instead: the input's value and an `insertFromPaste` input event.
*/
async function pasteInto(screen: Screen, text: string) {
  const input = await inputOf(screen).element() as HTMLInputElement
  // Zag handles a paste only once its focus event has been processed.
  await userEvent.click(inputOf(screen))
  await expect.poll(() => input.closest('[data-part="root"]')!.hasAttribute('data-focus')).toBe(true)
  input.value = text
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
}

describe('tags input', () => {
  describe('rendering', () => {
    it('exposes a text input named by its label', async () => {
      const screen = await renderTagsInput()

      await expect.element(inputOf(screen)).toBeInTheDocument()
    })

    it('carries the tags-input scope and part on every part', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })
      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])

      for (const name of ['root', 'label', 'control', 'item', 'item-preview', 'item-text', 'item-delete-trigger', 'item-input', 'input', 'clear-trigger'])
        expect(screen.container.querySelector(`[data-scope="tags-input"][data-part="${name}"]`), name).not.toBeNull()
    })

    it('renders an item as a preview, text, delete trigger and edit input when given no children', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })
      const item = part(screen, 'item')

      await expect.element(screen.getByRole('button', { name: 'Delete tag vue' })).toBeInTheDocument()
      expect(item.querySelector('[data-part="item-preview"] [data-part="item-text"]')!.textContent).toBe('vue')
      expect(item.querySelector('[data-part="item-input"]')!.hasAttribute('hidden')).toBe(true)
      expect(item.querySelector('[data-part="item-delete-trigger"] svg')!.getAttribute('aria-hidden')).toBe('true')
    })

    it('renders the label as a label for the text input, styled by the label component', async () => {
      const screen = await renderTagsInput()
      const label = part(screen, 'label')
      const input = await inputOf(screen).element()

      expect(label.tagName).toBe('LABEL')
      expect(label.getAttribute('for')).toBe(input.id)
      expect(label.classList.contains('font-medium')).toBe(true)
    })

    it('starts empty, shows the placeholder and hides the clear trigger', async () => {
      const screen = await renderTagsInput({ placeholder: 'Add a tag' })

      await expect.element(inputOf(screen)).toHaveAttribute('placeholder', 'Add a tag')
      expect(tagsOf(screen)).toEqual([])
      expect(part(screen, 'root').hasAttribute('data-empty')).toBe(true)
      expect(part(screen, 'clear-trigger').hasAttribute('hidden')).toBe(true)
    })

    it('leaves state attributes off an idle field', async () => {
      const screen = await renderTagsInput()
      const root = part(screen, 'root')

      await expect.element(inputOf(screen)).toBeEnabled()
      for (const attribute of ['data-disabled', 'data-invalid', 'data-readonly'])
        expect(root.hasAttribute(attribute), attribute).toBe(false)
      expect((await inputOf(screen).element()).hasAttribute('aria-invalid')).toBe(false)
    })
  })

  describe('props', () => {
    it('lets a consumer class override a style class on each part', async () => {
      const screen = await renderTagsInput({ class: 'flex-row', defaultValue: ['vue'] }, {
        ClearTrigger: { class: 'size-8' },
        Control: { class: 'rounded-none' },
        Input: { class: 'min-w-0' },
        Item: { class: 'inline-block' },
        Label: { class: 'font-bold' },
      })
      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])

      const has = (name: string, token: string) => part(screen, name).classList.contains(token)
      expect(has('root', 'flex-row')).toBe(true)
      expect(has('root', 'flex-col')).toBe(false)
      expect(has('control', 'rounded-none')).toBe(true)
      expect(has('control', 'rounded-md')).toBe(false)
      expect(has('input', 'min-w-0')).toBe(true)
      expect(has('input', 'min-w-16')).toBe(false)
      expect(has('item', 'inline-block')).toBe(true)
      expect(has('item', 'inline-flex')).toBe(false)
      expect(has('label', 'font-bold')).toBe(true)
      expect(has('label', 'font-medium')).toBe(false)
      expect(has('clear-trigger', 'size-8')).toBe(true)
      expect(has('clear-trigger', 'size-5')).toBe(false)
    })

    it('lets a consumer class override a style class on each item part', async () => {
      const item = { index: 0, value: 'vue' }
      const screen = await render(defineComponent({
        components,
        setup: () => ({ item }),
        template: `
          <TagsInputRoot :default-value="['vue']">
            <TagsInputControl>
              <TagsInputItem v-bind="item">
                <TagsInputItemPreview class="h-8">
                  <TagsInputItemText class="truncate-none">vue</TagsInputItemText>
                  <TagsInputItemDeleteTrigger class="size-6" />
                </TagsInputItemPreview>
                <TagsInputItemInput class="h-8" />
              </TagsInputItem>
              <TagsInputInput />
            </TagsInputControl>
            <TagsInputHiddenInput class="sr-only" />
          </TagsInputRoot>
        `,
      }))
      const has = (name: string, token: string) =>
        screen.container.querySelector(`[data-part="${name}"]`)!.classList.contains(token)

      await expect.element(screen.getByText('vue')).toBeInTheDocument()
      expect(has('item-preview', 'h-8')).toBe(true)
      expect(has('item-preview', 'h-6')).toBe(false)
      expect(has('item-text', 'truncate-none')).toBe(true)
      expect(has('item-delete-trigger', 'size-6')).toBe(true)
      expect(has('item-delete-trigger', 'size-4')).toBe(false)
      expect(has('item-input', 'h-8')).toBe(true)
      expect(has('item-input', 'h-6')).toBe(false)
      expect(screen.container.querySelector('input[hidden][type="text"]')!.classList.contains('sr-only')).toBe(true)
    })

    it('renders the field parts onto their children when asChild is set', async () => {
      const screen = await render(defineComponent({
        components,
        setup: () => ({ asChild: true }),
        template: `
          <TagsInputRoot :as-child="asChild">
            <section data-testid="root">
              <TagsInputLabel :as-child="asChild"><span>Tags</span></TagsInputLabel>
              <TagsInputControl :as-child="asChild">
                <div data-testid="control">
                  <TagsInputInput :as-child="asChild"><input data-testid="input"></TagsInputInput>
                  <TagsInputClearTrigger :as-child="asChild"><a data-testid="clear">Clear</a></TagsInputClearTrigger>
                </div>
              </TagsInputControl>
              <TagsInputHiddenInput :as-child="asChild"><input data-testid="hidden"></TagsInputHiddenInput>
            </section>
          </TagsInputRoot>
        `,
      }))

      await expect.element(screen.getByTestId('root')).toHaveAttribute('data-part', 'root')
      await expect.element(screen.getByTestId('control')).toHaveAttribute('data-part', 'control')
      await expect.element(screen.getByTestId('input')).toHaveAttribute('data-part', 'input')
      await expect.element(screen.getByTestId('clear')).toHaveAttribute('data-part', 'clear-trigger')
      expect((await screen.getByTestId('hidden').element()).hasAttribute('hidden')).toBe(true)
      expect(screen.container.querySelector('[data-part="label"]')!.tagName).toBe('LABEL')
    })

    it('renders the item parts onto their children when asChild is set', async () => {
      const screen = await render(defineComponent({
        components,
        setup: () => ({ asChild: true }),
        template: `
          <TagsInputRoot :default-value="['vue']">
            <TagsInputControl>
              <TagsInputItem :as-child="asChild" :index="0" value="vue">
                <li data-testid="item">
                  <TagsInputItemPreview :as-child="asChild">
                    <span data-testid="preview">
                      <TagsInputItemText :as-child="asChild"><em>vue</em></TagsInputItemText>
                      <TagsInputItemDeleteTrigger :as-child="asChild"><button data-testid="delete">x</button></TagsInputItemDeleteTrigger>
                    </span>
                  </TagsInputItemPreview>
                  <TagsInputItemInput :as-child="asChild"><input data-testid="edit"></TagsInputItemInput>
                </li>
              </TagsInputItem>
              <TagsInputInput />
            </TagsInputControl>
          </TagsInputRoot>
        `,
      }))

      await expect.element(screen.getByTestId('item')).toHaveAttribute('data-part', 'item')
      await expect.element(screen.getByTestId('preview')).toHaveAttribute('data-part', 'item-preview')
      await expect.element(screen.getByTestId('delete')).toHaveAttribute('data-part', 'item-delete-trigger')
      await expect.element(screen.getByTestId('edit')).toHaveAttribute('data-part', 'item-input')
      expect((await screen.getByText('vue').element()).tagName).toBe('EM')
    })

    it('submits its tags with a form under its name', async () => {
      const form = document.createElement('form')
      form.id = 'post'
      document.body.appendChild(form)

      const screen = await renderTagsInput({
        defaultValue: ['vue', 'ark'],
        form: 'post',
        name: 'tags',
      })
      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'ark'])

      expect(new FormData(form).get('tags')).toBe('vue, ark')

      form.remove()
    })

    it('marks the hidden input required', async () => {
      const screen = await renderTagsInput({ required: true })

      await expect.element(inputOf(screen)).toBeInTheDocument()
      expect(screen.container.querySelector('input[hidden]')!.hasAttribute('required')).toBe(true)
      expect(part(screen, 'label').hasAttribute('data-required')).toBe(true)
    })

    it('uses the given id and part ids', async () => {
      const screen = await renderTagsInput({
        id: 'topics',
        ids: { input: 'topics-input', label: 'topics-label' },
      })

      await expect.element(inputOf(screen)).toHaveAttribute('id', 'topics-input')
      expect(part(screen, 'label').id).toBe('topics-label')
      expect(part(screen, 'root').id).toBe('tags-input:topics')
    })

    it('caps the input length at maxLength', async () => {
      const screen = await renderTagsInput({ maxLength: 5 })

      await expect.element(inputOf(screen)).toHaveAttribute('maxlength', '5')
    })

    it('focuses the input on mount when autoFocus is set', async () => {
      const screen = await renderTagsInput({ autoFocus: true })

      await expect.poll(async () => document.activeElement === await inputOf(screen).element()).toBe(true)
    })

    it('starts the input with defaultInputValue', async () => {
      const screen = await renderTagsInput({ defaultInputValue: 'draft' })

      await expect.element(inputOf(screen)).toHaveValue('draft')
    })

    it('labels its triggers from translations', async () => {
      const screen = await renderTagsInput({
        defaultValue: ['vue'],
        translations: {
          clearTriggerLabel: 'Remove all',
          deleteTagTriggerLabel: (value: string) => `Remove ${value}`,
        },
      })

      await expect.element(screen.getByRole('button', { name: 'Remove vue' })).toBeInTheDocument()
      await expect.element(screen.getByRole('button', { name: 'Remove all' })).toBeInTheDocument()
    })
  })

  describe('states', () => {
    it('renders the tags from defaultValue and shows the clear trigger', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark'], placeholder: 'Add a tag' })

      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'ark'])
      expect(part(screen, 'clear-trigger').hasAttribute('hidden')).toBe(false)
      expect(part(screen, 'root').hasAttribute('data-empty')).toBe(false)
      // The placeholder is for an empty field only.
      expect((await inputOf(screen).element()).hasAttribute('placeholder')).toBe(false)
    })

    it('renders the tags from a controlled modelValue', async () => {
      const screen = await renderTagsInput({ modelValue: ['vue'] })

      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
    })

    it('follows a controlled v-model and writes back to it', async () => {
      const tags = ref(['vue'])
      const screen = await render(defineComponent({
        components,
        setup: () => ({ tags }),
        template: `
          <TagsInputRoot v-model="tags">
            <TagsInputLabel>Tags</TagsInputLabel>
            <TagsInputControl>
              <TagsInputItem v-for="(value, index) in tags" :key="index" :index="index" :value="value" />
              <TagsInputInput />
            </TagsInputControl>
          </TagsInputRoot>
        `,
      }))

      tags.value = ['vue', 'ark']
      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'ark'])

      await typeInto(screen, 'zag{Enter}')
      await expect.poll(() => tags.value).toEqual(['vue', 'ark', 'zag'])
    })

    it('follows a controlled v-model:input-value and writes back to it', async () => {
      const text = ref('dra')
      const screen = await render(defineComponent({
        components,
        setup: () => ({ text }),
        template: `
          <TagsInputRoot v-model:input-value="text">
            <TagsInputLabel>Tags</TagsInputLabel>
            <TagsInputControl><TagsInputInput /></TagsInputControl>
          </TagsInputRoot>
        `,
      }))
      const input = inputOf(screen)

      await expect.element(input).toHaveValue('dra')
      await typeInto(screen, 'ft')
      await expect.poll(() => text.value).toBe('draft')
    })

    it('reads a controlled inputValue', async () => {
      const screen = await renderTagsInput({ inputValue: 'draft' })

      await expect.element(inputOf(screen)).toHaveValue('draft')
    })

    it('disables the input and marks every part when disabled', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], disabled: true })

      await expect.element(inputOf(screen)).toBeDisabled()
      for (const name of ['root', 'label', 'control'])
        expect(part(screen, name).hasAttribute('data-disabled'), name).toBe(true)
      await expect.element(screen.getByRole('button', { name: 'Delete tag vue' })).toBeDisabled()
      await expect.element(screen.getByRole('button', { name: 'Clear all tags' })).toBeDisabled()
    })

    it('disables one tag through the item disabled prop', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] }, { Item: { disabled: true } })

      await expect.element(screen.getByRole('button', { name: 'Delete tag vue' })).toBeDisabled()
      await expect.element(inputOf(screen)).toBeEnabled()
    })

    it('marks the input invalid and outlines the control', async () => {
      const screen = await renderTagsInput({ invalid: true })

      await expect.element(inputOf(screen)).toHaveAttribute('aria-invalid', 'true')
      expect(part(screen, 'control').hasAttribute('data-invalid')).toBe(true)
      expect(tagsInputControlStyles).toContain('data-invalid:border-destructive')
    })

    it('marks the field read-only, keeps the control focusable and disables typing', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], readOnly: true })
      const control = part(screen, 'control')

      await expect.element(inputOf(screen)).toBeDisabled()
      expect(part(screen, 'root').hasAttribute('data-readonly')).toBe(true)
      expect(control.hasAttribute('data-readonly')).toBe(true)
      expect(control.getAttribute('tabindex')).toBe('0')
    })
  })

  describe('interaction: add', () => {
    it('adds the typed text as a tag on Enter and clears the input', async () => {
      const onUpdate = vi.fn()
      const onValueChange = vi.fn()
      const screen = await renderTagsInput({
        'onUpdate:modelValue': onUpdate,
        'onValueChange': onValueChange,
      })

      await typeInto(screen, 'vue{Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
      await expect.element(inputOf(screen)).toHaveValue('')
      expect(onUpdate).toHaveBeenLastCalledWith(['vue'])
      expect(onValueChange).toHaveBeenLastCalledWith({ value: ['vue'] })
    })

    it('adds a tag when the delimiter is typed', async () => {
      const screen = await renderTagsInput()

      // One tag at a time: Zag clears the input a frame after the delimiter.
      await typeInto(screen, 'vue,')
      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
      await userEvent.keyboard('ark,')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'ark'])
    })

    it('adds on a custom delimiter', async () => {
      const screen = await renderTagsInput({ delimiter: ';' })

      await typeInto(screen, 'vue,ark')
      await userEvent.keyboard(';')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue,ark'])
    })

    it('trims whitespace and ignores an empty entry', async () => {
      const screen = await renderTagsInput()

      await typeInto(screen, '  vue  {Enter}{Enter}   {Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
    })

    it('emits the input value as it is typed', async () => {
      const onInputValueChange = vi.fn()
      const screen = await renderTagsInput({ onInputValueChange })

      await typeInto(screen, 'vu')

      await expect.poll(() => onInputValueChange.mock.lastCall).toEqual([{ inputValue: 'vu' }])
    })
  })

  describe('interaction: delete', () => {
    it('deletes a tag through its delete trigger', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark'] })

      await userEvent.click(screen.getByRole('button', { name: 'Delete tag vue' }))

      await expect.poll(() => tagsOf(screen)).toEqual(['ark'])
    })

    it('highlights the last tag on Backspace in an empty input and deletes it on the next', async () => {
      const onHighlightChange = vi.fn()
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark'], onHighlightChange })

      await typeInto(screen, '{Backspace}')
      await expect.poll(() => highlightedOf(screen)).toBe('ark')
      expect(onHighlightChange).toHaveBeenCalled()

      await userEvent.keyboard('{Backspace}')
      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
    })

    it('keeps the tags when Backspace deletes typed text', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })

      await typeInto(screen, 'a{Backspace}')

      await expect.element(inputOf(screen)).toHaveValue('')
      expect(tagsOf(screen)).toEqual(['vue'])
    })

    it('moves the highlight with the arrow keys and deletes the highlighted tag with Delete', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark', 'zag'] })

      await typeInto(screen, '{ArrowLeft}{ArrowLeft}')
      await expect.poll(() => highlightedOf(screen)).toBe('ark')

      await userEvent.keyboard('{Delete}')
      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'zag'])
    })
  })

  describe('interaction: edit', () => {
    it('edits a tag on double-click and commits on Enter', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark'] })

      await userEvent.dblClick(screen.getByText('vue'))
      const editor = screen.getByRole('textbox', { name: /Editing tag vue/ })
      await expect.element(editor).toBeVisible()
      await expect.element(editor).toHaveValue('vue')

      await userEvent.fill(editor, 'nuxt')
      await userEvent.keyboard('{Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['nuxt', 'ark'])
      expect(part(screen, 'item-input').hasAttribute('hidden')).toBe(true)
    })

    it('edits the highlighted tag on Enter and cancels on Escape', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })

      await typeInto(screen, '{ArrowLeft}{Enter}')
      const editor = screen.getByRole('textbox', { name: /Editing tag vue/ })
      await expect.element(editor).toBeVisible()

      await userEvent.fill(editor, 'nuxt')
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => part(screen, 'item-input').hasAttribute('hidden')).toBe(true)
      expect(tagsOf(screen)).toEqual(['vue'])
    })

    it('does not edit a tag when editable is false', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], editable: false })

      await userEvent.dblClick(screen.getByText('vue'))

      await expect.element(screen.getByText('vue')).toBeVisible()
      expect(part(screen, 'item-input').hasAttribute('hidden')).toBe(true)
    })
  })

  describe('interaction: paste', () => {
    it('splits pasted text on the delimiter into tags when addOnPaste is set', async () => {
      const screen = await renderTagsInput({ addOnPaste: true, delimiter: /[,;]/ })

      await pasteInto(screen, 'ada@example.com; linus@example.com,grace@example.com')

      await expect.poll(() => tagsOf(screen)).toEqual(['ada@example.com', 'linus@example.com', 'grace@example.com'])
    })

    it('leaves pasted text in the input without addOnPaste', async () => {
      const screen = await renderTagsInput()

      await pasteInto(screen, 'vue, ark')

      await expect.element(inputOf(screen)).toHaveValue('vue, ark')
      expect(tagsOf(screen)).toEqual([])
    })
  })

  describe('interaction: clear', () => {
    it('removes every tag through the clear trigger and returns focus to the input', async () => {
      const onUpdate = vi.fn()
      const screen = await renderTagsInput({ 'defaultValue': ['vue', 'ark'], 'onUpdate:modelValue': onUpdate })

      await userEvent.click(screen.getByRole('button', { name: 'Clear all tags' }))

      await expect.poll(() => tagsOf(screen)).toEqual([])
      expect(onUpdate).toHaveBeenLastCalledWith([])
      expect(document.activeElement).toBe(await inputOf(screen).element())
      expect(part(screen, 'clear-trigger').hasAttribute('hidden')).toBe(true)
    })
  })

  describe('interaction: guarded states', () => {
    it('ignores typing and delete clicks when disabled', async () => {
      const onUpdate = vi.fn()
      const screen = await renderTagsInput({ 'defaultValue': ['vue'], 'disabled': true, 'onUpdate:modelValue': onUpdate })

      await userEvent.click(screen.getByRole('button', { name: 'Delete tag vue' }), { force: true })

      expect(tagsOf(screen)).toEqual(['vue'])
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('ignores delete and clear clicks when readOnly', async () => {
      const onUpdate = vi.fn()
      const screen = await renderTagsInput({ 'defaultValue': ['vue'], 'readOnly': true, 'onUpdate:modelValue': onUpdate })

      await userEvent.click(screen.getByRole('button', { name: 'Delete tag vue' }))
      await userEvent.click(screen.getByRole('button', { name: 'Clear all tags' }))

      expect(tagsOf(screen)).toEqual(['vue'])
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('domain states', () => {
    it('stops adding at max and keeps the typed text', async () => {
      const screen = await renderTagsInput({ defaultValue: ['a', 'b'], max: 2 })

      await typeInto(screen, 'c{Enter}')

      await expect.element(inputOf(screen)).toHaveValue('c')
      expect(tagsOf(screen)).toEqual(['a', 'b'])
    })

    it('adds past max and marks the field invalid when allowOverflow is set', async () => {
      const onValueInvalid = vi.fn()
      const screen = await renderTagsInput({ allowOverflow: true, defaultValue: ['a', 'b'], max: 2, onValueInvalid })

      await typeInto(screen, 'c{Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['a', 'b', 'c'])
      expect(onValueInvalid).toHaveBeenLastCalledWith({ reason: 'rangeOverflow' })
      await expect.element(inputOf(screen)).toHaveAttribute('aria-invalid', 'true')
      expect(part(screen, 'root').hasAttribute('data-invalid')).toBe(true)
    })

    it('drops a duplicate tag by default', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })

      await typeInto(screen, 'vue{Enter}')

      await expect.element(inputOf(screen)).toHaveValue('')
      expect(tagsOf(screen)).toEqual(['vue'])
    })

    it('keeps a duplicate tag when allowDuplicates is set', async () => {
      const screen = await renderTagsInput({ allowDuplicates: true, defaultValue: ['vue'] })

      await typeInto(screen, 'vue{Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'vue'])
    })

    it('rejects a tag validate refuses and reports it', async () => {
      const onValueInvalid = vi.fn()
      const validate = vi.fn(({ inputValue }: { inputValue: string }) => /^[a-z]+$/.test(inputValue))
      const screen = await renderTagsInput({ onValueInvalid, validate })

      await typeInto(screen, 'Vue 3{Enter}')
      await expect.poll(() => onValueInvalid.mock.lastCall).toEqual([{ reason: 'invalidTag' }])
      expect(tagsOf(screen)).toEqual([])

      await userEvent.fill(inputOf(screen), 'vue')
      await userEvent.keyboard('{Enter}')
      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
      expect(validate).toHaveBeenLastCalledWith({ inputValue: 'vue', value: [] })
    })

    it('sanitizes a tag before validating and adding it', async () => {
      const sanitizeValue = (value: string) => value.trim().toLowerCase()
      const screen = await renderTagsInput({ sanitizeValue })

      await typeInto(screen, ' VUE {Enter}')

      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
    })

    it('adds the pending text as a tag on blur when blurBehavior is add', async () => {
      const screen = await renderTagsInput({ blurBehavior: 'add' })

      await typeInto(screen, 'vue')
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

      await expect.poll(() => tagsOf(screen)).toEqual(['vue'])
    })

    it('discards the pending text on blur when blurBehavior is clear', async () => {
      const screen = await renderTagsInput({ blurBehavior: 'clear' })

      await typeInto(screen, 'vue')
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

      await expect.element(inputOf(screen)).toHaveValue('')
      expect(tagsOf(screen)).toEqual([])
    })

    it('keeps the pending text on blur by default', async () => {
      const screen = await renderTagsInput()

      await typeInto(screen, 'vue')
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

      await expect.element(inputOf(screen)).toHaveValue('vue')
      expect(tagsOf(screen)).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('renders many tags, each with its own delete trigger', async () => {
      const many = Array.from({ length: 50 }, (_, index) => `tag-${index}`)
      const screen = await renderTagsInput({ defaultValue: many })

      await expect.poll(() => tagsOf(screen).length).toBe(50)
      expect(screen.container.querySelectorAll('[data-part="item-delete-trigger"]').length).toBe(50)
    })

    it('truncates a tag longer than the field rather than widening it', async () => {
      const long = 'a-very-long-tag-that-does-not-fit-on-one-line-of-the-field'.repeat(3)
      const screen = await renderTagsInput({ class: 'w-40', defaultValue: [long] })

      await expect.poll(() => tagsOf(screen)).toEqual([long])
      const text = part(screen, 'item-text')
      expect(text.classList.contains('truncate')).toBe(true)
      expect(part(screen, 'item-preview').classList.contains('max-w-full')).toBe(true)
    })

    it('empties back to the placeholder after the last tag is deleted', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], placeholder: 'Add a tag' })

      await userEvent.click(screen.getByRole('button', { name: 'Delete tag vue' }))

      await expect.element(inputOf(screen)).toHaveAttribute('placeholder', 'Add a tag')
      expect(part(screen, 'root').hasAttribute('data-empty')).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has no axe violations when empty', async () => {
      const screen = await renderTagsInput({ placeholder: 'Add a tag' })

      await expect.element(inputOf(screen)).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations with tags', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue', 'ark'] })

      await expect.poll(() => tagsOf(screen)).toEqual(['vue', 'ark'])
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations while a tag is edited', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'] })

      await userEvent.dblClick(screen.getByText('vue'))
      await expect.element(screen.getByRole('textbox', { name: /Editing tag vue/ })).toBeVisible()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when disabled', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], disabled: true })

      await expect.element(inputOf(screen)).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when invalid', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], invalid: true })

      await expect.element(inputOf(screen)).toHaveAttribute('aria-invalid', 'true')
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when read-only', async () => {
      const screen = await renderTagsInput({ defaultValue: ['vue'], readOnly: true })

      await expect.element(inputOf(screen)).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })
  })
})
