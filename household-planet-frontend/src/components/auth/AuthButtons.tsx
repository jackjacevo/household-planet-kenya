'use client'

import Link from 'next/link'
import { User, UserPlus } from 'lucide-react'

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-3 whitespace-nowrap">
      <Link
        href="/login"
        className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
      >
        <User className="h-4 w-4" />
        <span>Login</span>
      </Link>

      <Link
        href="/register"
        className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span>Sign Up</span>
      </Link>
    </div>
  )
}
