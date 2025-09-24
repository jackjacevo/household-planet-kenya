'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

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
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (token) {
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
      const userData = response.user || response
      setUser(userData)
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart-storage')
        localStorage.removeItem('wishlist-storage')
        localStorage.removeItem('guestCart')
        localStorage.removeItem('checkoutData')
      }
      
      const response = await api.login(email, password) as any
      const token = response.accessToken || response.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
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
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('wishlist-storage')
      localStorage.removeItem('guestCart')
      localStorage.removeItem('checkoutData')
    }
    
    setUser(null)
  }

  const updateProfile = async (data: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    return user?.role === 'ADMIN' || user?.role === 'admin' || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin'
  }

  const isStaff = () => {
    return user?.role === 'STAFF' || user?.role === 'staff' || isAdmin()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      updateProfile, 
      updateUser, 
      isAdmin, 
      isStaff, 
      fetchUserProfile 
    }}>
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