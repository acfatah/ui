import { existsSync } from 'node:fs'
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

export interface RegistryItem {
  name: string
  title?: string
  categories?: string[]
}

/** Docs slug for an item: its name without the framework prefix. */
export function componentSlug(item: RegistryItem) {
  return item.name.split('/').pop() as string
}

/**
 * Every `_registry.ts` under `componentsDir`, keyed by component
 * directory name. Directories without one are skipped.
 */
export async function readRegistryItems(componentsDir: string) {
  const dirs = await readdir(componentsDir, { withFileTypes: true })
  const items = new Map<string, RegistryItem>()

  for (const dir of dirs) {
    const file = path.join(componentsDir, dir.name, '_registry.ts')
    if (!dir.isDirectory() || !existsSync(file))
      continue

    const mod = await import(/* @vite-ignore */ pathToFileURL(file).href)
    items.set(dir.name, mod.default ?? mod.registryItem)
  }

  return items
}

/**
 * Component groups built from every `_registry.ts` under `componentsDir`.
 * An item joins one group per category, so membership is not exclusive.
 * Items without `categories` are infrastructure (e.g. `vue/icons`) and get
 * no page. Each link points at `components/<name without framework>`.
 */
export async function registrySidebar(componentsDir: string) {
  const items = [...(await readRegistryItems(componentsDir)).values()]

  return CATEGORIES.flatMap(([category, label]) => {
    const members = items
      .filter(item => item.categories?.includes(category))
      .sort((a, b) => (a.title ?? a.name).localeCompare(b.title ?? b.name))
      .map(item => ({
        label: item.title ?? item.name,
        link: `/components/${componentSlug(item)}`,
      }))

    return members.length ? [{ label, items: members }] : []
  })
}
