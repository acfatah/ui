import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import Button from './Button.vue'

async function renderButton(props: Record<string, unknown> = {}, slot = 'Press me') {
  return await render(Button, {
    props,
    slots: { default: slot },
  })
}

describe('button', () => {
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

  it('applies a requested variant and size', async () => {
    const button = await (await renderButton({ size: 'icon-lg', variant: 'ghost' }))
      .getByRole('button')
      .element()

    expect(button.classList.contains('size-10')).toBe(true)
    expect(button.classList.contains('bg-primary')).toBe(false)
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

  it('leaves state attributes off an idle button', async () => {
    const button = await (await renderButton()).getByRole('button').element()

    expect(button.hasAttribute('disabled')).toBe(false)
    expect(button.hasAttribute('aria-disabled')).toBe(false)
    expect(button.hasAttribute('aria-busy')).toBe(false)
    expect(button.hasAttribute('data-loading')).toBe(false)
  })

  it('disables and marks aria-disabled', async () => {
    const button = (await renderButton({ disabled: true })).getByRole('button')

    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('aria-disabled', 'true')
    expect((await button.element()).hasAttribute('data-loading')).toBe(false)
  })

  it('treats loading as disabled and busy', async () => {
    const button = (await renderButton({ loading: true })).getByRole('button')

    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('aria-busy', 'true')
    await expect.element(button).toHaveAttribute('data-loading', 'true')
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
})
