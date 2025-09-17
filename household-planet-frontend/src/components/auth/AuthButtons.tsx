'use client'

import Link from 'next/link'

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-3 whitespace-nowrap">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
      >
        Login
      </Link>
      
      <Link
        href="/register"
        className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  )
}
