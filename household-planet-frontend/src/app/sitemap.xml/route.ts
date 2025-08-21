import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanet.co.ke'

// Static pages
const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' },
  { url: '/products', priority: 0.9, changefreq: 'daily' },
  { url: '/categories', priority: 0.8, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  { url: '/delivery', priority: 0.6, changefreq: 'monthly' },
  { url: '/login', priority: 0.3, changefreq: 'yearly' },
  { url: '/register', priority: 0.3, changefreq: 'yearly' },
]

async function getProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=1000`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 3600 }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    return []
  }
}

export async function GET() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categories.map((category: any) => `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.updatedAt || category.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${products.map((product: any) => `
  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${product.images?.map((image: any) => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${product.description || product.name}</image:caption>
    </image:image>`).join('') || ''}
  </url>`).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}