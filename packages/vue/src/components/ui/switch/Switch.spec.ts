import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { defineComponent, ref } from 'vue'

import { switchControlStyles } from './styles'
import SwitchControl from './SwitchControl.vue'
import SwitchDescription from './SwitchDescription.vue'
import SwitchHiddenInput from './SwitchHiddenInput.vue'
import SwitchLabel from './SwitchLabel.vue'
import SwitchRoot from './SwitchRoot.vue'
import SwitchThumb from './SwitchThumb.vue'

/*
  The root's `label` prop is accepted by @zag-js/switch 1.43.3 but
  rendered nowhere, so no test sets it. check:props still counts it as
  covered, because it matches keys by name and `ids.label` is one; a
  waiver for it would never be read.
*/

const components = {
  SwitchControl,
  SwitchDescription,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
}

// Keyed by part name, capitalised, so no key reads as a root prop.
interface Parts {
  Control?: Record<string, unknown>
  Description?: Record<string, unknown>
  HiddenInput?: Record<string, unknown>
  Label?: Record<string, unknown>
}

/*
  The full composition a consumer writes. Every part is rendered, so a
  spec exercises the parts together the way Ark wires them up.
*/
async function renderSwitch(root: Record<string, unknown> = {}, parts: Parts = {}) {
  return await render(defineComponent({
    components,
    setup: () => ({ root, parts }),
    template: `
      <SwitchRoot v-bind="root">
        <SwitchHiddenInput v-bind="parts.HiddenInput" />
        <SwitchControl v-bind="parts.Control" />
        <SwitchLabel v-bind="parts.Label">Airplane mode</SwitchLabel>
        <SwitchDescription v-bind="parts.Description">Turns off every radio.</SwitchDescription>
      </SwitchRoot>
    `,
  }))
}

/*
  What a user clicks. The input is visually hidden and specs load no
  Tailwind CSS, so the track has no size; the label text is the visible
  target inside the root <label>, and clicking it toggles like the track.
*/
function targetOf(screen: { getByText: (text: string) => any }) {
  return screen.getByText('Airplane mode')
}

