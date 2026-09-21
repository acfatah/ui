import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { defineComponent } from 'vue'

import Label from './Label.vue'

async function renderLabel(props: Record<string, unknown> = {}, slot = 'Email') {
  return await render(Label, {
    props,
    slots: { default: slot },
  })
}

/*
  A label beside a native checkbox, the pairing its `peer-*` and `for`
  behaviour exists for.
*/
function withCheckbox(disabled = false) {
  return defineComponent({
    components: { Label },
    setup: () => ({ disabled }),
    template: `
      <div>
        <input id="terms" type="checkbox" class="peer" :disabled="disabled">
        <Label for="terms">Accept terms</Label>
      </div>
    `,
  })
}

describe('label', () => {
  describe('rendering', () => {
    it('renders a native label with its slot', async () => {
      const screen = await renderLabel()
      const label = await screen.getByText('Email').element()

      expect(label.tagName).toBe('LABEL')
    })

    it('carries the scope and part data attributes', async () => {
      const label = (await renderLabel()).getByText('Email')

      await expect.element(label).toHaveAttribute('data-scope', 'label')
      await expect.element(label).toHaveAttribute('data-part', 'root')
    })

    it('applies the label styles', async () => {
      const label = await (await renderLabel()).getByText('Email').element()

      expect(label.classList.contains('font-medium')).toBe(true)
      expect(label.classList.contains('select-none')).toBe(true)
    })
  })

  describe('props', () => {
    it('lets a consumer class override a style class', async () => {
      const label = await (await renderLabel({ class: 'font-bold' })).getByText('Email').element()

      expect(label.classList.contains('font-bold')).toBe(true)
      expect(label.classList.contains('font-medium')).toBe(false)
    })

    it('renders the child element instead of a label when asChild is set', async () => {
      const screen = await renderLabel({ asChild: true }, '<span>Caption</span>')
      const caption = await screen.getByText('Caption').element()

      expect(caption.tagName).toBe('SPAN')
      expect(caption.getAttribute('data-scope')).toBe('label')
      expect(caption.classList.contains('font-medium')).toBe(true)
      expect(screen.container.querySelector('label')).toBeNull()
    })
  })

  describe('interaction', () => {
    it('names and toggles the control it is for', async () => {
      const screen = await render(withCheckbox())
      const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' })

      await userEvent.click(screen.getByText('Accept terms'))

      await expect.element(checkbox).toBeChecked()
    })
  })

  describe('accessibility', () => {
    it('has no axe violations beside its control', async () => {
      const screen = await render(withCheckbox())

      await expect.element(screen.getByRole('checkbox')).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations beside a disabled control', async () => {
      const screen = await render(withCheckbox(true))

      await expect.element(screen.getByRole('checkbox')).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })
  })
})
