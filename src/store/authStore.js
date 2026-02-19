import { create } from 'zustand'
import { authAPI } from '../services/authService'
import { socketManager } from '../utils/socket'
import { useChatStore } from './chatStore'

// Helper to safely get token from localStorage
const getStoredToken = () => {
  try {
    return localStorage.getItem('token') || null
  } catch (error) {
    console.warn('Error reading token from localStorage:', error)
    return null
  }
}

export const useAuthStore = create((set, get) => {
  const storedToken = getStoredToken()
  return {
    user: null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,

    login: async (email, password) => {
      set({ loading: true, error: null })
      try {
        const data = await authAPI.login(email, password)
        localStorage.setItem('token', data.token)
        
        // Initialize socket connection with JWT token
        try {
          await socketManager.connect(data.token)
          console.log('[Auth] Socket initialized after login')
        } catch (socketError) {
          console.warn('[Auth] Socket connection failed, but auth succeeded:', socketError)
        }
        
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true, 
          loading: false,
          error: null
        })
        return data
      } catch (error) {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Login failed' 
        })
        throw error
      }
    },

    register: async (username, email, password) => {
      set({ loading: true, error: null })
      try {
        const data = await authAPI.register(username, email, password)
        localStorage.setItem('token', data.token)
        
        // Initialize socket connection with JWT token
        try {
          await socketManager.connect(data.token)
          console.log('[Auth] Socket initialized after registration')
        } catch (socketError) {
          console.warn('[Auth] Socket connection failed, but registration succeeded:', socketError)
        }
        
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true, 
          loading: false,
          error: null
        })
        return data
      } catch (error) {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Registration failed' 
        })
        throw error
      }
    },

    logout: () => {
      // Clear localStorage FIRST (synchronously) to prevent restore on refresh
      localStorage.removeItem('token')
      
      // Disconnect socket before clearing state
      socketManager.disconnect()
      
      // Clear chat store data on logout
      try {
        useChatStore.getState().clearAllChatData()
      } catch (err) {
        console.warn('Could not clear chat store on logout:', err)
      }
      
      // Clear state immediately
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null
      })
      
      // Force a page reload to ensure clean state
      // This prevents any race conditions or stale state
      window.location.href = '/'
    },

    clearError: () => set({ error: null }),

    // Initialize user from token
    initAuth: async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        // Explicitly set unauthenticated state if no token
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
        return
      }
      
      try {
        const data = await authAPI.verifyToken()
        set({ 
          user: data.user, 
          token, 
          isAuthenticated: true 
        })
        // Connect socket if authenticated
        try {
          await socketManager.connect(token)
        } catch (error) {
          console.warn('[Auth] Socket connection failed on init:', error)
        }
      } catch (error) {
        // Token is invalid or expired - clear everything
        localStorage.removeItem('token')
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      }
    }
  }
})
