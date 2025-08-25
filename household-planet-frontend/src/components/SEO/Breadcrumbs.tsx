'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { StructuredData } from './StructuredData'
import { generateBreadcrumbSchema } from '@/lib/seo'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', url: '/' }, ...items]
  const schema = generateBreadcrumbSchema(allItems)

  return (
    <>
      <StructuredData data={schema} />
      <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {index === allItems.length - 1 ? (
                <span className="text-gray-600 font-medium flex items-center">
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-orange-600 hover:text-orange-700 transition-colors flex items-center"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}