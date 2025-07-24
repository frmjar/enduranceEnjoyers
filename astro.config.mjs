import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://enduenjoyers.es',

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
      },
      // Optimizar el tamaño del bundle
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    // Optimizar la carga de módulos
    optimizeDeps: {
      exclude: ['@vercel/analytics', '@vercel/speed-insights']
    }
  },

  adapter: vercel({
    analytics: true,
    speedInsights: {
      enabled: true
    },
    imageService: true
  }),

  image: {
    serviceEntryPoint: '@astrojs/image/cloudinary',
    cloudinary: {
      cloudName: 'enduranceenjoyers',
      url: 'https://res.cloudinary.com/enduranceenjoyers/image/upload'
    },
    format: ['webp', 'avif'],
    fallbackFormat: 'png',
    domains: ['res.cloudinary.com']
  },

  build: {
    inlineStylesheets: 'auto'
  },

  compressHTML: true,
  trailingSlash: 'never',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  }
})
