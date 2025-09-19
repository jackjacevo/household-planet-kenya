'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser().then(() => {
        // Sync backend data to local state on app load
        const { syncWithBackend: syncCart } = useCart.getState();
        const { syncWithBackend: syncWishlist } = useWishlist.getState();
        
        Promise.all([
          syncCart(),
          syncWishlist()
        ]).catch(error => {
          console.warn('Failed to sync backend data on load:', error);
        });
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.getUserProfile();
      setUser((response as any).user || null);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    
    if ((response as any).token) {
      localStorage.setItem('token', (response as any).token);
      setUser((response as any).user);
      
      // Sync local cart and wishlist with backend
      const { syncLocalToBackend: syncCart } = useCart.getState();
      const { syncLocalToBackend: syncWishlist } = useWishlist.getState();
      
      try {
        await Promise.all([
          syncCart(),
          syncWishlist()
        ]);
      } catch (error) {
        console.warn('Failed to sync local data on login:', error);
      }
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    const response = await api.register(data);
    
    if ((response as any).token) {
      localStorage.setItem('token', (response as any).token);
      setUser((response as any).user);
      
      // Sync local cart and wishlist with backend
      const { syncLocalToBackend: syncCart } = useCart.getState();
      const { syncLocalToBackend: syncWishlist } = useWishlist.getState();
      
      try {
        await Promise.all([
          syncCart(),
          syncWishlist()
        ]);
      } catch (error) {
        console.warn('Failed to sync local data on register:', error);
      }
    }
  };

  const logout = async () => {
    try {
      // No logout endpoint in current API, just clear local storage
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    // For now, just update local state - in a real implementation, you would call the API
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
