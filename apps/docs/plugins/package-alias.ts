import type { Plugin } from 'vite'

import path from 'node:path'

/**
 * Resolves `@/` by importer. Nimbus's starter owns `@/` for `src/`, and the
 * Vue package uses the same alias for its own `src/` — with overlapping
 * subpaths (`@/components/ui/button` exists in both). Imports from inside
 * `packageSrc` resolve there; every other `@/` falls through to the
 * `tsconfig` alias, so Nimbus files stay byte-identical to upstream.
 */
export function packageAlias(packageSrc: string): Plugin {
  const root = path.resolve(packageSrc) + path.sep

  return {
    name: 'docs:package-alias',
    enforce: 'pre',

    async resolveId(source, importer, options) {
      if (!source.startsWith('@/') || !importer)
        return null

      if (!path.resolve(importer.split('?')[0]).startsWith(root))
        return null

      return this.resolve(path.join(root, source.slice(2)), importer, {
        ...options,
        skipSelf: true,
      })
    },
  }
}
