import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // Optimizar el chunking para mejor cache
          manualChunks: {
            vendor: ['react', 'react-dom'],
            cloudinary: ['cloudinary'],
            google: ['googleapis']
          }
        }
      }
    }
  },

  adapter: vercel(),

  image: {
    serviceEntryPoint: '@astrojs/image/cloudinary',
    cloudinary: {
      cloudName: 'enduranceenjoyers',
      url: 'https://res.cloudinary.com/enduranceenjoyers/image/upload'
    }
  },

  // Optimización de construcción
  build: {
    inlineStylesheets: 'auto'
  },

  // Compresión y optimización
  compressHTML: true
})
