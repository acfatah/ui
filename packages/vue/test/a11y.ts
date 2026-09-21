import type { RunOptions } from 'axe-core'

import axe from 'axe-core'

/**
 * Fails the test when axe finds a violation inside `root`.
 *
 * Scope `root` to what the spec rendered: the render container, or for a
 * portal (T3) the teleported content in `document.body`, asserted in the
 * open state.
 *
 * `color-contrast` is off by default. Specs render components without
 * `global.css`, so every colour token is unresolved and contrast would be
 * measured against nothing. Contrast is checked against the real tokens by
 * the `audit-accessibility` skill instead. Pass `options.rules` to turn
 * other rules on or off for one assertion.
 */
export async function expectNoAxeViolations(root: Element, options: RunOptions = {}) {
  const { violations } = await axe.run(root, {
    ...options,
    rules: { 'color-contrast': { enabled: false }, ...options.rules },
  })

  if (violations.length === 0)
    return

  const report = violations.map(violation => [
    `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}`,
    ...violation.nodes.map(node => `  at ${node.target.join(' ')}`),
  ].join('\n'))

  throw new Error(`axe found ${violations.length} violation(s):\n${report.join('\n')}`)
}
