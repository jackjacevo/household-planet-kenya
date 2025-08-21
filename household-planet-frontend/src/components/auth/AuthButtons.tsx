'use client'

import Link from 'next/link'

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
      >
        Login
      </Link>
      
      <Link
        href="/register"
        className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  )
}