describe('switch', () => {
  describe('rendering', () => {
    it('exposes a switch named by its label', async () => {
      const screen = await renderSwitch()

      await expect.element(screen.getByRole('switch', { name: 'Airplane mode' }))
        .toBeInTheDocument()
    })

    it('renders the root as a label for the hidden input', async () => {
      const screen = await renderSwitch()
      const root = screen.container.querySelector('[data-part="root"]')!
      const input = await screen.getByRole('switch').element()

      expect(root.tagName).toBe('LABEL')
      expect(root.getAttribute('for')).toBe(input.id)
    })

    it('carries the switch scope and part on every part', async () => {
      const screen = await renderSwitch()

      for (const part of ['root', 'control', 'thumb', 'label', 'description']) {
        const element = screen.container.querySelector(`[data-scope="switch"][data-part="${part}"]`)
        expect(element, part).not.toBeNull()
      }
    })

    it('renders a thumb inside the control when given no children', async () => {
      const screen = await renderSwitch()
      const control = screen.container.querySelector('[data-part="control"]')!

      expect(control.querySelector('[data-part="thumb"]')).not.toBeNull()
    })

    it('renders the label as a span, not a label nested in the root label', async () => {
      const label = await (await renderSwitch()).getByText('Airplane mode').element()

      expect(label.tagName).toBe('SPAN')
      expect(label.classList.contains('font-medium')).toBe(true)
    })

    it('styles the description through the description component', async () => {
      const description = await (await renderSwitch()).getByText('Turns off every radio.').element()

      expect(description.classList.contains('text-muted-foreground')).toBe(true)
    })

    it('starts unchecked and leaves state attributes off an idle switch', async () => {
      const screen = await renderSwitch()
      const root = screen.container.querySelector('[data-part="root"]')!

      await expect.element(screen.getByRole('switch')).not.toBeChecked()
      expect(root.getAttribute('data-state')).toBe('unchecked')
      expect(root.hasAttribute('aria-disabled')).toBe(false)
      expect(root.hasAttribute('aria-busy')).toBe(false)
      expect(root.hasAttribute('data-loading')).toBe(false)
      expect(root.hasAttribute('data-disabled')).toBe(false)
    })
  })

  describe('props', () => {
    it('lets a consumer class override a style class on each part', async () => {
      const screen = await renderSwitch({ class: 'inline-block' }, {
        Control: { class: 'w-12' },
        Description: { class: 'text-destructive' },
        HiddenInput: { class: 'not-sr-only' },
        Label: { class: 'font-bold' },
      })
      const part = (name: string) => screen.container.querySelector(`[data-part="${name}"]`)!

      expect(part('root').classList.contains('inline-block')).toBe(true)
      expect(part('root').classList.contains('inline-flex')).toBe(false)
      expect(part('control').classList.contains('w-12')).toBe(true)
      expect(part('control').classList.contains('w-8')).toBe(false)
      expect(part('description').classList.contains('text-destructive')).toBe(true)
      expect(part('description').classList.contains('text-muted-foreground')).toBe(false)
      expect(part('label').classList.contains('font-bold')).toBe(true)
      expect(part('label').classList.contains('font-medium')).toBe(false)
      expect((await screen.getByRole('switch').element()).classList.contains('not-sr-only')).toBe(true)
    })

    it('applies a class to the thumb', async () => {
      const screen = await render(defineComponent({
        components,
        template: `
          <SwitchRoot>
            <SwitchHiddenInput />
            <SwitchControl><SwitchThumb class="size-3" /></SwitchControl>
            <SwitchLabel>Airplane mode</SwitchLabel>
          </SwitchRoot>
        `,
      }))
      const thumb = screen.container.querySelector('[data-part="thumb"]')!

      expect(thumb.classList.contains('size-3')).toBe(true)
      expect(thumb.classList.contains('size-4')).toBe(false)
    })

    it('renders each part onto its child when asChild is set', async () => {
      const screen = await render(defineComponent({
        components,
        setup: () => ({ asChild: true }),
        template: `
          <SwitchRoot :as-child="asChild">
            <label data-testid="root">
              <SwitchHiddenInput :as-child="asChild"><input data-testid="input"></SwitchHiddenInput>
              <SwitchControl :as-child="asChild">
                <div data-testid="control">
                  <SwitchThumb :as-child="asChild"><div data-testid="thumb" /></SwitchThumb>
                </div>
              </SwitchControl>
              <SwitchLabel :as-child="asChild"><em>Airplane mode</em></SwitchLabel>
              <SwitchDescription :as-child="asChild"><small>Help</small></SwitchDescription>
            </label>
          </SwitchRoot>
        `,
      }))

      await expect.element(screen.getByTestId('root')).toHaveAttribute('data-part', 'root')
      await expect.element(screen.getByTestId('input')).toHaveAttribute('role', 'switch')
      await expect.element(screen.getByTestId('control')).toHaveAttribute('data-part', 'control')
      await expect.element(screen.getByTestId('thumb')).toHaveAttribute('data-part', 'thumb')
      // The consumer's child replaces the default <span>, carrying Ark's
      // label props and the label styles, with no wrapper around it.
      const label = await screen.getByText('Airplane mode').element()
      expect(label.tagName).toBe('EM')
      expect(label.dataset.part).toBe('label')
      expect(label.classList.contains('font-medium')).toBe(true)
      expect(label.parentElement!.tagName).not.toBe('SPAN')
      expect((await screen.getByText('Help').element()).tagName).toBe('SMALL')
    })

    it('submits its name and value with a form when checked', async () => {
      const form = document.createElement('form')
      form.id = 'settings'
      document.body.appendChild(form)

      const screen = await renderSwitch({
        defaultChecked: true,
        form: 'settings',
        name: 'airplane',
        value: 'yes',
      })
      await expect.element(screen.getByRole('switch')).toBeChecked()

      expect(new FormData(form).get('airplane')).toBe('yes')

      form.remove()
    })

    it('uses the given id and part ids', async () => {
      const screen = await renderSwitch({
        id: 'airplane',
        ids: { hiddenInput: 'airplane-input', label: 'airplane-label' },
      })
      const input = screen.getByRole('switch')

      await expect.element(input).toHaveAttribute('id', 'airplane-input')
      await expect.element(input).toHaveAttribute('aria-labelledby', 'airplane-label')
      expect(screen.container.querySelector('[data-part="root"]')!.id).toBe('switch:airplane')
    })

    it('marks the input required', async () => {
      const screen = await renderSwitch({ required: true })

      await expect.element(screen.getByRole('switch')).toBeRequired()
    })
  })

  describe('states', () => {
    it('renders checked from defaultChecked', async () => {
      const screen = await renderSwitch({ defaultChecked: true })
      const root = screen.container.querySelector('[data-part="root"]')!

      await expect.element(screen.getByRole('switch')).toBeChecked()
      expect(root.getAttribute('data-state')).toBe('checked')
    })

    it('renders checked from a controlled checked prop', async () => {
      const screen = await renderSwitch({ checked: true })

      await expect.element(screen.getByRole('switch')).toBeChecked()
    })

    it('follows a controlled v-model and writes back to it', async () => {
      const checked = ref(false)
      const screen = await render(defineComponent({
        components,
        setup: () => ({ checked }),
        template: `
          <SwitchRoot v-model:checked="checked">
            <SwitchHiddenInput />
            <SwitchControl />
            <SwitchLabel>Airplane mode</SwitchLabel>
          </SwitchRoot>
        `,
      }))
      const input = screen.getByRole('switch')

      checked.value = true
      await expect.element(input).toBeChecked()

      await userEvent.click(targetOf(screen))
      await expect.element(input).not.toBeChecked()
      expect(checked.value).toBe(false)
    })

    it('disables the input and marks the root when disabled', async () => {
      const screen = await renderSwitch({ disabled: true })
      const root = screen.container.querySelector('[data-part="root"]')!

      await expect.element(screen.getByRole('switch')).toBeDisabled()
      expect(root.hasAttribute('data-disabled')).toBe(true)
      expect(root.getAttribute('aria-disabled')).toBe('true')
      expect(root.hasAttribute('aria-busy')).toBe(false)
    })

    it('disables the switch and marks it busy while loading', async () => {
      const screen = await renderSwitch({ loading: true })
      const root = screen.container.querySelector('[data-part="root"]')!

      await expect.element(screen.getByRole('switch')).toBeDisabled()
      expect(root.getAttribute('aria-disabled')).toBe('true')
      expect(root.getAttribute('aria-busy')).toBe('true')
      expect(root.getAttribute('data-loading')).toBe('true')
    })

    it('marks the input invalid and outlines the control', async () => {
      const screen = await renderSwitch({ invalid: true })
      const control = screen.container.querySelector('[data-part="control"]')!

      await expect.element(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true')
      expect(control.hasAttribute('data-invalid')).toBe(true)
      expect(switchControlStyles).toContain('data-invalid:border-destructive')
    })

    it('marks every part read-only when readOnly', async () => {
      const screen = await renderSwitch({ readOnly: true })

      for (const part of ['root', 'control', 'thumb', 'label']) {
        const element = screen.container.querySelector(`[data-part="${part}"]`)!
        expect(element.hasAttribute('data-readonly'), part).toBe(true)
      }
    })
  })

  describe('interaction', () => {
    it('toggles on click and emits the new state', async () => {
      const onUpdate = vi.fn()
      const onCheckedChange = vi.fn()
      const screen = await renderSwitch({
        'onUpdate:checked': onUpdate,
        'onCheckedChange': onCheckedChange,
      })
      const input = screen.getByRole('switch')

      await userEvent.click(targetOf(screen))
      await expect.element(input).toBeChecked()
      expect(onUpdate).toHaveBeenLastCalledWith(true)
      expect(onCheckedChange).toHaveBeenLastCalledWith({ checked: true })

      await userEvent.click(targetOf(screen))
      await expect.element(input).not.toBeChecked()
      expect(onUpdate).toHaveBeenLastCalledWith(false)
    })

    it('toggles when its label text is clicked', async () => {
      const screen = await renderSwitch()

      await userEvent.click(screen.getByText('Airplane mode'))

      await expect.element(screen.getByRole('switch')).toBeChecked()
    })

    it('is reachable by keyboard and toggles on Space', async () => {
      const screen = await renderSwitch()
      const input = screen.getByRole('switch')

      await userEvent.tab()
      expect(document.activeElement).toBe(await input.element())

      await userEvent.keyboard(' ')
      await expect.element(input).toBeChecked()
    })

    it('ignores clicks and is skipped by Tab when disabled', async () => {
      const onUpdate = vi.fn()
      const screen = await renderSwitch({ 'disabled': true, 'onUpdate:checked': onUpdate })
      const input = screen.getByRole('switch')

      await userEvent.tab()
      expect(document.activeElement).not.toBe(await input.element())

      await userEvent.click(targetOf(screen), { force: true })
      await expect.element(input).not.toBeChecked()
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('ignores clicks while loading', async () => {
      const onUpdate = vi.fn()
      const screen = await renderSwitch({ 'loading': true, 'onUpdate:checked': onUpdate })
      const input = screen.getByRole('switch')

      await userEvent.click(targetOf(screen), { force: true })

      await expect.element(input).not.toBeChecked()
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('stays focusable but ignores clicks and Space when readOnly', async () => {
      const onUpdate = vi.fn()
      const screen = await renderSwitch({ 'readOnly': true, 'onUpdate:checked': onUpdate })
      const input = screen.getByRole('switch')

      await userEvent.tab()
      expect(document.activeElement).toBe(await input.element())

      await userEvent.keyboard(' ')
      await userEvent.click(targetOf(screen))
      await expect.element(input).not.toBeChecked()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has no axe violations by default', async () => {
      const screen = await renderSwitch()

      await expect.element(screen.getByRole('switch')).toBeInTheDocument()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when checked', async () => {
      const screen = await renderSwitch({ defaultChecked: true })

      await expect.element(screen.getByRole('switch')).toBeChecked()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when disabled', async () => {
      const screen = await renderSwitch({ disabled: true })

      await expect.element(screen.getByRole('switch')).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations while loading', async () => {
      const screen = await renderSwitch({ loading: true })

      await expect.element(screen.getByRole('switch')).toBeDisabled()
      await expectNoAxeViolations(screen.container)
    })

    it('has no axe violations when invalid', async () => {
      const screen = await renderSwitch({ invalid: true })

      await expect.element(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true')
      await expectNoAxeViolations(screen.container)
    })
  })
})
