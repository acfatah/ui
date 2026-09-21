import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import type { ButtonSize, ButtonVariant } from './types'

import Button from './Button.vue'
import { buttonStyles } from './styles'

async function renderButton(props: Record<string, unknown> = {}, slot = 'Press me') {
  return await render(Button, {
    props,
    slots: { default: slot },
  })
}

function classesOf(styles: string) {
  return styles.split(/\s+/).filter(Boolean)
}

const variants = (Object.keys(buttonStyles.variant) as ButtonVariant[])
  .filter(variant => variant !== 'default')
const sizes = (Object.keys(buttonStyles.size) as ButtonSize[])
  .filter(size => size !== 'md')

describe('button', () => {
  describe('rendering', () => {
    it('renders a native button typed "button" by default', async () => {
      const screen = await renderButton()
      const button = screen.getByRole('button')

      await expect.element(button).toBeInTheDocument()
      expect((await button.element()).tagName).toBe('BUTTON')

      /*
        The native default is "submit". A button that silently submits the
        form it happens to sit in is the reason this default is explicit.
      */
      await expect.element(button).toHaveAttribute('type', 'button')
    })

    it('renders its slot as the accessible name', async () => {
      const screen = await renderButton({}, 'Save changes')

      await expect.element(screen.getByRole('button', { name: 'Save changes' }))
        .toBeInTheDocument()
    })

    it('carries the scope and part data attributes', async () => {
      const button = (await renderButton()).getByRole('button')

      await expect.element(button).toHaveAttribute('data-scope', 'button')
      await expect.element(button).toHaveAttribute('data-part', 'root')
    })

    it('applies the default variant and size', async () => {
      const button = await (await renderButton()).getByRole('button').element()

      expect(button.classList.contains('bg-primary')).toBe(true)
      expect(button.classList.contains('h-9')).toBe(true)
    })

    it('leaves state attributes off an idle button', async () => {
      const button = await (await renderButton()).getByRole('button').element()

      expect(button.hasAttribute('disabled')).toBe(false)
      expect(button.hasAttribute('aria-disabled')).toBe(false)
      expect(button.hasAttribute('aria-busy')).toBe(false)
      expect(button.hasAttribute('data-loading')).toBe(false)
      expect(button.hasAttribute('tabindex')).toBe(false)
    })
  })

  describe('props', () => {
    it.each(variants)('applies the %s variant and drops the default variant', async (variant) => {
      const button = await (await renderButton({ variant })).getByRole('button').element()
      const requested = classesOf(buttonStyles.variant[variant])

      for (const name of requested)
        expect(button.classList.contains(name), name).toBe(true)

      for (const name of classesOf(buttonStyles.variant.default).filter(c => !requested.includes(c)))
        expect(button.classList.contains(name), name).toBe(false)
    })

    it.each(sizes)('applies the %s size and drops the default size', async (size) => {
      const button = await (await renderButton({ size })).getByRole('button').element()
      const requested = classesOf(buttonStyles.size[size])

      for (const name of requested)
        expect(button.classList.contains(name), name).toBe(true)

      for (const name of classesOf(buttonStyles.size.md).filter(c => !requested.includes(c)))
        expect(button.classList.contains(name), name).toBe(false)
    })

    it('applies a requested variant and size together', async () => {
      const button = await (await renderButton({ size: 'icon-lg', variant: 'ghost' }))
        .getByRole('button')
        .element()

      expect(button.classList.contains('size-10')).toBe(true)
      expect(button.classList.contains('bg-primary')).toBe(false)
    })

    it('gives the xs size a fixed height', async () => {
      const button = await (await renderButton({ size: 'xs' })).getByRole('button').element()

      expect(button.classList.contains('h-6')).toBe(true)
    })

    it('lets a consumer class override the variant class', async () => {
      const button = await (await renderButton({ class: 'bg-red-500' }))
        .getByRole('button')
        .element()

      /*
        This is cn doing tailwind-merge's job. Without it both classes
        would land and the winner would depend on stylesheet order.

        Assert against classList, not the className string: `bg-primary`
        is a substring of the `hover:bg-primary/90` that legitimately
        survives, so a substring check reads as a failure when the merge
        worked correctly.
      */
      expect(button.classList.contains('bg-red-500')).toBe(true)
      expect(button.classList.contains('bg-primary')).toBe(false)
    })

    it('applies a requested type', async () => {
      const button = (await renderButton({ type: 'submit' })).getByRole('button')

      await expect.element(button).toHaveAttribute('type', 'submit')
    })

    it('renders the child element instead of a button when asChild is set', async () => {
      const screen = await render(Button, {
        props: { asChild: true },
        slots: { default: '<a href="#target">Go</a>' },
      })

      const link = await screen.getByRole('link').element()

      expect(link.tagName).toBe('A')
      expect(link.classList.contains('bg-primary')).toBe(true)
      expect(screen.container.querySelector('button')).toBeNull()
    })

    it('does not put a type attribute on an asChild element', async () => {
      const screen = await render(Button, {
        props: { asChild: true },
        slots: { default: '<a href="#target">Go</a>' },
      })

      expect((await screen.getByRole('link').element()).hasAttribute('type')).toBe(false)
    })
  })

  describe('states', () => {
    it('disables and marks aria-disabled', async () => {
      const button = (await renderButton({ disabled: true })).getByRole('button')

      await expect.element(button).toBeDisabled()
      await expect.element(button).toHaveAttribute('aria-disabled', 'true')
      expect((await button.element()).hasAttribute('data-loading')).toBe(false)
    })

    it('marks a loading button busy without natively disabling it', async () => {
      const button = (await renderButton({ loading: true })).getByRole('button')

      /*
        Native `disabled` would drop focus to <body> the moment loading
        starts. aria-disabled keeps the button focusable and announced as
        unavailable.
      */
      expect((await button.element()).hasAttribute('disabled')).toBe(false)
      await expect.element(button).toHaveAttribute('aria-disabled', 'true')
      await expect.element(button).toHaveAttribute('aria-busy', 'true')
      await expect.element(button).toHaveAttribute('data-loading', 'true')
    })

    it('takes a disabled asChild link out of the tab order', async () => {
      const screen = await render(Button, {
        props: { asChild: true, disabled: true },
        slots: { default: '<a href="#disabled-target">Go</a>' },
      })
      const link = screen.getByRole('link')

      /*
        An <a> has no native `disabled`, so aria-disabled plus tabindex -1
        stands in for it.
      */
      await expect.element(link).toHaveAttribute('aria-disabled', 'true')
      await expect.element(link).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('interaction', () => {
    it('is reachable by keyboard and activates on Enter', async () => {
      const onClick = vi.fn()
      const screen = await render(Button, {
        attrs: { onClick },
        slots: { default: 'Press me' },
      })
      const button = await screen.getByRole('button').element()

      await userEvent.tab()
      expect(document.activeElement).toBe(button)

      await userEvent.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not activate a disabled button', async () => {
      const onClick = vi.fn()
      const screen = await render(Button, {
        props: { disabled: true },
        attrs: { onClick },
        slots: { default: 'Press me' },
      })
      const button = await screen.getByRole('button').element()

      await userEvent.tab()
      expect(document.activeElement).not.toBe(button)

      await userEvent.click(button, { force: true })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('keeps focus on a loading button and blocks its activation', async () => {
      const onClick = vi.fn()
      const screen = await render(Button, {
        props: { loading: true },
        attrs: { onClick },
        slots: { default: 'Saving' },
      })
      const button = await screen.getByRole('button').element()

      await userEvent.tab()
      expect(document.activeElement).toBe(button)

      await userEvent.keyboard('{Enter}')
      await userEvent.click(button, { force: true })
      expect(onClick).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(button)
    })

    it('submits its form when typed "submit" and idle', async () => {
      const onSubmit = vi.fn((event: Event) => event.preventDefault())
      const form = document.createElement('form')
      form.addEventListener('submit', onSubmit)
      document.body.appendChild(form)

      const screen = await render(Button, {
        props: { type: 'submit' },
        slots: { default: 'Save' },
        container: form,
      })

      await userEvent.click(screen.getByRole('button'))
      expect(onSubmit).toHaveBeenCalledTimes(1)

      form.remove()
    })

    it('does not submit its form while loading', async () => {
      const onSubmit = vi.fn((event: Event) => event.preventDefault())
      const form = document.createElement('form')
      form.addEventListener('submit', onSubmit)
      document.body.appendChild(form)

      const screen = await render(Button, {
        props: { loading: true, type: 'submit' },
        slots: { default: 'Save' },
        container: form,
      })

      await userEvent.click(screen.getByRole('button'), { force: true })
      expect(onSubmit).not.toHaveBeenCalled()

      form.remove()
    })

    it('makes a disabled asChild link inert', async () => {
      const onClick = vi.fn()
      const screen = await render(Button, {
        props: { asChild: true, disabled: true },
        attrs: { onClick },
        slots: { default: '<a href="#disabled-target">Go</a>' },
      })
      const link = await screen.getByRole('link').element()

      expect(link.getAttribute('aria-disabled')).toBe('true')
      expect(link.getAttribute('tabindex')).toBe('-1')

      await userEvent.click(link, { force: true })
      expect(onClick).not.toHaveBeenCalled()
      expect(window.location.hash).not.toBe('#disabled-target')
    })

    it('keeps a loading asChild link focusable but blocks its activation', async () => {
      const onClick = vi.fn()
      const screen = await render(Button, {
        props: { asChild: true, loading: true },
        attrs: { onClick },
        slots: { default: '<a href="#loading-target">Go</a>' },
      })
      const link = await screen.getByRole('link').element()

      await userEvent.tab()
      expect(document.activeElement).toBe(link)

      await userEvent.click(link, { force: true })
      expect(onClick).not.toHaveBeenCalled()
      expect(window.location.hash).not.toBe('#loading-target')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations by default', async () => {
      const screen = await renderButton()

      await expect.element(screen.getByRole('button')).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when disabled', async () => {
      const screen = await renderButton({ disabled: true })

      await expect.element(screen.getByRole('button')).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when loading', async () => {
      const screen = await renderButton({ loading: true })

      await expect.element(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations as an asChild link', async () => {
      const screen = await render(Button, {
        props: { asChild: true },
        slots: { default: '<a href="#target">Go</a>' },
      })

      await expect.element(screen.getByRole('link', { name: 'Go' })).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations as a disabled asChild link', async () => {
      const screen = await render(Button, {
        props: { asChild: true, disabled: true },
        slots: { default: '<a href="#disabled-target">Go</a>' },
      })

      await expect.element(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true')
      await expectNoAxeViolations(screen.container)
    })
  })
})
