import axios from 'axios'

const API_URL = import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8002'

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

const aiService = {
  analyzeMessage: async (text, userId) => {
    try {
      const response = await api.post('/ai/analyze-message', {
        text,
        userId,
      })
      return response.data
    } catch (error) {
      console.error('AI analysis error:', error)
      return null
    }
  },

  generateReplies: async (lastMessages, userIdentity) => {
    try {
      const response = await api.post('/ai/generate-replies', {
        lastMessages,
        userIdentity,
      })
      return response.data.suggestions || []
    } catch (error) {
      console.error('AI reply generation error:', error)
      return []
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await api.get(`/ai/profile/${userId}`)
      return response.data
    } catch (error) {
      console.error('AI profile error:', error)
      return null
    }
  },

  predictPresence: async (userId, activityHistory = []) => {
    try {
      const response = await api.post('/ai/predict-presence', {
        userId,
        activityHistory,
      })
      return response.data
    } catch (error) {
      console.error('AI presence prediction error:', error)
      return null
    }
  },
}

export default aiService
