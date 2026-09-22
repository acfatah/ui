import type { ComponentObjectPropsOptions, ComputedRef } from 'vue'

import { reactivePick } from '@vueuse/core'
import { mountHeadless } from '~test/headless'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { computed, defineComponent, nextTick, ref } from 'vue'

import { useForwardProps } from './useForwardProps'

function probe(props: ComponentObjectPropsOptions, pick?: string[]) {
  const seen: Record<string, unknown>[] = []

  const component = defineComponent({
    props,
    setup(props) {
      const source = pick ? reactivePick(props as Record<string, unknown>, ...pick) : props
      const forwarded = useForwardProps(source)

      return () => {
        seen.push({ ...forwarded.value })

        return null
      }
    },
  })

  return { component, seen }
}

describe('useForwardProps', () => {
  it('forwards nothing when no props are passed', () => {
    const { component, seen } = probe({ id: String })
    mountHeadless(component)

    expect(seen.at(-1)).toStrictEqual({})
  })

  it('forwards declared defaults', () => {
    const { component, seen } = probe({ id: { type: String, default: 'test' } })
    mountHeadless(component)

    expect(seen.at(-1)).toStrictEqual({ id: 'test' })
  })

  it('forwards passed props over defaults, falsy values included', () => {
    const { component, seen } = probe({
      id: { type: String, default: 'test' },
      number: Number,
      enabled: Boolean,
    })
    const passed = { id: 'new-test', number: 0, enabled: false }
    mountHeadless(component, () => passed)

    expect(seen.at(-1)).toStrictEqual(passed)
  })

  /*
    Vue casts an absent Boolean prop to `false`. Forwarding that would turn
    every unset `disabled` or `checked` on a wrapped Ark component into an
    explicit `false`, and make an uncontrolled `checked` look controlled.
  */
  it('does not forward an absent Boolean prop as false', () => {
    const { component, seen } = probe({ checked: Boolean })
    mountHeadless(component)

    expect(seen.at(-1)).toStrictEqual({})
  })

  it('normalises kebab-case attributes to camelCase keys', () => {
    const { component, seen } = probe({ readOnly: Boolean })
    mountHeadless(component, () => ({ 'read-only': true }))

    expect(seen.at(-1)).toStrictEqual({ readOnly: true })
  })

  it('is reactive', async () => {
    const id = ref<string>()
    const { component, seen } = probe({ id: { type: String, default: 'test' } })
    mountHeadless(component, () => (id.value ? { id: id.value } : {}))
    expect(seen.at(-1)).toStrictEqual({ id: 'test' })

    id.value = 'new-test'
    await nextTick()

    expect(seen.at(-1)).toStrictEqual({ id: 'new-test' })
  })

  it('ignores passed attributes that are not declared props', () => {
    const { component, seen } = probe({ id: { type: String, default: 'test' } })
    mountHeadless(component, () => ({ extra: 'not-related', class: 'custom' }))

    expect(seen.at(-1)).toStrictEqual({ id: 'test' })
  })

  it('forwards only the keys of the source it was given', async () => {
    const id = ref<string>()
    const { component, seen } = probe(
      {
        id: { type: String, default: 'test' },
        extra: { type: String, default: 'not-related' },
      },
      ['id'],
    )
    mountHeadless(component, () => (id.value ? { id: id.value } : {}))
    expect(seen.at(-1)).toStrictEqual({ id: 'test' })

    id.value = 'new-test'
    await nextTick()

    expect(seen.at(-1)).toStrictEqual({ id: 'new-test' })
  })

  it('accepts a computed source', async () => {
    const id = ref<string>()
    const seen: Record<string, unknown>[] = []
    const component = defineComponent({
      props: { id: { type: String, default: 'test' } },
      setup(props) {
        const forwarded = useForwardProps(computed(() => ({ ...props })))

        return () => {
          seen.push({ ...forwarded.value })

          return null
        }
      },
    })
    mountHeadless(component, () => (id.value ? { id: id.value } : {}))
    expect(seen.at(-1)).toStrictEqual({ id: 'test' })

    id.value = 'new-test'
    await nextTick()

    expect(seen.at(-1)).toStrictEqual({ id: 'new-test' })
  })

  it('infers the forwarded shape from the source', () => {
    expectTypeOf(useForwardProps<{ id?: string, size: number }>)
      .returns
      .toEqualTypeOf<ComputedRef<{ id?: string, size: number }>>()
  })
})
