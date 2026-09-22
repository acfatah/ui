import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

/**
 * Converts the calling component's declared emits into `on<Event>` handler
 * props, so they can be bound onto a wrapped component with `v-bind`. Vue
 * has no emit forwarding of its own: https://github.com/vuejs/core/issues/5917
 *
 * @param emit - the component's `emit`, from `defineEmits`
 * @returns an object mapping `onEventName` to a handler that re-emits
 *          `event-name` with the same arguments
 *
 * **Attribution to the Reka UI team**
 *
 * Source: https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/useEmitAsProps.ts
 */
export function useEmitAsProps<Name extends string>(
  emit: (name: Name, ...args: any[]) => void,
): Record<string, (...args: any[]) => void> {
  const vm = getCurrentInstance()

  const rawEmits = vm?.type.emits
  const events: Name[] = Array.isArray(rawEmits)
    ? rawEmits
    : typeof rawEmits === 'object' && rawEmits !== null
      ? Object.keys(rawEmits) as Name[]
      : []
  const result: Record<string, (...args: any[]) => void> = {}

  if (!events.length) {
    console.warn(`No emitted event found. Please check component: ${vm?.type.__name}`)

    return result
  }

  for (const event of events)
    result[toHandlerKey(camelize(event))] = (...args: any[]) => emit(event, ...args)

  return result
}
