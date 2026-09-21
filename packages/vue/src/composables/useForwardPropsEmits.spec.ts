import { reactiveOmit } from '@vueuse/core'
import { mountHeadless } from '~test/headless'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import { useForwardPropsEmits } from './useForwardPropsEmits'

describe('useForwardPropsEmits', () => {
  function probe(withEmit: boolean) {
    let forwarded: Record<string, any> = {}

    const component = defineComponent({
      props: { class: String, checked: Boolean, name: String },
      emits: ['update:checked'],
      setup(props, { emit }) {
        const delegated = reactiveOmit(props, 'class')
        forwarded = useForwardPropsEmits(delegated, withEmit ? emit : undefined).value

        return () => null
      },
    })

    return { component, forwarded: () => forwarded }
  }

  it('merges the forwarded props with the emit handlers', () => {
    const onUpdate = vi.fn()
    const { component, forwarded } = probe(true)
    mountHeadless(component, () => ({
      'class': 'x',
      'checked': true,
      'onUpdate:checked': onUpdate,
    }))

    expect(Object.keys(forwarded()).sort())
      .toStrictEqual(['checked', 'onUpdate:checked'])

    forwarded()['onUpdate:checked'](false)
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(false)
  })

  it('forwards props alone when no emit is given', () => {
    const { component, forwarded } = probe(false)
    mountHeadless(component, () => ({ name: 'n' }))

    expect(forwarded()).toStrictEqual({ name: 'n' })
  })
})
