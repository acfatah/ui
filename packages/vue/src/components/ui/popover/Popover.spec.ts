import { expectNoAxeViolations } from '~test/a11y'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, nextTick, ref } from 'vue'

import PopoverAnchor from './PopoverAnchor.vue'
import PopoverArrow from './PopoverArrow.vue'
import PopoverCloseTrigger from './PopoverCloseTrigger.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverDescription from './PopoverDescription.vue'
import PopoverRoot from './PopoverRoot.vue'
import PopoverTitle from './PopoverTitle.vue'
import PopoverTrigger from './PopoverTrigger.vue'

const components = {
  PopoverAnchor,
  PopoverArrow,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverDescription,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
}

// Keyed by part name, capitalised, so no key reads as a root prop.
interface Parts {
  Anchor?: Record<string, unknown>
  Arrow?: Record<string, unknown>
  CloseTrigger?: Record<string, unknown>
  Content?: Record<string, unknown>
  Description?: Record<string, unknown>
  Title?: Record<string, unknown>
  Trigger?: Record<string, unknown>
}

/*
  The full composition a consumer writes, plus a plain button outside
  the popover to click and focus when a test needs "somewhere else".
*/
async function renderPopover(root: Record<string, unknown> = {}, parts: Parts = {}) {
  return await render(defineComponent({
    components,
    setup: () => ({ root, parts }),
    template: `
      <button type="button">Outside</button>
      <PopoverRoot v-bind="root">
        <PopoverAnchor v-bind="parts.Anchor">Anchor</PopoverAnchor>
        <PopoverTrigger v-bind="parts.Trigger">Open</PopoverTrigger>
        <PopoverContent v-bind="parts.Content">
          <PopoverArrow v-bind="parts.Arrow" />
          <PopoverTitle v-bind="parts.Title">Dimensions</PopoverTitle>
          <PopoverDescription v-bind="parts.Description">Set the layer size.</PopoverDescription>
          <input aria-label="Width">
          <PopoverCloseTrigger v-bind="parts.CloseTrigger">Close</PopoverCloseTrigger>
        </PopoverContent>
      </PopoverRoot>
    `,
  }))
}

/*
  Zag gives the close trigger `aria-label` from `translations`, "close" by
  default, which replaces its text as the accessible name. The fixture's
  text matches it, so the visible label stays in the name.
*/

/*
  The teleported content. It sits in `document.body`, outside the render
  container, so it is found through `page`, never through the screen.
*/
const dialog = () => page.getByRole('dialog', { name: 'Dimensions' })
const content = () => document.querySelector<HTMLElement>('[data-scope="popover"][data-part="content"]')!
const part = (name: string) => document.querySelector<HTMLElement>(`[data-scope="popover"][data-part="${name}"]`)!

async function open(screen: Awaited<ReturnType<typeof renderPopover>>) {
  await userEvent.click(screen.getByRole('button', { name: 'Open' }))
  await expect.element(dialog()).toBeVisible()
}

