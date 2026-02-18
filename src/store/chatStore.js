import { create } from 'zustand'
import { chatAPI } from '../services/chatService'
import { socketManager } from '../utils/socket'

export const useChatStore = create((set, get) => ({
  users: [],
  groups: [],
  messages: [],
  selectedUser: null,
  selectedGroup: null,
  onlineUsers: new Set(),
  conversations: {}, // Map of userId -> {unread_count, last_message}
  typingUsers: [], // Array of users currently typing

  setUsers: (users) => set({ users }),
  setGroups: (groups) => set({ groups }),

  setConversations: (conversations) => {
    // Convert array to map for easy lookup
    const conversationsMap = {}
    conversations.forEach(conv => {
      conversationsMap[conv.user_id] = {
        unread_count: conv.unread_count,
        last_message: conv.last_message
      }
    })
    set({ conversations: conversationsMap })
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user, selectedGroup: null })
    // Clear messages when switching
    set({ messages: [] })
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group, selectedUser: null })
    // Clear messages when switching
    set({ messages: [] })
    // Join group socket room
    if (group) {
      const groupId = group._id || group.id
      socketManager.joinGroup(groupId)
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  setMessages: (messages) => set({ messages }),

  updateOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) })
  },

  addOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.add(userId)
      return { onlineUsers: newSet }
    })
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.delete(userId)
      return { onlineUsers: newSet }
    })
  },

  clearChat: () => {
    set({
      selectedUser: null,
      selectedGroup: null,
      messages: [],
    })
  },

  // Clear all chat data (used on logout)
  clearAllChatData: () => {
    set({
      users: [],
      groups: [],
      messages: [],
      selectedUser: null,
      selectedGroup: null,
      onlineUsers: new Set(),
      conversations: {},
      typingUsers: [],
    })
  },

  setTypingUsers: (users) => set({ typingUsers: users }),
  
  addTypingUser: (user) => {
    set((state) => {
      const exists = state.typingUsers.some(u => (u.id || u._id) === (user.id || user._id))
      if (exists) return state
      return { typingUsers: [...state.typingUsers, user] }
    })
  },

  removeTypingUser: (userId) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(u => (u.id || u._id) !== userId)
    }))
  },
}))
