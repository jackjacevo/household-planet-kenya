'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Settings, ShoppingBag, Heart, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAdmin } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    setIsHovered(false)
  }

  const handleMenuClick = () => {
    setIsOpen(false)
    setIsHovered(false)
  }

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setIsHovered(false)
        }}
        className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {/* Hover tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-50 pointer-events-none">
          <p className="font-medium">{user.name}</p>
          <p className="text-gray-300">{user.email}</p>
          {user.phone && <p className="text-gray-300">{user.phone}</p>}
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm sm:text-base">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                {user.phone && <p className="text-xs text-gray-400 truncate">{user.phone}</p>}
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleMenuClick}
            >
              <User className="w-4 h-4 mr-3" />
              My Profile
            </Link>
            <Link
              href="/account"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleMenuClick}
            >
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleMenuClick}
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              My Orders
            </Link>
            <Link
              href="/track-order"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleMenuClick}
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              Track Order
            </Link>
            <Link
              href="/account/wishlist"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handleMenuClick}
            >
              <Heart className="w-4 h-4 mr-3" />
              Wishlist
            </Link>
          </div>

          {/* Admin section */}
          {user && isAdmin() && (
            <>
              <div className="border-t my-2"></div>
              <div className="py-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors font-medium"
                  onClick={handleMenuClick}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Admin Dashboard
                </Link>
              </div>
            </>
          )}

          {/* Logout section */}
          <div className="border-t pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
