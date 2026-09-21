import type { MaybeRefOrGetter } from 'vue'

import { camelize, computed, getCurrentInstance, toRef } from 'vue'

interface PropOptions {
  type?: any
  required?: boolean
  default?: any
}

/**
 * Narrows a props object to the props the parent actually passed, plus
 * declared props that have a default. Absent props stay absent rather than
 * forwarding as `undefined`, so a wrapped Ark component keeps its own
 * defaults and its controlled/uncontrolled detection.
 *
 * @param props - the component's props, or a subset of them such as the
 *                result of `reactiveOmit`
 * @returns a computed object holding only the props to forward
 *
 * **Attribution to the Reka UI team**
 *
 * Source: https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/useForwardProps.ts
 */
export function useForwardProps<T extends Record<string, any>>(props: MaybeRefOrGetter<T>) {
  const vm = getCurrentInstance()

  const defaultProps = Object.keys(vm?.type.props ?? {}).reduce((prev, curr) => {
    const defaultValue = (vm?.type.props[curr] as PropOptions).default
    if (defaultValue !== undefined)
      prev[curr as keyof T] = defaultValue

    return prev
  }, {} as T)

  const refProps = toRef(props)

  return computed(() => {
    const preservedProps = {} as T
    const assignedProps = vm?.vnode.props ?? {}

    Object.keys(assignedProps).forEach((key) => {
      preservedProps[camelize(key) as keyof T] = assignedProps[key]
    })

    return Object.keys({ ...defaultProps, ...preservedProps }).reduce((prev, curr) => {
      if (refProps.value[curr] !== undefined)
        prev[curr as keyof T] = refProps.value[curr]

      return prev
    }, {} as T)
  })
}
