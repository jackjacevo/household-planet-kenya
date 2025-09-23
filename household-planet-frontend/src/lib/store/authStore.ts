import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api';
import { API_CONFIG } from '../config';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  validateToken: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  logoutAllSessions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await api.login(email, password);
          
          if (data.access_token && data.user) {
            const token = data.access_token;
            const refreshToken = data.refresh_token;
            const user = data.user;
            
            // Store tokens and create session
            localStorage.setItem('token', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            
            // Import and start session manager
            import('../session-manager').then(({ sessionManager }) => {
              sessionManager.init();
            });
            
            set({
              user,
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Destroy session
        import('../session-manager').then(({ sessionManager }) => {
          sessionManager.destroy();
        });
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      validateToken: async () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return response.ok;
        } catch {
          return false;
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (response.ok) {
            const data = await response.json();
            const newToken = data.access_token;
            
            localStorage.setItem('token', newToken);
            set({ token: newToken });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      logoutAllSessions: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch(`${API_CONFIG.BASE_URL}/api/auth/session`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch {}
        }
        get().logout();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          import('../session-manager').then(({ sessionManager }) => {
            sessionManager.init();
          });
        }
      },
    }
  )
);