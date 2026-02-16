import { create } from 'zustand'
import identityService from '../services/identityService'

const useIdentityStore = create((set, get) => ({
  identity: null,
  loading: false,
  error: null,

  fetchIdentity: async (userId) => {
    set({ loading: true, error: null })
    try {
      const response = await identityService.getIdentity(userId)
      if (response.success) {
        set({
          identity: response.data,
          loading: false,
        })
        return response.data
      }
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch identity',
        loading: false,
      })
      console.error('Fetch identity error:', error)
    }
  },

  updateAvatar: async (userId, avatarUrl) => {
    try {
      const response = await identityService.updateAvatar(userId, avatarUrl)
      if (response.success) {
        set({ identity: response.data })
        return response.data
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update avatar' })
      throw error
    }
  },

  updateBadges: async (userId, badges) => {
    try {
      const response = await identityService.updateBadges(userId, badges)
      if (response.success) {
        set({ identity: response.data })
        return response.data
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update badges' })
      throw error
    }
  },

  updateStatus: async (userId, statusIcon) => {
    try {
      const response = await identityService.updateStatus(userId, statusIcon)
      if (response.success) {
        set({ identity: response.data })
        return response.data
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update status' })
      throw error
    }
  },

  updateTheme: async (userId, theme) => {
    try {
      const response = await identityService.updateTheme(userId, theme)
      if (response.success) {
        set({ identity: response.data })
        return response.data
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update theme' })
      throw error
    }
  },

  updateRoleStyle: async (userId, roleStyle) => {
    try {
      const response = await identityService.updateRoleStyle(userId, roleStyle)
      if (response.success) {
        set({ identity: response.data })
        return response.data
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update role style' })
      throw error
    }
  },

  applyTheme: () => {
    const { identity } = get()
    if (identity?.themeTokens) {
      // Apply theme tokens to document
      const root = document.documentElement
      Object.entries(identity.themeTokens).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    }
  },
}))

export default useIdentityStore
