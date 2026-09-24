/*
  The single icon indirection.

  No component and no example imports an icon package directly. Every
  icon a component needs is named here and imported from
  `@/components/ui/icons`, so swapping icon sets is one edit to this file
  rather than an edit to every component that draws an icon.

  The consumer owns this file. Re-point it at a different package, or at
  hand-written SFCs, and nothing else changes.

  `@lucide/vue` is the current package. `lucide-vue-next` is deprecated
  on npm in its favour.
*/

export {
  ArrowUpIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  GitBranchIcon,
  LoaderCircleIcon,
  XIcon,
} from '@lucide/vue'