describe('popover', () => {
  describe('rendering', () => {
    it('renders a trigger that announces a dialog popup, closed', async () => {
      const screen = await renderPopover()
      const trigger = screen.getByRole('button', { name: 'Open' })

      await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog')
      await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect.element(trigger).toHaveAttribute('data-state', 'closed')
    })

    it('mounts closed content hidden, not absent', async () => {
      await renderPopover()

      /*
        lazyMount and unmountOnExit default to false, so the content is in
        the DOM from the first render and only `hidden` while closed.
      */
      expect(content()).not.toBeNull()
      expect(content().hidden).toBe(true)
    })

    it('teleports the content to the body, outside the render container', async () => {
      const screen = await renderPopover({ defaultOpen: true })

      await expect.element(dialog()).toBeVisible()
      expect(screen.container.contains(content())).toBe(false)
      expect(content().closest('[data-part="positioner"]')?.parentElement).toBe(document.body)
    })

    it('carries the popover scope and part on every part', async () => {
      await renderPopover({ defaultOpen: true })
      await expect.element(dialog()).toBeVisible()

      for (const name of ['anchor', 'trigger', 'positioner', 'content', 'arrow', 'arrow-tip', 'title', 'description', 'close-trigger']) {
        expect(part(name), name).not.toBeNull()
      }
    })

    it('labels and describes the content through its title and description', async () => {
      await renderPopover({ defaultOpen: true })
      await expect.element(dialog()).toBeVisible()

      expect(content().getAttribute('aria-labelledby')).toBe(part('title').id)
      expect(content().getAttribute('aria-describedby')).toBe(part('description').id)
    })

    it('styles the description through the description component', async () => {
      await renderPopover({ defaultOpen: true })
      await expect.element(dialog()).toBeVisible()

      expect(part('description').tagName).toBe('P')
      expect(part('description').classList.contains('text-muted-foreground')).toBe(true)
    })

    it('renders a tip inside the arrow when given no children', async () => {
      await renderPopover({ defaultOpen: true })
      await expect.element(dialog()).toBeVisible()

      expect(part('arrow').querySelector('[data-part="arrow-tip"]')).not.toBeNull()
    })

    it('removes the teleported content when unmounted', async () => {
      const screen = await renderPopover({ defaultOpen: true })
      await expect.element(dialog()).toBeVisible()

      screen.unmount()
      await nextTick()

      expect(document.querySelector('[data-scope="popover"]')).toBeNull()
    })
  })

  describe('props', () => {
    it('lets a consumer class override a style class on each styled part', async () => {
      await renderPopover({ defaultOpen: true }, {
        Arrow: { class: '[--arrow-size:--spacing(4)]' },
        Content: { class: 'w-96' },
        Description: { class: 'text-destructive' },
        Title: { class: 'font-bold' },
      })
      await expect.element(dialog()).toBeVisible()

      expect(part('content').classList.contains('w-96')).toBe(true)
      expect(part('content').classList.contains('w-72')).toBe(false)
      expect(part('title').classList.contains('font-bold')).toBe(true)
      expect(part('title').classList.contains('font-medium')).toBe(false)
      expect(part('description').classList.contains('text-destructive')).toBe(true)
      expect(part('description').classList.contains('text-muted-foreground')).toBe(false)
      expect(part('arrow').classList.contains('[--arrow-size:--spacing(4)]')).toBe(true)
      expect(part('arrow').classList.contains('[--arrow-size:--spacing(2.5)]')).toBe(false)
    })

    it('passes attributes to the content, not the positioner', async () => {
      await renderPopover({ defaultOpen: true }, { Content: { 'data-testid': 'layer' } })
      await expect.element(dialog()).toBeVisible()

      expect(part('content').dataset.testid).toBe('layer')
      expect(part('positioner').dataset.testid).toBeUndefined()
    })

    it.each([
      'Anchor',
      'CloseTrigger',
      'Content',
      'Description',
      'Title',
      'Trigger',
    ] as const)('renders %s onto its child with asChild', async (name) => {
      await render(defineComponent({
        components,
        setup: () => ({ as: (part: string) => (part === name ? { asChild: true } : {}) }),
        template: `
          <PopoverRoot default-open>
            <PopoverAnchor v-bind="as('Anchor')"><span>Anchor</span></PopoverAnchor>
            <PopoverTrigger v-bind="as('Trigger')"><span>Open</span></PopoverTrigger>
            <PopoverContent v-bind="as('Content')">
              <section>
                <PopoverTitle v-bind="as('Title')"><h2>Dimensions</h2></PopoverTitle>
                <PopoverDescription v-bind="as('Description')"><span>Size.</span></PopoverDescription>
                <PopoverCloseTrigger v-bind="as('CloseTrigger')"><span>Done</span></PopoverCloseTrigger>
              </section>
            </PopoverContent>
          </PopoverRoot>
        `,
      }))
      await expect.element(dialog()).toBeVisible()

      const tag = {
        Anchor: 'SPAN',
        CloseTrigger: 'SPAN',
        Content: 'SECTION',
        Description: 'SPAN',
        Title: 'H2',
        Trigger: 'SPAN',
      }[name]
      const partName = name.replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase())

      expect(part(partName).tagName).toBe(tag)
    })

    it('renders the arrow onto its child with asChild', async () => {
      await render(defineComponent({
        components,
        template: `
          <PopoverRoot default-open>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
              <PopoverArrow v-bind="{ asChild: true }"><span /></PopoverArrow>
              <PopoverTitle>Dimensions</PopoverTitle>
            </PopoverContent>
          </PopoverRoot>
        `,
      }))
      await expect.element(dialog()).toBeVisible()

      expect(part('arrow').tagName).toBe('SPAN')
      expect(part('arrow').style.getPropertyValue('--arrow-size-half')).not.toBe('')
    })

    it('opens through a trigger value and reports it', async () => {
      const onTriggerValueChange = vi.fn()
      const onUpdateTriggerValue = vi.fn()
      const screen = await renderPopover(
        { 'defaultTriggerValue': null, onTriggerValueChange, 'onUpdate:triggerValue': onUpdateTriggerValue },
        { Trigger: { value: 'toolbar' } },
      )

      await open(screen)

      expect(onTriggerValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'toolbar' }))
      expect(onUpdateTriggerValue).toHaveBeenCalledWith('toolbar')
      await expect.element(screen.getByRole('button', { name: 'Open' }))
        .toHaveAttribute('data-value', 'toolbar')
    })

    it('reads a controlled trigger value', async () => {
      const screen = await renderPopover(
        { open: true, triggerValue: 'toolbar' },
        { Trigger: { value: 'toolbar' } },
      )

      await expect.element(screen.getByRole('button', { name: 'Open' }))
        .toHaveAttribute('data-current', '')
    })

    it('uses the given machine id and element ids', async () => {
      await renderPopover({ defaultOpen: true, id: 'size', ids: { content: 'size-panel', title: 'size-title' } })
      await expect.element(dialog()).toBeVisible()

      expect(content().id).toBe('size-panel')
      expect(part('title').id).toBe('size-title')
    })

    it('labels the close trigger from translations', async () => {
      await renderPopover({ defaultOpen: true, translations: { closeTriggerLabel: 'Close sizes' } })
      await expect.element(dialog()).toBeVisible()

      expect(part('close-trigger').getAttribute('aria-label')).toBe('Close sizes')
    })

    it('lets an aria-label on the close trigger replace the default', async () => {
      await renderPopover({ defaultOpen: true }, { CloseTrigger: { 'aria-label': 'Cancel' } })

      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    })

    it('names the content with an aria-label when there is no title', async () => {
      await render(defineComponent({
        components,
        template: `
          <PopoverRoot default-open>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent aria-label="Sizes">Short note.</PopoverContent>
          </PopoverRoot>
        `,
      }))

      await expect.element(page.getByRole('dialog', { name: 'Sizes' })).toBeVisible()
      await expectNoAxeViolations(part('positioner'))
    })

    it('does not mount the content until first opened with lazyMount', async () => {
      const screen = await renderPopover({ lazyMount: true })

      expect(document.querySelector('[data-part="content"]')).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: 'Open' }))

      await expect.element(page.getByRole('dialog')).toBeVisible()
    })

    it('names lazily mounted content by an aria-label', async () => {
      const screen = await renderPopover({ lazyMount: true }, { Content: { 'aria-label': 'Layer size' } })

      await userEvent.click(screen.getByRole('button', { name: 'Open' }))

      await expect.element(page.getByRole('dialog', { name: 'Layer size' })).toBeVisible()
      await expectNoAxeViolations(part('positioner'))
    })

    /*
      Upstream defect, documented on the popover page with the aria-label
      workaround above. @zag-js/popover (1.43.3 to 1.44.0, 2.0.0-next.3)
      checks for a rendered title once, when the machine starts
      (`popover.machine.mjs`, `entry: ["checkRenderedElements"]`), so a
      title that mounts later never sets `aria-labelledby`. When an
      upgrade fixes it, this test fails: drop the docs caveat and make it
      a plain `it`.
    */
    it.fails('flags that lazily mounted content is not labelled by its title', async () => {
      const screen = await renderPopover({ lazyMount: true })

      await userEvent.click(screen.getByRole('button', { name: 'Open' }))
      await expect.element(page.getByRole('dialog')).toBeVisible()

      await expect.element(page.getByRole('dialog'), { timeout: 1000 })
        .toHaveAttribute('aria-labelledby', part('title').id)
    })

    it('unmounts the content on close with unmountOnExit', async () => {
      const screen = await renderPopover({ unmountOnExit: true })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => document.querySelector('[data-part="content"]')).toBeNull()
    })

    it('renders the content in place with portalled off', async () => {
      const screen = await renderPopover({ portalled: false })

      await open(screen)

      // Zag stops proxying Tab, so the DOM order has to be the tab order.
      expect(screen.container.contains(part('positioner'))).toBe(true)
    })

    it('treats persistent elements as inside the popover', async () => {
      const screen = await renderPopover({
        persistentElements: [() => document.querySelector('button')],
      })

      await open(screen)
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

      await expect.element(dialog()).toBeVisible()
    })
  })

  describe('states', () => {
    it('starts open with defaultOpen', async () => {
      const screen = await renderPopover({ defaultOpen: true })

      await expect.element(dialog()).toBeVisible()
      await expect.element(screen.getByRole('button', { name: 'Open' }))
        .toHaveAttribute('aria-expanded', 'true')
      expect(content().dataset.state).toBe('open')
    })

    it('follows a controlled open prop and emits the change', async () => {
      const onUpdate = vi.fn()
      const screen = await render(defineComponent({
        components,
        setup: () => ({ isOpen: ref(false), onUpdate }),
        template: `
          <PopoverRoot v-model:open="isOpen" @update:open="onUpdate">
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent><PopoverTitle>Dimensions</PopoverTitle></PopoverContent>
          </PopoverRoot>
          <span data-testid="state">{{ isOpen }}</span>
        `,
      }))

      await userEvent.click(screen.getByRole('button', { name: 'Open' }))

      await expect.element(dialog()).toBeVisible()
      await expect.element(screen.getByTestId('state')).toHaveTextContent('true')
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('marks the content modal with modal', async () => {
      await renderPopover({ defaultOpen: true, modal: true })

      await expect.element(dialog()).toHaveAttribute('aria-modal', 'true')
    })

    it('traps focus inside the content with modal', async () => {
      const screen = await renderPopover({ modal: true })

      await open(screen)
      for (let i = 0; i < 4; i++)
        await userEvent.tab()

      expect(content().contains(document.activeElement)).toBe(true)
    })
  })

  describe('interaction', () => {
    it('opens from the trigger and moves focus into the content', async () => {
      const screen = await renderPopover()

      await open(screen)

      await expect.element(screen.getByRole('button', { name: 'Open' }))
        .toHaveAttribute('aria-expanded', 'true')
      await expect.poll(() => content().contains(document.activeElement)).toBe(true)
    })

    it('focuses the chosen element with initialFocusEl', async () => {
      const screen = await renderPopover({
        initialFocusEl: () => document.querySelector('[data-part="close-trigger"]'),
      })

      await open(screen)

      await expect.poll(() => document.activeElement).toBe(part('close-trigger'))
    })

    it('leaves focus on the trigger with autoFocus off', async () => {
      const screen = await renderPopover({ autoFocus: false })
      const trigger = screen.getByRole('button', { name: 'Open' })

      await open(screen)

      expect(document.activeElement).toBe(await trigger.element())
    })

    it.each([
      ['Escape', async () => userEvent.keyboard('{Escape}')],
      ['an outside click', async () => userEvent.click(page.getByRole('button', { name: 'Outside' }))],
      ['the close trigger', async () => userEvent.click(page.getByRole('button', { name: 'Close' }))],
    ])('closes on %s', async (_, dismiss) => {
      const screen = await renderPopover()

      await open(screen)
      await dismiss()

      await expect.element(dialog()).not.toBeInTheDocument()
      await expect.element(screen.getByRole('button', { name: 'Open' }))
        .toHaveAttribute('aria-expanded', 'false')
    })

    it('returns focus to the trigger on close', async () => {
      const screen = await renderPopover()
      const trigger = screen.getByRole('button', { name: 'Open' })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => document.activeElement).toBe(await trigger.element())
    })

    it('leaves focus where it was with restoreFocus off', async () => {
      const screen = await renderPopover({ restoreFocus: false })
      const trigger = screen.getByRole('button', { name: 'Open' })

      await open(screen)
      await userEvent.keyboard('{Escape}')
      await expect.element(dialog()).not.toBeInTheDocument()

      expect(document.activeElement).not.toBe(await trigger.element())
    })

    it('moves focus to finalFocusEl on close', async () => {
      const screen = await renderPopover({
        finalFocusEl: () => document.querySelector('button'),
      })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => document.activeElement?.textContent).toBe('Outside')
    })

    it('stays open on Escape with closeOnEscape off', async () => {
      const screen = await renderPopover({ closeOnEscape: false })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.element(dialog()).toBeVisible()
    })

    it('stays open on an outside click with closeOnInteractOutside off', async () => {
      const screen = await renderPopover({ closeOnInteractOutside: false })

      await open(screen)
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

      await expect.element(dialog()).toBeVisible()
    })

    it('emits escapeKeyDown and openChange on Escape', async () => {
      const onEscapeKeyDown = vi.fn()
      const onOpenChange = vi.fn()
      const screen = await renderPopover({ onEscapeKeyDown, onOpenChange })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => onOpenChange).toHaveBeenLastCalledWith({ open: false })
      expect(onEscapeKeyDown).toHaveBeenCalledOnce()
    })

    it('emits the outside-interaction events on an outside click', async () => {
      const onInteractOutside = vi.fn()
      const onPointerDownOutside = vi.fn()
      const screen = await renderPopover({ onInteractOutside, onPointerDownOutside })

      await open(screen)
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

      await expect.poll(() => onPointerDownOutside).toHaveBeenCalled()
      expect(onInteractOutside).toHaveBeenCalled()
    })

    it('emits focusOutside when focus leaves the content', async () => {
      const onFocusOutside = vi.fn()
      const screen = await renderPopover({ onFocusOutside })

      await open(screen)
      ;(await screen.getByRole('button', { name: 'Outside' }).element() as HTMLElement).focus()

      await expect.poll(() => onFocusOutside).toHaveBeenCalled()
    })

    it('emits exitComplete once closed', async () => {
      const onExitComplete = vi.fn()
      const screen = await renderPopover({ onExitComplete })

      await open(screen)
      await userEvent.keyboard('{Escape}')

      await expect.poll(() => onExitComplete).toHaveBeenCalled()
    })
  })

  describe('placement', () => {
    it.each(['top', 'right', 'bottom', 'left'] as const)(
      'places the content on the %s',
      async (placement) => {
        await renderPopover({ defaultOpen: true, positioning: { placement } })

        await expect.element(dialog()).toHaveAttribute('data-side', placement)
        await expect.element(dialog()).toHaveAttribute('data-placement', placement)
      },
    )

    it('defaults to the bottom', async () => {
      await renderPopover({ defaultOpen: true })

      await expect.element(dialog()).toHaveAttribute('data-side', 'bottom')
    })
  })

  describe('accessibility', () => {
    it('has no violations while closed', async () => {
      const screen = await renderPopover()

      await expect.element(screen.getByRole('button', { name: 'Open' })).toBeVisible()
      await expectNoAxeViolations(screen.container)
    })

    it('has no violations in the open content', async () => {
      const screen = await renderPopover()

      await open(screen)
      await expectNoAxeViolations(part('positioner'))
    })

    it('has no violations in the open modal content', async () => {
      const screen = await renderPopover({ modal: true })

      await open(screen)
      await expectNoAxeViolations(part('positioner'))
    })
  })
})
