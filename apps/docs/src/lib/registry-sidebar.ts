import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Sidebar order for component categories. Docs navigation reads
 * `categories` only, never `meta.tier` (README, "Components declare
 * `categories` and `meta.tier`").
 */
const CATEGORIES = [
  ['form', 'Form'],
  ['actions', 'Actions'],
  ['navigation', 'Navigation'],
  ['overlay', 'Overlay'],
  ['data-display', 'Data display'],
  ['feedback', 'Feedback'],
  ['layout', 'Layout'],
] as const

interface RegistryItem {
  name: string
  title?: string
  categories?: string[]
}

/**
 * Component groups built from every `_registry.ts` under `componentsDir`.
 * An item joins one group per category, so membership is not exclusive.
 * Items without `categories` are infrastructure (e.g. `vue/icons`) and get
 * no page. Each link points at `components/<name without framework>`.
 */
export async function registrySidebar(componentsDir: string) {
  const dirs = await readdir(componentsDir, { withFileTypes: true })
  const items: RegistryItem[] = []

  for (const dir of dirs) {
    if (!dir.isDirectory())
      continue

    const file = path.join(componentsDir, dir.name, '_registry.ts')
    try {
      const mod = await import(/* @vite-ignore */ pathToFileURL(file).href)
      items.push(mod.default ?? mod.registryItem)
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ERR_MODULE_NOT_FOUND')
        throw error
    }
  }

  return CATEGORIES.flatMap(([category, label]) => {
    const members = items
      .filter(item => item.categories?.includes(category))
      .sort((a, b) => (a.title ?? a.name).localeCompare(b.title ?? b.name))
      .map(item => ({
        label: item.title ?? item.name,
        link: `/components/${item.name.split('/').pop()}`,
      }))

    return members.length ? [{ label, items: members }] : []
  })
}
