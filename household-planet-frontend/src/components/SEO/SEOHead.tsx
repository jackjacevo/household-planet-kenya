import { MetaTags } from './MetaTags'
import { StructuredData } from './StructuredData'
import { SEOConfig } from '@/lib/seo'

interface SEOHeadProps extends SEOConfig {
  structuredData?: object | object[]
}

export function SEOHead({ structuredData, ...seoConfig }: SEOHeadProps) {
  return (
    <>
      <MetaTags {...seoConfig} />
      {structuredData && <StructuredData data={structuredData} />}
    </>
  )
}