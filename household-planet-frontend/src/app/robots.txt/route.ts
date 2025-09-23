import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanetkenya.co.ke'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/
Disallow: /checkout/
Disallow: /login/
Disallow: /register/

# Allow important pages
Allow: /products/
Allow: /categories/
Allow: /about/
Allow: /contact/
Allow: /delivery/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
