# Service Mapping Documentation

This document describes how the frontend connects to backend microservices.

## Architecture Overview

The application uses a microservices architecture with three main backend services:

1. **Auth Service** (Node.js/Express) - Port 3001
2. **Chat Service** (Python/FastAPI) - Port 8001  
3. **Socket Gateway** (Node.js/Socket.IO) - Port 3002

## Service Endpoints

### Auth Service (`http://localhost:3001`)

**Authentication & User Management**

| Method | Endpoint | Description | Frontend Usage |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | `authService.register()` |
| POST | `/api/auth/login` | User login | `authService.login()` |
| GET | `/api/auth/verify` | Verify JWT token | `authService.verifyToken()` |
| POST | `/api/auth/logout` | User logout | `authService.logout()` |
| GET | `/api/auth/profile` | Get user profile | `authService.getProfile()` |
| GET | `/api/users` | Get all users | `authService.getUsers()` |
| GET | `/api/users/:userId` | Get user by ID | `authService.getUser(userId)` |
| GET | `/api/users/search?q=query` | Search users | `authService.searchUsers(query)` |
| PATCH | `/api/users/:userId/status` | Update user status | Used by socket-gateway |

### Chat Service (`http://localhost:8001`)

**Messages & Conversations**

| Method | Endpoint | Description | Frontend Usage |
|--------|----------|-------------|----------------|
| POST | `/api/messages` | Send message | `chatService.sendMessage()` |
| GET | `/api/messages/:user1/:user2` | Get messages between users | `chatService.getMessages()` |
| PATCH | `/api/messages/:id/read` | Mark message as read | `chatService.markMessageAsRead()` |
| DELETE | `/api/messages/:id` | Delete message | Not yet implemented |
| GET | `/api/conversations/:userId` | Get user conversations | `chatService.getConversations()` |

**Group Management**

| Method | Endpoint | Description | Frontend Usage |
|--------|----------|-------------|----------------|
| POST | `/api/groups` | Create group | `chatService.createGroup()` |
| GET | `/api/groups/:userId` | Get user groups | `chatService.getUserGroups()` |
| GET | `/api/groups/detail/:groupId` | Get group details | `chatService.getGroup()` |
| GET | `/api/groups/:groupId/messages` | Get group messages | `chatService.getGroupMessages()` |
| POST | `/api/groups/:groupId/members` | Add group member | `chatService.addGroupMember()` |
| DELETE | `/api/groups/:groupId/members/:userId` | Remove member | `chatService.removeGroupMember()` |

### Socket Gateway (`http://localhost:3002`)

**WebSocket Connection for Real-time Communication**

| Event | Direction | Description | Frontend Usage |
|-------|-----------|-------------|----------------|
| `connect` | Server → Client | Socket connected | Auto-handled |
| `disconnect` | Server → Client | Socket disconnected | Auto-handled |
| `connected` | Server → Client | Connection confirmed | Auto-handled |
| `user_connected` | Server → Client | User came online | `socketManager.setupPresenceTracking()` |
| `user_disconnected` | Server → Client | User went offline | `socketManager.setupPresenceTracking()` |
| `online_users` | Server → Client | List of online users | `socketManager.setupPresenceTracking()` |
| `send_message` | Client → Server | Send message | `socketManager.sendMessage()` |
| `receive_message` | Server → Client | Receive message | `socketManager.onMessage()` |
| `message_sent` | Server → Client | Message sent confirmation | Auto-handled |
| `typing` | Client → Server | User is typing | `socketManager.sendTyping()` |
| `stop_typing` | Client → Server | User stopped typing | `socketManager.sendStopTyping()` |
| `user_typing` | Server → Client | Other user is typing | `socketManager.setupPresenceTracking()` |
| `join_group` | Client → Server | Join group room | `socketManager.joinGroup()` |
| `leave_group` | Client → Server | Leave group room | `socketManager.leaveGroup()` |

## Frontend Service Files

