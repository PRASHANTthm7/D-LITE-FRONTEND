import axios from 'axios'

const API_URL = import.meta.env.VITE_IDENTITY_SERVICE_URL || 'http://localhost:3003'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const identityService = {
  getIdentity: async (userId) => {
    const response = await api.get(`/${userId}`)
    return response.data
  },

  updateAvatar: async (userId, avatarUrl) => {
    const response = await api.put(`/avatar`, {
      user_id: userId,
      avatar_url: avatarUrl,
    })
    return response.data
  },

  updateBadges: async (userId, badges) => {
    const response = await api.put(`/badges`, {
      user_id: userId,
      badges,
    })
    return response.data
  },

  updateStatus: async (userId, statusIcon) => {
    const response = await api.put(`/status`, {
      user_id: userId,
      status_icon: statusIcon,
    })
    return response.data
  },

  updateTheme: async (userId, theme) => {
    const response = await api.put(`/theme`, {
      user_id: userId,
      theme,
    })
    return response.data
  },

  updateRoleStyle: async (userId, roleStyle) => {
    const response = await api.put(`/role-style`, {
      user_id: userId,
      role_style: roleStyle,
    })
    return response.data
  },
}

export default identityService
