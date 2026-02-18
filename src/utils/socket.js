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
    let SOCKET_URL = SERVICE_CONFIG.socket.baseURL

    // Normalize and validate the socket URL
    if (!SOCKET_URL) {
      logger.error('Socket Gateway URL is not configured')
      return Promise.reject(new Error('Socket Gateway URL is not configured'))
    }

    // Additional normalization in case envValidator didn't catch everything
    // Additional normalization: decode URL encoding and remove any remaining issues
    try {
      // Decode URL encoding (e.g., %20 -> space)
      SOCKET_URL = decodeURIComponent(SOCKET_URL);
    } catch (e) {
      // If decode fails, continue with original URL
      logger.warn('Failed to decode URL, using as-is', { url: SOCKET_URL });
    }
    
    // Remove all commas, spaces, URL-encoded characters, and trailing slashes
    SOCKET_URL = SOCKET_URL.trim()
      .replace(/[,\s%]+/g, '') // Remove commas, spaces, and % characters
      .replace(/%[0-9A-Fa-f]{2}/g, '') // Remove any remaining URL-encoded sequences
      .replace(/\/+$/, '') // Remove trailing slashes
    
    // Extract just the domain part (remove any path that might have been incorrectly included)
    // Match: protocol://domain:port or protocol://domain
    const urlMatch = SOCKET_URL.match(/^(https?:\/\/)?([^\/\s,]+)/);
    if (urlMatch) {
      const protocol = urlMatch[1] || '';
      const domain = urlMatch[2];
      SOCKET_URL = protocol + domain;
    }
    
    // Ensure URL has a protocol (fallback if envValidator didn't add it)
    if (!SOCKET_URL.match(/^https?:\/\//)) {
      // If no protocol, determine based on environment
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:' || 
                          import.meta.env.PROD || 
                          SOCKET_URL.includes('railway.app') ||
                          SOCKET_URL.includes('netlify.app') ||
                          SOCKET_URL.includes('vercel.app') ||
                          SOCKET_URL.includes('render.com')
      SOCKET_URL = `${isProduction ? 'https://' : 'http://'}${SOCKET_URL}`
    }

    // Log the normalized URL for debugging
    logger.info('Socket Gateway URL normalized', { 
      original: SERVICE_CONFIG.socket.baseURL, 
      normalized: SOCKET_URL 
    })

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

        logger.info('Connecting to Socket Gateway', { url: SOCKET_URL, hasToken: !!token, tokenLength: token?.length })
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/8f8a6f53-4334-40cc-9854-84abdce895fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'socket.js:59',message:'Socket connection attempt',data:{url:SOCKET_URL,hasToken:!!token,tokenLength:token?.length,tokenPreview:token?`${token.substring(0,10)}...${token.substring(token.length-5)}`:'missing'},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Disable socket.io's automatic reconnection during initial connection
        // We'll handle reconnection manually
        this.socket = io(SOCKET_URL, {
          path: '/socket.io', // Explicit path to match server configuration
          auth: { token },
          transports: SERVICE_CONFIG.socket.options.transports || ['websocket', 'polling'],
          reconnection: false, // Disable automatic reconnection during initial connect
          timeout: SERVICE_CONFIG.socket.options.timeout || 20000,
          forceNew: false, // Reuse existing connection if available
          withCredentials: true, // Important for CORS with credentials
        })

        // Connection successful
        connectHandler = () => {
          if (hasResolved) return
          clearTimeout(connectionTimeout)
          logger.info('Socket connected successfully')
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/8f8a6f53-4334-40cc-9854-84abdce895fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'socket.js:71',message:'Socket connected successfully',data:{socketId:this.socket?.id},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
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
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/8f8a6f53-4334-40cc-9854-84abdce895fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'socket.js:110',message:'Socket connection error',data:{error:error?.message,errorType:error?.type,errorData:error?.data,reconnectAttempts:this.reconnectAttempts},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
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
