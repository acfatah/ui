import type { Component } from 'vue'

import { createRenderer, h } from 'vue'

interface HeadlessNode {
  parent: HeadlessNode | null
  children: HeadlessNode[]
}

function node(): HeadlessNode {
  return { parent: null, children: [] }
}

/*
  A renderer whose host nodes are plain objects. Composables need a live
  component instance (`getCurrentInstance`, vnode props, emits) but no
  DOM, so the `unit` project mounts through this instead of a browser.
*/
const { createApp } = createRenderer<HeadlessNode, HeadlessNode>({
  createElement: node,
  createText: node,
  createComment: node,
  setText: () => {},
  setElementText: () => {},
  patchProp: () => {},
  parentNode: n => n.parent,
  nextSibling: (n) => {
    const siblings = n.parent?.children ?? []

    return siblings[siblings.indexOf(n) + 1] ?? null
  },
  insert: (child, parent, anchor) => {
    child.parent = parent
    const index = anchor ? parent.children.indexOf(anchor) : -1
    if (index === -1)
      parent.children.push(child)
    else
      parent.children.splice(index, 0, child)
  },
  remove: (child) => {
    const siblings = child.parent?.children
    siblings?.splice(siblings.indexOf(child), 1)
    child.parent = null
  },
})

/**
 * Mounts `component` with the props and listeners `getProps` returns,
 * re-read on every render so reactive sources drive updates.
 */
export function mountHeadless(component: Component, getProps: () => Record<string, unknown> = () => ({})) {
  const app = createApp({ render: () => h(component, getProps()) })
  app.config.warnHandler = () => {}
  app.mount(node())

  return app
}
