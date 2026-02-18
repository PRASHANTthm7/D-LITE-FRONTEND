/**
 * Service Configuration & Mapping
 * 
 * This file maps frontend services to backend microservices.
 * 
 * Architecture:
 * ──────────────────────────────────────────────────────────────
 * • Auth Service (Node.js/Express) - Port 3001
 *   - Authentication & Authorization
 *   - User Management (CRUD, Search)
 *   - JWT Token Management
 * 
 * • Chat Service (Python/FastAPI) - Port 8001
 *   - Message Persistence
 *   - Conversations Management
 *   - Group Chat Management
 * 
 * • Socket Gateway (Node.js/Socket.IO) - Port 3002
 *   - Real-time WebSocket Communication
 *   - Presence Tracking
 *   - Message Broadcasting
 * 
 * Service Endpoints Mapping:
 * ──────────────────────────────────────────────────────────────
 * Auth Service:
 *   POST   /api/auth/register          → User registration
 *   POST   /api/auth/login             → User login
 *   GET    /api/auth/verify            → Verify token
 *   POST   /api/auth/logout            → User logout
 *   GET    /api/auth/profile           → Get user profile
 *   GET    /api/users                  → Get all users
 *   GET    /api/users/:userId          → Get user by ID
 *   GET    /api/users/search?q=query    → Search users
 *   PATCH  /api/users/:userId/status   → Update user status
 * 
 * Chat Service:
 *   POST   /api/messages               → Send message
 *   GET    /api/messages/:user1/:user2  → Get messages between users
 *   PATCH  /api/messages/:id/read      → Mark message as read
 *   DELETE /api/messages/:id            → Delete message
 *   GET    /api/conversations/:userId   → Get user conversations
 *   POST   /api/groups                 → Create group
 *   GET    /api/groups/:userId          → Get user groups
 *   GET    /api/groups/detail/:groupId  → Get group details
 *   GET    /api/groups/:groupId/messages → Get group messages
 *   POST   /api/groups/:groupId/members → Add group member
 *   DELETE /api/groups/:groupId/members/:userId → Remove member
 * 
 * Socket Gateway:
 *   WebSocket Connection               → Real-time events
 *   Events: send_message, receive_message, online_users, etc.
 */

import { validateEnvironment } from '../utils/envValidator';

// Get validated environment configuration
const envConfig = validateEnvironment();

export const SERVICE_CONFIG = {
  auth: {
    baseURL: envConfig.env.AUTH_SERVICE_URL,
    endpoints: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      verify: '/api/auth/verify',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile',
      users: '/api/users',
      userById: (userId) => `/api/users/${userId}`,
      searchUsers: '/api/users/search',
      updateStatus: (userId) => `/api/users/${userId}/status`,
    },
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  chat: {
    baseURL: envConfig.env.CHAT_SERVICE_URL,
    endpoints: {
      messages: '/api/messages',
      messagesBetween: (user1Id, user2Id) => `/api/messages/${user1Id}/${user2Id}`,
      markRead: (messageId) => `/api/messages/${messageId}/read`,
      deleteMessage: (messageId) => `/api/messages/${messageId}`,
      conversations: (userId) => `/api/conversations/${userId}`,
      groups: '/api/groups',
      userGroups: (userId) => `/api/groups/${userId}`,
      groupDetail: (groupId) => `/api/groups/detail/${groupId}`,
      groupMessages: (groupId) => `/api/groups/${groupId}/messages`,
      addGroupMember: (groupId) => `/api/groups/${groupId}/members`,
      removeGroupMember: (groupId, userId) => `/api/groups/${groupId}/members/${userId}`,
    },
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  socket: {
    baseURL: envConfig.env.SOCKET_GATEWAY_URL,
    events: {
      // Connection events
      connect: 'connect',
      disconnect: 'disconnect',
      connected: 'connected',
      error: 'error',
      
      // Presence events
      userConnected: 'user_connected',
      userDisconnected: 'user_disconnected',
      onlineUsers: 'online_users',
      getOnlineUsers: 'get_online_users',
      
      // Message events
      sendMessage: 'send_message',
      receiveMessage: 'receive_message',
      messageSent: 'message_sent',
      messageRead: 'message_read',
      messageDelivered: 'message_delivered',
      messageReadStatus: 'message_read_status',
      messagesLoaded: 'messages_loaded',
      getMessages: 'get_messages',
      deleteMessage: 'delete_message',
      messageDeleted: 'message_deleted',
      
      // Typing events
      typing: 'typing',
      stopTyping: 'stop_typing',
      userTyping: 'user_typing',
      userStoppedTyping: 'user_stopped_typing',
      
      // Room/Group events
      joinRoom: 'join_room',
      leaveRoom: 'leave_room',
      roomJoined: 'room_joined',
      roomLeft: 'room_left',
      joinGroup: 'join_group',
      leaveGroup: 'leave_group',
      groupJoined: 'group_joined',
      groupLeft: 'group_left',
      userJoinedGroup: 'user_joined_group',
      userLeftGroup: 'user_left_group',
    },
    options: {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    },
  },
};

/**
 * Health check utilities for services
 */
export const checkServiceHealth = async (serviceName) => {
  const service = SERVICE_CONFIG[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  try {
    const response = await fetch(`${service.baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      healthy: true,
      service: serviceName,
      status: data.status || 'ok',
      timestamp: data.timestamp || new Date().toISOString(),
      data,
    };
  } catch (error) {
    return {
      healthy: false,
      service: serviceName,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check health of all services
 */
export const checkAllServicesHealth = async () => {
  const services = ['auth', 'chat', 'socket'];
  const results = await Promise.allSettled(
    services.map(service => checkServiceHealth(service))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        healthy: false,
        service: services[index],
        error: result.reason?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  });
};

export default SERVICE_CONFIG;
