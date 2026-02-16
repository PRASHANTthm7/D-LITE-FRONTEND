import axios from 'axios'

const API_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8001'

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

export const chatAPI = {
  // Messages
  sendMessage: async (senderId, receiverId, content, groupId = null, expiresAt = null) => {
    const response = await api.post('/api/messages', {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      group_id: groupId,
      expires_at: expiresAt,
    })
    return response.data
  },

  getMessages: async (user1Id, user2Id, limit = 100, skip = 0) => {
    const response = await api.get(`/api/messages/${user1Id}/${user2Id}`, {
      params: { limit, skip },
    })
    return response.data
  },

  getGroupMessages: async (groupId, limit = 100, skip = 0) => {
    const response = await api.get(`/api/groups/${groupId}/messages`, {
      params: { limit, skip },
    })
    return response.data
  },

  // Users
  getUsers: async () => {
    const response = await api.get('/api/users')
    return response.data
  },

  getUser: async (userId) => {
    const response = await api.get(`/api/users/${userId}`)
    return response.data
  },

  getConversations: async (userId) => {
    const response = await api.get(`/api/conversations/${userId}`)
    return response.data
  },

  markMessageAsRead: async (messageId) => {
    const response = await api.patch(`/api/messages/${messageId}/read`)
    return response.data
  },

  // Groups
  createGroup: async (groupName, members, createdBy) => {
    const response = await api.post('/api/groups', {
      group_name: groupName,
      members,
      created_by: createdBy,
    })
    return response.data
  },

  getUserGroups: async (userId) => {
    const response = await api.get(`/api/groups/${userId}`)
    return response.data
  },

  getGroup: async (groupId) => {
    const response = await api.get(`/api/groups/detail/${groupId}`)
    return response.data
  },

  addGroupMember: async (groupId, userId) => {
    const response = await api.post(`/api/groups/${groupId}/members`, {
      user_id: userId,
    })
    return response.data
  },

  removeGroupMember: async (groupId, userId) => {
    const response = await api.delete(`/api/groups/${groupId}/members/${userId}`)
    return response.data
  },
}

export default chatAPI
