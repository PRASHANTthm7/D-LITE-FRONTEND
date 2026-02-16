# Socket Gateway Integration Guide

This document explains how the frontend is connected to the Socket Gateway for real-time communication and presence tracking.

## Overview

The D-Lite chat application uses WebSocket connections via Socket.IO to provide real-time features:

- **Real-time Messaging**: Messages are instantly delivered using WebSocket
- **Presence Tracking**: Users see who is online/offline in real-time
- **Typing Indicators**: See when other users are typing
- **Connection Management**: Automatic reconnection and disconnection handling

## Architecture

### Socket Manager (`src/utils/socket.js`)

Central manager for all socket operations. It provides:

- **Socket Connection**: Connects using JWT authentication
- **Event Management**: Simplified event listener registration
- **Presence Tracking**: Monitors online/offline status
- **Message Handling**: Manages socket-based messaging
- **Console Logging**: Detailed logging of all socket events

### Integration Points

#### 1. Auth Store (`src/store/authStore.js`)

When a user logs in or registers, the socket connection is automatically initialized:

```javascript
// On successful login/register:
await socketManager.connect(data.token)
console.log('[Auth] Socket initialized after login')

// On logout:
socketManager.disconnect()
```

#### 2. Chat Page (`src/pages/ChatPage.jsx`)

Sets up all socket listeners and presence tracking when the chat page loads:

```javascript
// Setup message listeners
socketManager.setupMessageListeners({
  onMessageReceived: (message) => { /* ... */ },
  onMessageDelivered: (data) => { /* ... */ },
  onMessageRead: (data) => { /* ... */ }
})

// Setup presence tracking
socketManager.setupPresenceTracking({
  onUserConnected: (userId) => { /* ... */ },
  onUserDisconnected: (userId) => { /* ... */ },
  onOnlineUsersUpdate: (userIds) => { /* ... */ }
})
```

## Console Logging

The socket manager logs all events with prefixes for easy filtering:

### Log Prefixes

| Prefix | Event Type |
|--------|-----------|
| `[Socket]` | Socket connection/disconnection |
| `[Presence]` | User online/offline events |
| `[Message]` | Message events |
| `[Typing]` | Typing indicators |
| `[Room]` | Room join/leave events |
| `[Auth]` | Authentication-related socket events |
| `[ChatPage]` | Chat page socket setup |

### Viewing Console Logs

1. **Open Browser Developer Tools**
   - Press `F12` or right-click → "Inspect"
   - Go to the "Console" tab

2. **Filter by Prefix**
   - Filter box: `[Socket]` to see only socket connection logs
   - Filter box: `[Presence]` to see only presence logs
   - Filter box: `[Message]` to see only message logs

### Example Console Output

```
[Socket] ✓ Connected with ID: abc123def456
[Presence] Online users count: 5
[Presence] User IDs: ['user1', 'user2', 'user3', 'user4', 'user5']

[Presence] ✓ User user2 came ONLINE
[Typing] User user2 is typing...
[Message] Sending: { sender_id: 'user1', receiver_id: 'user2', content: 'Hello!', ... }
[Typing] User user2 stopped typing
[Message] Received: { id: '123', sender_id: 'user2', content: 'Hi there!', ... }

[Presence] ✗ User user3 went OFFLINE
[Socket] Disconnected. Reason: io client namespace disconnect
```

## Socket Manager API

### Connection Methods

```javascript
// Connect with JWT token
await socketManager.connect(token)

// Check connection status
socketManager.isSocketConnected() // returns boolean

// Disconnect
socketManager.disconnect()
```

### Event Listeners

```javascript
// Setup presence tracking with callbacks
socketManager.setupPresenceTracking({
  onOnlineUsersUpdate: (userIds) => {},
  onUserConnected: (userId) => {},
  onUserDisconnected: (userId) => {},
  onUserTyping: (userId) => {},
  onUserStoppedTyping: (userId) => {}
})

// Setup message listeners with callbacks
socketManager.setupMessageListeners({
  onMessageReceived: (message) => {},
  onMessageDelivered: (data) => {},
  onMessageRead: (data) => {}
})

// Add custom event listener
socketManager.addEventListener(event, callback)

// Remove event listener
socketManager.removeEventListener(event, callback)
```

