import axios from 'axios'

const API_URL = import.meta.env.VITE_QUANTUM_ROOM_ENGINE_URL || 'http://localhost:3004'

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

const quantumRoomService = {
  getRoomAura: async (roomId) => {
    try {
      const response = await api.get(`/aura/${roomId}`)
      return response.data
    } catch (error) {
      console.error('quantum room aura error:', error)
      return null
    }
  },

  getRoomSoul: async (roomId) => {
    try {
      const response = await api.get(`/soul/${roomId}`)
      return response.data
    } catch (error) {
      console.error('quantum room soul error:', error)
      return null
    }
  },

  getEnergyWave: async (roomId) => {
    try {
      const response = await api.get(`/insight/${roomId}`)
      return response.data
    } catch (error) {
      console.error('quantum energy wave error:', error)
      return null
    }
  },
}

export default quantumRoomService
