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
  },

  image: {
    serviceEntryPoint: '@astrojs/image/cloudinary',
    cloudinary: {
      cloudName: 'enduranceenjoyers',
      url: 'https://res.cloudinary.com/enduranceenjoyers/image/upload'
    }
  }
})
