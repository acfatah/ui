import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig } from 'vite'

/*
  Resolves the `@/` alias and compiles SFCs for anything that renders a
  component from this package. Nothing consumes it yet; it exists so the
  first component has a working dev/test entry point rather than needing
  one invented alongside it.
*/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '~shared': path.resolve(import.meta.dirname, '../../shared'),
      'packages.vue': path.resolve(import.meta.dirname, './src'),
    },
  },
})
