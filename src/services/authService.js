import axios from 'axios'
import logger from '../utils/logger'
import { handleApiError, retryWithBackoff } from '../utils/apiErrorHandler'

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
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

// Error response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = handleApiError(error, 'Auth Service')
    return Promise.reject(errorInfo)
  }
)

export const authAPI = {
  register: async (username, email, password) => {
    try {
      logger.info('Attempting user registration', { username, email })
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
      })
      logger.info('Registration successful', { userId: response.data?.user?.id })
      return response.data
    } catch (error) {
      logger.error('Registration failed', { error: error.message })
      throw error
    }
  },

  login: async (email, password) => {
    try {
      logger.info('Attempting login', { email })
      const response = await api.post('/api/auth/login', {
        email,
        password,
      })
      logger.info('Login successful', { userId: response.data?.user?.id })
      return response.data
    } catch (error) {
      logger.error('Login failed', { error: error.message })
      throw error
    }
  },

  verifyToken: async () => {
    try {
      logger.debug('Verifying token')
      const response = await api.get('/api/auth/verify')
      return response.data
    } catch (error) {
      logger.warn('Token verification failed', { error: error.message })
      throw error
    }
  },

  logout: async () => {
    try {
      logger.info('Logging out')
      const response = await api.post('/api/auth/logout')
      return response.data
    } catch (error) {
      logger.error('Logout failed', { error: error.message })
      throw error
    }
  },

  getProfile: async () => {
    try {
      logger.debug('Fetching user profile')
      const response = await api.get('/api/auth/profile')
      return response.data
    } catch (error) {
      logger.error('Failed to fetch profile', { error: error.message })
      throw error
    }
  },

  getUsers: async () => {
    try {
      logger.debug('Fetching users')
      const response = await api.get('/api/users')
      return response.data
    } catch (error) {
      logger.error('Failed to fetch users', { error: error.message })
      throw error
    }
  },

  getUser: async (userId) => {
    try {
      logger.debug('Fetching user', { userId })
      const response = await api.get(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      logger.error('Failed to fetch user', { userId, error: error.message })
      throw error
    }
  },

  searchUsers: async (query) => {
    try {
      logger.debug('Searching users', { query })
      const response = await api.get('/api/users/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      logger.error('Failed to search users', { query, error: error.message })
      throw error
    }
  }
}

export default authAPI
