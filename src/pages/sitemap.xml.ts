import type { APIRoute } from 'astro'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const prerender = false

const PAGES_DIR = join(process.cwd(), 'src/pages')

const findAstroPages = (dir: string): string[] => {
  const pages: string[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      pages.push(...findAstroPages(fullPath))
    } else if (entry.endsWith('.astro') && !entry.startsWith('_')) {
      const relativePath = relative(PAGES_DIR, fullPath)
      const route = '/' + relativePath
        .replace(/\.astro$/, '')
        .replace(/index$/, '')
        .replace(/\\/g, '/')
      pages.push(route)
    }
  }

  return pages
}

const ROUTE_CONFIG: Record<string, { changefreq: string, priority: string }> = {
  '/': { changefreq: 'weekly', priority: '1.0' },
  '/calendario': { changefreq: 'weekly', priority: '0.8' }
}

export const GET: APIRoute = async (): Promise<Response> => {
  const baseUrl = 'https://enduenjoyers.es'
  const now = new Date().toISOString()
  const pages = findAstroPages(PAGES_DIR)

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => {
  const config = ROUTE_CONFIG[page] ?? { changefreq: 'monthly', priority: '0.5' }
  return `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`
}).join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
