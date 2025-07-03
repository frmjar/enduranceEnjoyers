import node from '@astrojs/node'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [react()],

  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()]
  }
})
