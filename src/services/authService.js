import axios from 'axios'

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001'

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

export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    })
    return response.data
  },

  verifyToken: async () => {
    const response = await api.get('/api/auth/verify')
    return response.data
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile')
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/api/users')
    return response.data
  },

  getUser: async (userId) => {
    const response = await api.get(`/api/users/${userId}`)
    return response.data
  },

  searchUsers: async (query) => {
    const response = await api.get('/api/users/search', {
      params: { q: query }
    })
    return response.data
  },
}

export default authAPI
