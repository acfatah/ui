import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import Description from './Description.vue'

async function renderDescription(props: Record<string, unknown> = {}, slot = 'Help text') {
  return await render(Description, {
    props,
    slots: { default: slot },
  })
}

describe('description', () => {
  describe('rendering', () => {
    it('renders a paragraph with its slot', async () => {
      const description = await (await renderDescription()).getByText('Help text').element()

      expect(description.tagName).toBe('P')
    })

    it('carries the scope and part data attributes', async () => {
      const description = (await renderDescription()).getByText('Help text')

      await expect.element(description).toHaveAttribute('data-scope', 'description')
      await expect.element(description).toHaveAttribute('data-part', 'root')
    })

    it('applies the muted description styles', async () => {
      const description = await (await renderDescription()).getByText('Help text').element()

      expect(description.classList.contains('text-muted-foreground')).toBe(true)
      expect(description.classList.contains('text-sm/normal')).toBe(true)
    })
  })

  describe('props', () => {
    it('lets a consumer class override a style class', async () => {
      const description = await (await renderDescription({ class: 'text-destructive' }))
        .getByText('Help text')
        .element()

      expect(description.classList.contains('text-destructive')).toBe(true)
      expect(description.classList.contains('text-muted-foreground')).toBe(false)
    })

    it('renders the child element instead of a paragraph when asChild is set', async () => {
      const screen = await renderDescription({ asChild: true }, '<div>Block help</div>')
      const description = await screen.getByText('Block help').element()

      expect(description.tagName).toBe('DIV')
      expect(description.getAttribute('data-scope')).toBe('description')
      expect(screen.container.querySelector('p')).toBeNull()
    })

    it('passes an id through, so a control can reference it', async () => {
      const description = (await render(Description, {
        attrs: { id: 'hint' },
        slots: { default: 'Help text' },
      })).getByText('Help text')

      await expect.element(description).toHaveAttribute('id', 'hint')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations by default', async () => {
      const screen = await renderDescription()

      await expect.element(screen.getByText('Help text')).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })
  })
})
