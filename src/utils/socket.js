import { io } from 'socket.io-client'
import logger from './logger'
import { SERVICE_CONFIG } from '../config/serviceConfig'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.connectingPromise = null // Track ongoing connection
    this.presenceTrackingSetup = false // Prevent duplicate setup
  }

  connect(token) {
    // If already connected, return resolved promise
    if (this.socket?.connected && this.isConnected) {
      logger.debug('Socket already connected')
      return Promise.resolve()
    }

    // If already connecting, return the existing promise
    if (this.connectingPromise) {
      logger.debug('Connection already in progress')
      return this.connectingPromise
    }

    // Use service config for socket gateway URL
    const SOCKET_URL = SERVICE_CONFIG.socket.baseURL

    // Create connection promise with timeout
    this.connectingPromise = new Promise((resolve, reject) => {
      let connectionTimeout
      let connectErrorHandler
      let connectHandler
      let disconnectHandler
      let errorHandler
      let hasResolved = false

      // Set timeout for connection
      connectionTimeout = setTimeout(() => {
        if (!this.socket?.connected && !hasResolved) {
          logger.error('Socket connection timeout')
          this.cleanupSocket()
          this.connectingPromise = null
          hasResolved = true
          reject(new Error('Connection timeout: Unable to connect to socket server'))
        }
      }, SERVICE_CONFIG.socket.options.timeout || 20000)

      try {
        // Cleanup existing socket if any
        if (this.socket && !this.socket.connected) {
          logger.debug('Cleaning up existing socket before reconnecting')
          this.cleanupSocket()
        }

        logger.info('Connecting to Socket Gateway', { url: SOCKET_URL })
        
        // Disable socket.io's automatic reconnection during initial connection
        // We'll handle reconnection manually
        this.socket = io(SOCKET_URL, {
          auth: { token },
          transports: SERVICE_CONFIG.socket.options.transports || ['websocket', 'polling'],
          reconnection: false, // Disable automatic reconnection during initial connect
          timeout: SERVICE_CONFIG.socket.options.timeout || 20000,
        })

        // Connection successful
        connectHandler = () => {
          if (hasResolved) return
          clearTimeout(connectionTimeout)
          logger.info('Socket connected successfully')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.connectingPromise = null
          hasResolved = true
          
          // Re-enable reconnection after successful connection
          this.socket.io.reconnection(true)
          this.socket.io.reconnectionAttempts(this.maxReconnectAttempts)
          this.socket.io.reconnectionDelay(SERVICE_CONFIG.socket.options.reconnectionDelay || 1000)
          this.socket.io.reconnectionDelayMax(SERVICE_CONFIG.socket.options.reconnectionDelayMax || 5000)
          
          // Handle reconnection events
          this.socket.on('reconnect', (attemptNumber) => {
            logger.info('Socket reconnected', { attemptNumber })
            this.isConnected = true
            this.reconnectAttempts = 0
          })
          
          this.socket.on('reconnect_attempt', (attemptNumber) => {
            logger.debug('Socket reconnection attempt', { attemptNumber })
          })
          
          this.socket.on('reconnect_error', (error) => {
            logger.warn('Socket reconnection error', { error: error.message })
          })
          
          this.socket.on('reconnect_failed', () => {
            logger.error('Socket reconnection failed - max attempts reached')
            this.isConnected = false
          })
          
          resolve()
        }

        // Connection error - only fire once per connection attempt
        connectErrorHandler = (error) => {
          if (hasResolved) return
          logger.warn('Socket connection error', { error: error.message })
          this.reconnectAttempts++
          
          // Only reject after max attempts
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            clearTimeout(connectionTimeout)
            logger.error('Max reconnection attempts reached')
            this.connectingPromise = null
            hasResolved = true
            reject(error)
          }
        }

        // Disconnect handler
        disconnectHandler = (reason) => {
          logger.warn('Socket disconnected', { reason })
          this.isConnected = false
          // Don't cleanup listeners on disconnect - socket.io will reconnect
          // Only cleanup if it's a manual disconnect or during initial connection
          if (this.connectingPromise && !hasResolved) {
            this.connectingPromise = null
            hasResolved = true
            clearTimeout(connectionTimeout)
            reject(new Error(`Connection lost: ${reason}`))
          }
        }

        // General error handler
        errorHandler = (error) => {
          logger.error('Socket error', { error: error?.message || String(error) })
        }

        // Attach event listeners
        this.socket.once('connect', connectHandler)
        this.socket.once('connect_error', connectErrorHandler)
        this.socket.on('disconnect', disconnectHandler)
        this.socket.on('error', errorHandler)

      } catch (error) {
        clearTimeout(connectionTimeout)
        logger.error('Failed to initialize socket connection', { error: error.message })
        this.connectingPromise = null
        reject(error)
      }
    })

    return this.connectingPromise
  }

  // Helper to cleanup socket
  cleanupSocket() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.connectingPromise = null
  }

  disconnect() {
    try {
      if (this.socket) {
        logger.info('Disconnecting socket')
        this.cleanupSocket()
        this.presenceTrackingSetup = false
      }
    } catch (error) {
      logger.error('Error during socket disconnect', { error: error.message })
    }
  }

  isSocketConnected() {
    // Check actual socket state first, then our flag
    const actuallyConnected = this.socket?.connected === true
    // Sync our flag with actual state
    if (actuallyConnected && !this.isConnected) {
      this.isConnected = true
    } else if (!actuallyConnected && this.isConnected) {
      this.isConnected = false
    }
    return actuallyConnected && this.isConnected
  }

  // Setup presence tracking
  setupPresenceTracking(callbacks) {
    if (!this.socket) return null

    // Prevent duplicate setup
    if (this.presenceTrackingSetup) {
      logger.warn('Presence tracking already setup, skipping duplicate setup')
      return null
    }

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

    this.presenceTrackingSetup = true

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off('online_users')
        this.socket.off('user_connected')
        this.socket.off('user_disconnected')
        this.socket.off('user_typing')
        this.socket.off('user_stopped_typing')
      }
      this.presenceTrackingSetup = false
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
    if (callback) {
      this.socket.off('receive_message', callback)
    } else {
      const existing = this.listeners.get('receive_message')
      if (existing) {
        this.socket.off('receive_message', existing)
      } else {
        this.socket.off('receive_message')
      }
    }
    this.listeners.delete('receive_message')
  }

  // Send message
  sendMessage(messageData) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket not connected')
    }
    this.socket.emit('send_message', messageData)
  }

  // Join group
  joinGroup(groupId) {
    if (!this.socket || !this.socket.connected) return
    this.socket.emit('join_group', { group_id: groupId })
  }

  // Leave group
  leaveGroup(groupId) {
    if (!this.socket || !this.socket.connected) return
    this.socket.emit('leave_group', { group_id: groupId })
  }

  // Typing indicator
  sendTyping(userId, groupId = null) {
    if (!this.socket || !this.socket.connected) return
    const data = groupId ? { group_id: groupId } : { receiver_id: userId }
    this.socket.emit('typing', data)
  }

  sendStopTyping(userId, groupId = null) {
    if (!this.socket || !this.socket.connected) return
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
