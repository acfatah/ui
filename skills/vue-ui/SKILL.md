---
name: vue-ui
description: Usage reference for the acfatah/ui Vue components installed under components/ui (Button, Label, Switch and others built on Ark UI). Use when writing or editing Vue templates that use these components, choosing a variant or prop, importing an icon, or restyling one of them.
---

# acfatah/ui components

These components were installed from the `acfatah/ui` shadcn registry.
They are source files the project owns, not an npm package: read them
when this reference and the code disagree, and trust the code.

## Before writing code

1. Read `components.json` at the project root. `aliases.ui` is where the
   components live (default `@/components/ui`), `aliases.hooks` is where
   composables live. Every import in the references below uses the
   defaults; rewrite them if the aliases differ.
2. Check the component is installed: a directory `<ui>/<name>/` exists.
   If it does not, suggest the install command instead of writing one
   by hand:

   ```bash
   bunx --bun shadcn@latest add acfatah/ui/vue/<name>
   ```

3. Read `references/<name>.md` for that component, listed below, before
   using it for the first time in a task.

## Conventions

- **Import from the component's directory**, never from a file inside
  it: `import { Button } from '@/components/ui/button'`.
- **Single-part components use the flat export** (`Button`, `Label`).
  **Multi-part components use the namespace object** (`Switch.Root`,
  `Switch.Control`). Both forms are exported; use the one each reference
  shows, and never mix the two for one component in a file.
- **Icons come from `@/components/ui/icons` only**, never from
  `@lucide/vue` or any icon package. Missing an icon? Add a named
  re-export to `components/ui/icons/index.ts`, then import it. An icon
  inside a component takes `data-part="icon"` so the component sizes it.
- **Pick an existing `variant` or `size`** before adding classes. Extra
  classes on `class` are merged with `cn`, so they override cleanly;
  use that for one-off layout, not to recreate a variant.
- **Change a component's look in its `styles.ts`**, which holds every
  class string for every part. The `.vue` files hold behaviour only.
- **Kebab-case props in templates**: `default-checked`, `as-child`,
  `v-model:checked`.
- **`as-child`** renders the component's behaviour and styles onto your
  single child element (a link, a router link) instead of its own tag.
- **Accessibility**: an icon-only control needs `aria-label`; a
  decorative icon beside text takes `aria-hidden="true"`.

## Components

<!-- index:start -->
| Component | Reference | Use for |
| --- | --- | --- |
| Button | [references/button.md](references/button.md) | Displays a button or a component that looks like a button. |
| Description | [references/description.md](references/description.md) | Supporting text that gives a control, title or heading more context. |
| Icons | [references/icons.md](references/icons.md) | The single icon indirection every component imports its icons from. |
| Label | [references/label.md](references/label.md) | Renders an accessible label associated with controls. |
| Switch | [references/switch.md](references/switch.md) | A control that allows the user to toggle between checked and not checked. |
| Tags Input | [references/tags-input.md](references/tags-input.md) | A text input that turns what is typed into a list of removable, editable tags. |
<!-- index:end -->
