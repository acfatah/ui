import type { App } from 'vue'

let islands = 0

/*
  Every island is its own Vue app, so `useId()` restarts at `v-0` in
  each. Astro gives server-rendered islands a unique `idPrefix`, but a
  `client:only` island gets none, and two of them on one page then share
  Ark ids (`popover:v-0:content`): Zag's `getElementById` finds the
  other island's element and positions or focuses the wrong one. Only
  fill the gap; overriding Astro's prefix would break hydration.
*/
export default (app: App) => {
  app.config.idPrefix ??= `only-${islands++}`
}
