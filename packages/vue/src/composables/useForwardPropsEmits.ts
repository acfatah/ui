import { computed } from 'vue'

import { useEmitAsProps } from './useEmitAsProps'
import { useForwardProps } from './useForwardProps'

/**
 * `useForwardProps` and `useEmitAsProps` in one: the props the parent
 * passed, plus an `on<Event>` handler per declared emit, ready to
 * `v-bind` onto the wrapped component.
 *
 * @param props - the props to forward, commonly `reactiveOmit(props, 'class')`
 * @param [emit] - the component's `emit`; omit when it declares no emits
 * @returns a computed object of forwarded props and emit handlers
 *
 * **Attribution to the Reka UI team**
 *
 * Source: https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/useForwardPropsEmits.ts
 */
export function useForwardPropsEmits<
  T extends Parameters<typeof useForwardProps>[0],
  Name extends string,
>(
  props: T,
  emit?: (name: Name, ...args: any[]) => void,
) {
  const parsedProps = useForwardProps(props)
  const emitsAsProps = emit ? useEmitAsProps(emit) : {}

  return computed(() => ({
    ...parsedProps.value,
    ...emitsAsProps,
  }))
}
