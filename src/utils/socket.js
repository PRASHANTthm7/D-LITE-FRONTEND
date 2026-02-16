import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(token) {
    if (this.socket?.connected) {
      return Promise.resolve()
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_GATEWAY_URL || 'http://localhost:3002'

    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      })

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to server')
        this.isConnected = true
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason)
        this.isConnected = false
        this.cleanupListeners()
      })

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error)
        this.reconnectAttempts++
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error)
        }
      })

      this.socket.on('error', (error) => {
        console.error('[Socket] Error:', error)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.cleanupListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  isSocketConnected() {
    return this.socket?.connected || false
  }

  // Setup presence tracking
  setupPresenceTracking(callbacks) {
    if (!this.socket) return null

    const {
      onOnlineUsersUpdate,
      onUserConnected,
      onUserDisconnected,
      onUserTyping,
      onUserStoppedTyping,
    } = callbacks || {}

    // Online users update
    if (onOnlineUsersUpdate) {
      this.socket.on('online_users', (userIds) => {
        onOnlineUsersUpdate(userIds)
      })
    }

    // User connected
    if (onUserConnected) {
      this.socket.on('user_connected', (data) => {
        onUserConnected(data.userId || data)
      })
    }

    // User disconnected
    if (onUserDisconnected) {
      this.socket.on('user_disconnected', (data) => {
        onUserDisconnected(data.userId || data)
      })
    }

    // Typing events
    if (onUserTyping) {
      this.socket.on('user_typing', (data) => {
        onUserTyping(data.userId || data)
      })
    }

    if (onUserStoppedTyping) {
      this.socket.on('user_stopped_typing', (data) => {
        onUserStoppedTyping(data.userId || data)
      })
    }

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off('online_users')
        this.socket.off('user_connected')
        this.socket.off('user_disconnected')
        this.socket.off('user_typing')
        this.socket.off('user_stopped_typing')
      }
    }
  }

  // Message events
  onMessage(callback) {
    if (!this.socket) return
    this.socket.on('receive_message', callback)
    this.listeners.set('receive_message', callback)
  }

  offMessage(callback) {
    if (!this.socket) return
    this.socket.off('receive_message', callback)
    this.listeners.delete('receive_message')
  }

  // Send message
  sendMessage(messageData) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('send_message', messageData)
  }

  // Join group
  joinGroup(groupId) {
    if (!this.socket || !this.isConnected) return
    this.socket.emit('join_group', { group_id: groupId })
  }

  // Leave group
  leaveGroup(groupId) {
    if (!this.socket || !this.isConnected) return
    this.socket.emit('leave_group', { group_id: groupId })
  }

  // Typing indicator
  sendTyping(userId, groupId = null) {
    if (!this.socket || !this.isConnected) return
    const data = groupId ? { group_id: groupId } : { receiver_id: userId }
    this.socket.emit('typing', data)
  }

  sendStopTyping(userId, groupId = null) {
    if (!this.socket || !this.isConnected) return
    const data = groupId ? { group_id: groupId } : { receiver_id: userId }
    this.socket.emit('stop_typing', data)
  }

  // Cleanup all listeners
  cleanupListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback)
      })
      this.listeners.clear()
    }
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket
  }
}

export const socketManager = new SocketManager()
export default socketManager
