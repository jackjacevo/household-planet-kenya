'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

interface User {
  id: number
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  role: string
  avatar?: string
  emailVerified: boolean
  phoneVerified: boolean
  permissions?: string[]
  notificationSettings?: any
  privacySettings?: any
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  loading: boolean
  updateProfile: (data: any) => Promise<void>
  updateUser: (userData: User) => void
  isAdmin: () => boolean
  isStaff: () => boolean
  hasPermission: (permission: string) => boolean
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Check if token is expired before making API call
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = payload.exp * 1000 < Date.now()
        
        if (isExpired) {
          localStorage.removeItem('token')
          setUser(null)
          setLoading(false)
        } else {
          fetchUserProfile()
        }
      } catch (error) {
        // Invalid token format
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUserProfile() as any
      // Handle both direct user object and wrapped response
      const userData = response.user || response
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Clear any existing user data first
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('wishlist-storage')
      localStorage.removeItem('guestCart')
      localStorage.removeItem('checkoutData')
      useCart.getState().clearOnLogout()
      useWishlist.getState().clearOnLogout()
      
      const response = await api.login(email, password) as any
      const token = response.accessToken || response.access_token
      localStorage.setItem('token', token)
      setUser(response.user)
      setLoading(false)
      return response
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await api.register(userData) as any
      // Registration successful, but user needs to verify email
      // Don't log them in automatically, redirect to login with success message
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('cart-storage')
    localStorage.removeItem('wishlist-storage')
    localStorage.removeItem('guestCart')
    localStorage.removeItem('checkoutData')
    
    // Clear cart and wishlist state
    useCart.getState().clearOnLogout()
    useWishlist.getState().clearOnLogout()
    
    setUser(null)
  }

  const updateProfile = async (data: any) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
      }
    } catch (error) {
      throw error
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'admin'
  }

  const isStaff = () => {
    return user?.role === 'STAFF' || user?.role === 'staff'
  }

  const hasPermission = (permission: string) => {
    if (isAdmin()) return true
    return user?.permissions?.includes(permission) || false
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, updateUser, isAdmin, isStaff, hasPermission, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
