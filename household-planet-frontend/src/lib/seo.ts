import { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  category?: string
  price?: number
  currency?: string
  availability?: 'in_stock' | 'out_of_stock' | 'preorder'
  brand?: string
  condition?: 'new' | 'used' | 'refurbished'
  rating?: number
  reviewCount?: number
}

const defaultConfig = {
  siteName: 'Household Planet Kenya',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanetkenya.co.ke',
  defaultTitle: 'Household Planet Kenya - Quality Home Products & Appliances',
  defaultDescription: 'Shop quality household items, kitchen appliances, home decor, and more at Household Planet Kenya. Fast delivery across Kenya with secure payment options.',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@HouseholdPlanetKE',
  facebookPage: 'HouseholdPlanetKenya',
  instagramHandle: '@householdplanetke'
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = defaultConfig.defaultDescription,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    category,
    price,
    currency = 'KES',
    availability,
    brand,
    condition = 'new',
    rating,
    reviewCount
  } = config

  const fullTitle = title 
    ? `${title} | ${defaultConfig.siteName}`
    : defaultConfig.defaultTitle

  const fullUrl = url 
    ? `${defaultConfig.siteUrl}${url}`
    : defaultConfig.siteUrl

  const fullImage = image.startsWith('http') 
    ? image 
    : `${defaultConfig.siteUrl}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    category,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || defaultConfig.defaultTitle,
        }
      ],
      locale: 'en_KE',
      type: type as any,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: defaultConfig.twitterHandle,
      site: defaultConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  }

  return metadata
}

export function generateProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img: any) => img.url) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || defaultConfig.siteName
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KES',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: defaultConfig.siteName
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    category: product.category?.name,
    sku: product.sku,
    gtin: product.gtin,
    condition: 'https://schema.org/NewCondition'
  }
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${defaultConfig.siteUrl}${crumb.url}`
    }))
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultConfig.siteName,
    url: defaultConfig.siteUrl,
    logo: `${defaultConfig.siteUrl}/images/logo.png`,
    description: defaultConfig.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi CBD',
      addressLocality: 'Nairobi',
      addressCountry: 'KE'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-700-000-000',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili']
    },
    sameAs: [
      `https://facebook.com/${defaultConfig.facebookPage}`,
      `https://twitter.com/${defaultConfig.twitterHandle}`,
      `https://instagram.com/${defaultConfig.instagramHandle}`
    ]
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultConfig.siteName,
    url: defaultConfig.siteUrl,
    description: defaultConfig.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${defaultConfig.siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

export function generateReviewSchema(reviews: any[]) {
  return reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    author: {
      '@type': 'Person',
      name: review.user?.name || 'Anonymous'
    },
    reviewBody: review.comment,
    datePublished: review.createdAt
  }))
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${defaultConfig.siteUrl}/#business`,
    name: defaultConfig.siteName,
    description: defaultConfig.defaultDescription,
    url: defaultConfig.siteUrl,
    telephone: '+254-790-227-760',
    email: 'householdplanet819@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Iconic Business Plaza, Basement Shop B10, Moi Avenue',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      addressCountry: 'KE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2864107990637,
      longitude: 36.82194731475394
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '09:00',
        closes: '16:00'
      }
    ],
    priceRange: 'KES 100 - KES 100,000',
    paymentAccepted: ['Cash', 'M-Pesa', 'Credit Card'],
    currenciesAccepted: 'KES',
    areaServed: {
      '@type': 'Country',
      name: 'Kenya'
    }
  }
}

export function generateArticleSchema(article: {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime?: string
  image?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || defaultConfig.defaultImage,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: defaultConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultConfig.siteUrl}/images/logo.png`
      }
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    url: `${defaultConfig.siteUrl}${article.url}`
  }
}

export function generateCollectionPageSchema(collection: {
  name: string
  description: string
  url: string
  items: any[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: `${defaultConfig.siteUrl}${collection.url}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.items.length,
      itemListElement: collection.items.slice(0, 10).map((item, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: item.name,
        url: `${defaultConfig.siteUrl}/products/${item.slug}`,
        image: item.images?.[0]?.url,
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'KES'
        }
      }))
    }
  }
}
