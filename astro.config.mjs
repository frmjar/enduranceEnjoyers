import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config

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
    // Configuración de calidad y formato
    format: ['webp', 'avif'],
    fallbackFormat: 'png',
    domains: ['res.cloudinary.com']
  },

  // Optimización de construcción
  build: {
    inlineStylesheets: 'auto'
  },

  // Compresión y optimización
  compressHTML: true,
  trailingSlash: 'never',
  
  // Configuración de rendimiento
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  }
})
