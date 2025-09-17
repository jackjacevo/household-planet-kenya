import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
}

export function SEOHead({ 
  title = 'Household Planet Kenya',
  description = 'Quality household items delivered across Kenya',
  keywords = 'household, kenya, delivery, home, kitchen',
  ogImage = '/images/og-image.jpg',
  canonical
}: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  )
}

export default SEOHead