### Message Methods

```javascript
// Send a message
socketManager.sendMessage({
  sender_id: 'user1',
  receiver_id: 'user2',
  content: 'Hello!',
  message_type: 'text'
})

// Send typing indicator
socketManager.sendTyping(receiverId)

// Stop typing indicator
socketManager.stopTyping(receiverId)

// Join a room
socketManager.joinRoom(roomId)

// Leave a room
socketManager.leaveRoom(roomId)
```

## Socket Events

### Presence Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `user_connected` | Server → Client | `{ user_id }` | User comes online |
| `user_disconnected` | Server → Client | `{ user_id }` | User goes offline |
| `online_users` | Server → Client | `[user_id, ...]` | List of online users |

### Message Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `send_message` | Client → Server | Message object | Send a message |
| `receive_message` | Server → Client | Message object | Receive a message |
| `message_delivered` | Server → Client | `{ message_id }` | Message delivered |
| `message_read` | Server → Client | `{ message_id }` | Message read |

### Typing Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `typing` | Client → Server | `{ receiver_id }` | User is typing |
| `stop_typing` | Client → Server | `{ receiver_id }` | User stopped typing |

### Room Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `join_room` | Client → Server | `{ room_id }` | Join a chat room |
| `leave_room` | Client → Server | `{ room_id }` | Leave a chat room |

## Troubleshooting

### Socket won't connect

**Issue**: `[Socket] ✗ Connection error`

**Solutions**:
1. Verify `VITE_SOCKET_GATEWAY_URL` is set correctly in `.env`
2. Check that the socket gateway server is running
3. Verify JWT token is valid and contains user ID
4. Check browser console for detailed error message

### Users not showing as online

**Issue**: No `[Presence]` logs appear

**Solutions**:
1. Wait for socket to fully connect (check for `[Socket] ✓ Connected`)
2. Verify multiple users are logged in on different browsers/tabs
3. Check socket gateway backend logs
4. Confirm user IDs are being transmitted correctly

### Messages not sending

**Issue**: `[Message] Sending:` appears but message doesn't reach recipient

**Solutions**:
1. Verify both users are online (check `[Presence]` logs)
2. Check that receiver ID is correct
3. Verify socket gateway message service is working
4. Check chat service backend logs

### Console spam

**Tips**:
1. Filter console to see only relevant logs
2. Use browser DevTools search/filter box
3. Group logs by type (Filter: `[Socket]`, then `[Message]`, etc.)

## Development Tips

### Testing Presence

1. Open chat in two different browser tabs/windows
2. Log in with different users
3. Watch browser console for:
   - `[Presence] ✓ User X came ONLINE`
   - `[Presence] ✗ User X went OFFLINE`
4. Close one tab and watch for disconnect event

### Testing Messages

1. With two users online, send a message
2. Watch console for:
   - `[Message] Sending: { ... }`
   - `[Message] Received: { ... }`
3. Verify message appears in chat UI

### Testing Typing Indicators

1. Click and start typing in message input
2. Watch console for:
   - `[Typing] User X is typing...`
   - `[Typing] User X stopped typing`
3. Typing indicator should appear in UI (if implemented)

## Security Considerations

- **JWT Authentication**: All socket connections are authenticated with JWT tokens from login
- **Token Validation**: Socket gateway verifies token before accepting connections
- **User Isolation**: Users can only see messages and presence for authenticated sessions
- **Message Encryption**: Messages should be encrypted in production (not currently implemented)

## Performance Considerations

- **Reconnection**: Socket automatically reconnects with exponential backoff
- **Message Queue**: Messages are queued if socket disconnects and sent when reconnected
- **Presence**: Online user list is synced on connection and updated via events
- **Typing Debouncing**: Typing indicators should be debounced on client side (not currently implemented)

## Next Steps

Potential enhancements:

1. **Typing Debouncing**: Reduce typing event frequency
2. **Message Encryption**: Add end-to-end encryption
3. **Message History**: Load chat history on room join
4. **Read Receipts**: Show when messages are read
5. **User Status**: Support away/do not disturb statuses
6. **File Sharing**: Add file upload support
