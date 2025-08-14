import { Metadata } from 'next';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
}

export function generateMetadata(data: SEOData): Metadata {
  const baseUrl = 'https://householdplanet.co.ke';
  const defaultTitle = 'Household Planet Kenya - Premium Home Essentials';
  const defaultDescription = 'Shop premium household essentials across Kenya. Quality products, fast delivery, and exceptional service for your home.';
  
  const title = data.title ? `${data.title} | Household Planet Kenya` : defaultTitle;
  const description = data.description || defaultDescription;
  const url = data.url ? `${baseUrl}${data.url}` : baseUrl;
  const image = data.image ? `${baseUrl}${data.image}` : `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    keywords: data.keywords || 'household items Kenya, home essentials, kitchen appliances, cleaning supplies',
    openGraph: {
      title,
      description,
      url,
      siteName: 'Household Planet Kenya',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'en_KE',
      type: data.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img: string) => `https://householdplanet.co.ke${img}`),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Household Planet Kenya',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KES',
      availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Household Planet Kenya',
      },
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://householdplanet.co.ke${item.url}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Household Planet Kenya',
    url: 'https://householdplanet.co.ke',
    logo: 'https://householdplanet.co.ke/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-700-000-000',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi, Kenya',
      addressCountry: 'KE',
    },
    sameAs: [
      'https://facebook.com/householdplanetkenya',
      'https://twitter.com/householdplanetke',
      'https://instagram.com/householdplanetkenya',
    ],
  };
}