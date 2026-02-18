import { create } from 'zustand'
import { authAPI } from '../services/authService'
import { socketManager } from '../utils/socket'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
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
    // Disconnect socket before logout
    socketManager.disconnect()
    localStorage.removeItem('token')
    
    // Clear chat store data on logout
    // Import chatStore dynamically to avoid circular dependency
    import('./chatStore').then((module) => {
      module.useChatStore.getState().clearAllChatData()
    }).catch(err => {
      console.warn('Could not clear chat store on logout:', err)
    })
    
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      error: null
    })
  },

  clearError: () => set({ error: null }),

  // Initialize user from token
  initAuth: async () => {
    const token = localStorage.getItem('token')
    if (token) {
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
        localStorage.removeItem('token')
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      }
    }
  }
}))