### `src/services/authService.js`
- **Base URL**: `VITE_AUTH_SERVICE_URL` (default: `http://localhost:3001`)
- **Purpose**: Authentication and user management
- **Methods**: `register()`, `login()`, `verifyToken()`, `logout()`, `getProfile()`, `getUsers()`, `getUser()`, `searchUsers()`

### `src/services/chatService.js`
- **Base URL**: `VITE_CHAT_SERVICE_URL` (default: `http://localhost:8001`)
- **Purpose**: Messages, conversations, and group management
- **Methods**: `sendMessage()`, `getMessages()`, `getGroupMessages()`, `getConversations()`, `markMessageAsRead()`, `createGroup()`, `getUserGroups()`, `getGroup()`, `addGroupMember()`, `removeGroupMember()`

### `src/utils/socket.js`
- **Base URL**: `VITE_SOCKET_GATEWAY_URL` (default: `http://localhost:3002`)
- **Purpose**: Real-time WebSocket communication
- **Class**: `SocketManager`
- **Methods**: `connect()`, `disconnect()`, `sendMessage()`, `onMessage()`, `setupPresenceTracking()`, `joinGroup()`, `leaveGroup()`, `sendTyping()`, `sendStopTyping()`

### `src/config/serviceConfig.js`
- **Purpose**: Centralized service configuration and health checks
- **Exports**: `SERVICE_CONFIG`, `checkServiceHealth()`, `checkAllServicesHealth()`

## Environment Variables

Create a `.env` file in the frontend root directory:

```env
# Auth Service
VITE_AUTH_SERVICE_URL=http://localhost:3001

# Chat Service
VITE_CHAT_SERVICE_URL=http://localhost:8001

# Socket Gateway
VITE_SOCKET_GATEWAY_URL=http://localhost:3002

# API Timeout (optional, default: 30000ms)
VITE_API_TIMEOUT=30000
```

## Service Health Checks

Use the health check utilities to verify service connectivity:

```javascript
import { checkServiceHealth, checkAllServicesHealth } from './config/serviceConfig'

// Check single service
const authHealth = await checkServiceHealth('auth')
console.log(authHealth) // { healthy: true, service: 'auth', ... }

// Check all services
const allHealth = await checkAllServicesHealth()
console.log(allHealth) // Array of health status objects
```

## Error Handling

All service calls use centralized error handling via `src/utils/apiErrorHandler.js`:

- **Network errors**: Handled with retry logic
- **4xx errors**: Client errors (validation, auth, etc.)
- **5xx errors**: Server errors with exponential backoff retry
- **Timeout errors**: Configurable timeout per service

## Authentication Flow

1. User logs in via `authService.login()` → receives JWT token
2. Token stored in `localStorage` as `'token'`
3. All API requests include token in `Authorization: Bearer <token>` header
4. Socket connection authenticates using token in `auth: { token }` option
5. Token verified on each request by backend services

## Data Flow

### Sending a Message

1. **Frontend**: User types message → `MessageInput` component
2. **Frontend**: `socketManager.sendMessage()` → Real-time delivery via WebSocket
3. **Frontend**: `chatAPI.sendMessage()` → Persistence via HTTP API
4. **Socket Gateway**: Receives message → Broadcasts to receiver
5. **Chat Service**: Saves message to database
6. **Receiver**: Receives message via WebSocket `receive_message` event

### Loading Conversations

1. **Frontend**: `chatAPI.getConversations(userId)` → Chat Service
2. **Chat Service**: Returns list of conversations with unread counts
3. **Frontend**: For each conversation, `authAPI.getUser(userId)` → Auth Service
4. **Frontend**: Displays users in sidebar with unread badges

## Notes

- **User data** should always be fetched from **Auth Service**, not Chat Service
- **Message data** should always be fetched from **Chat Service**
- **Real-time events** are handled via **Socket Gateway**
- All services require JWT authentication except public endpoints (register, login)
- Services are independent and can be scaled horizontally
