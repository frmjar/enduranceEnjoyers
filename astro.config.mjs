import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://enduenjoyers.es',
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
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
