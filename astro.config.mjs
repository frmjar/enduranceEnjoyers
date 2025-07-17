import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
