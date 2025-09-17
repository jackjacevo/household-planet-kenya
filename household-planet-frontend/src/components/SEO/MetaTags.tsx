import { SEOConfig } from '@/lib/seo'

interface MetaTagsProps extends SEOConfig {}

// Legacy component for backward compatibility - no longer needed with App Router
export function MetaTags(props: MetaTagsProps) {
  return null
}
