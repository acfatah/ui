import { mountHeadless } from '~test/headless'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import { useEmitAsProps } from './useEmitAsProps'

function probe(emits: string[] | Record<string, null>) {
  let handlers: Record<string, (...args: any[]) => void> = {}

  const component = defineComponent({
    emits: emits as string[],
    setup(_, { emit }) {
      handlers = useEmitAsProps(emit)

      return () => null
    },
  })

  return { component, handlers: () => handlers }
}

describe('useEmitAsProps', () => {
  it('maps each declared emit to an on<Event> handler', () => {
    const { component, handlers } = probe(['checkedChange', 'update:checked'])
    mountHeadless(component)

    expect(Object.keys(handlers()).sort())
      .toStrictEqual(['onCheckedChange', 'onUpdate:checked'])
  })

  it('camelizes kebab-case event names', () => {
    const { component, handlers } = probe(['value-change'])
    mountHeadless(component)

    expect(Object.keys(handlers())).toStrictEqual(['onValueChange'])
  })

  it('reads object-syntax emits', () => {
    const { component, handlers } = probe({ open: null })
    mountHeadless(component)

    expect(Object.keys(handlers())).toStrictEqual(['onOpen'])
  })

  it('re-emits to the parent with every argument', () => {
    const onUpdate = vi.fn()
    const { component, handlers } = probe(['update:checked'])
    mountHeadless(component, () => ({ 'onUpdate:checked': onUpdate }))

    handlers()['onUpdate:checked']!(true, 'extra')

    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(true, 'extra')
  })

  it('warns and returns nothing when the component declares no emits', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { component, handlers } = probe([])
    mountHeadless(component)

    expect(handlers()).toStrictEqual({})
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('types the result as a handler map', () => {
    expectTypeOf(useEmitAsProps<'open'>)
      .returns
      .toEqualTypeOf<Record<string, (...args: any[]) => void>>()
  })
})
