import axios from 'axios'

const API_URL = import.meta.env.VITE_PRESENCE_ENGINE_URL || 'http://localhost:8003'

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

export const presenceAPI = {
  getUserPresence: async (userId) => {
    const response = await api.get(`/presence/${userId}`)
    return response.data
  },

  getAllActivePresence: async () => {
    const response = await api.get('/presence/all-active')
    return response.data
  },

  setFocusMode: async (enabled) => {
    const response = await api.put('/presence/focus-mode', {
      enabled,
    })
    return response.data
  },

  setInvisibleMode: async (enabled) => {
    const response = await api.put('/presence/invisible', {
      enabled,
    })
    return response.data
  },
}

export default presenceAPI
