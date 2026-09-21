# Component page template

The layout of `src/content/docs/components/<slug>.mdx`, section by
section. The shipped reference is `components/button.mdx`; read it
beside this file.

## Why the page is shaped this way

Nimbus publishes each page three ways. `index.html` carries the live
islands. `index.md`, the version `llms.txt` hands to agents, strips every
component — `<Demo>` and the island vanish — and keeps fenced code. So a
demo's source lives in the fence right after it, visible to humans under
the preview and to agents on its own. `?raw` imports are gone for the same
reason: a source panel rendered by a component never reaches an agent.

`check:demos` enforces the mechanical half: one island per `<Demo>`, a
`client:*` directive, a top-level ` ```vue ` fence right after `</Demo>`
whose body equals the example file, no unused example imports, no `?raw`.

## Sections

````mdx
---
title: Button                         # registry `title`
description: Displays a button or a component that looks like a button.
                                      # first sentence of registry `description`
---

{/* One import per example file, through the package export. Local name
    = file name. Imported here, never via src/components.ts: Astro
    rejects client:* on a globally registered component. */}
import ButtonDemo from "packages.vue/components/ui/button/examples/ButtonDemo.vue";
import ButtonDefault from "packages.vue/components/ui/button/examples/ButtonDefault.vue";

Displays a button or a component that looks like a button. Built on Ark
UI's `ark.button` factory; styles live in a framework-free `styles.ts`.

{/* Hero: <Name>Demo, no heading. Without a Demo example, Default is
    the hero and gets no section of its own below. */}
<Demo>
  <ButtonDemo client:load />
</Demo>

```vue
...ButtonDemo.vue, verbatim...
```

## Installation

```bash
bunx --bun shadcn@latest add acfatah/ui/vue/button
```
{/* acfatah/ui/<registry name>. Only the Bun form. */}

## Usage

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="outline">
    Button
  </Button>
</template>
```
{/* Smallest real use, written for the page — the one fence not copied
    from an example. Imports exactly as a consumer would. */}

## Examples

### Default

The `default` variant at the default size.

<Demo>
  <ButtonDefault client:load />
</Demo>

```vue
...ButtonDefault.vue, verbatim...
```

{/* One ### per remaining example, in the order SKILL.md step 3 sets. */}

## References

- [Ark UI factory](https://ark-ui.com/docs/components/factory)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
{/* From the `References:` list in the registry description, as links
    titled by what they are. */}
````

The `{/* */}` comments above annotate the template; they are not part of
a page.

## Complex components

A component with `namespace.ts` documents the dotted namespace only, in
Usage and in every example it owns (`create-component`, section 7):

```vue
<script setup lang="ts">
import { Accordion } from '@/components/ui/accordion'
</script>

<template>
  <Accordion.Root>
    <Accordion.Item value="a">
      <Accordion.ItemTrigger>Title</Accordion.ItemTrigger>
      <Accordion.ItemContent>Body</Accordion.ItemContent>
    </Accordion.Item>
  </Accordion.Root>
</template>
```

An example written with flat exports is a finding for the report, not
something to rewrite here: the fence must equal the file.

## Overlays (T3)

Ark teleports overlay content to `<body>` on the client. The shipped pages
are all T1, so no overlay island has been rendered on this site yet. The
first T3 page must confirm in a browser that the island opens and its
teleported content picks up the theme (`.dark` sits on `<html>`, so it
should), and record the result in the docs app's `AGENT.md`.
