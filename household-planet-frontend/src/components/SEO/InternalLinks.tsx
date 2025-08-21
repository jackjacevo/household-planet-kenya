import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

interface InternalLink {
  title: string
  url: string
  description?: string
}

interface InternalLinksProps {
  title?: string
  links: InternalLink[]
  className?: string
}

export function InternalLinks({ 
  title = "Related Pages", 
  links, 
  className = "" 
}: InternalLinksProps) {
  if (!links.length) return null

  return (
    <div className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          {title}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            className="group flex items-center justify-between p-3 bg-white rounded-xl hover:bg-orange-50 transition-all duration-300 border border-gray-100 hover:border-orange-200"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                {link.title}
              </h4>
              {link.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {link.description}
                </p>
              )}
            </div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors ml-2 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}