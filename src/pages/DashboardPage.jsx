import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { chatAPI } from '../services/chatService'
import { authAPI } from '../services/authService'
import { socketManager } from '../utils/socket'
import ChatBubble from '../components/ChatBubble'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const { 
    conversations, 
    users, 
    onlineUsers,
    setConversations, 
    setUsers,
    updateOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
  } = useChatStore()

  useEffect(() => {
    if (!token || !user) return

    const loadConversations = async () => {
      try {
        const currentUserId = user.id || user._id
        
        // Connect socket if not connected
        try {
          if (!socketManager.isSocketConnected()) {
            await socketManager.connect(token)
          }
          
          // Setup presence tracking (will skip if already setup)
          socketManager.setupPresenceTracking({
            onOnlineUsersUpdate: (userIds) => {
              updateOnlineUsers(userIds)
            },
            onUserConnected: (userId) => {
              addOnlineUser(userId)
            },
            onUserDisconnected: (userId) => {
              removeOnlineUser(userId)
            },
          })
        } catch (socketError) {
          console.error('Error connecting socket in DashboardPage:', socketError)
          // Continue loading conversations even if socket fails
        }

        // Fetch conversations
        const conversationsData = await chatAPI.getConversations(currentUserId) || []
        setConversations(conversationsData)

        // Fetch user details for conversation partners
        const conversationUserIds = conversationsData.map(conv => conv.user_id)
        if (conversationUserIds.length > 0) {
          const userDetailsPromises = conversationUserIds.map(userId => 
            authAPI.getUser(userId).catch(err => {
              console.error(`Error fetching user ${userId}:`, err)
              return null
            })
          )
          const userDetails = await Promise.all(userDetailsPromises)
          const validUsers = userDetails.filter(u => u && u.user).map(u => u.user)
          setUsers(validUsers)
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }

    loadConversations()

    // Cleanup: Don't disconnect socket (ChatPage might be using it)
    // Socket cleanup should be handled by ChatPage or on logout
    return () => {
      // No cleanup needed here - socket is shared and managed by SocketManager
    }
  }, [token, user, setConversations, setUsers, updateOnlineUsers, addOnlineUser, removeOnlineUser])

  const handleChatBubbleClick = (selectedUser) => {
    // Navigate to chat page with user selected
    navigate('/chat', { state: { selectedUserId: selectedUser.id || selectedUser._id } })
  }

  const isOnline = (userId) => {
    return onlineUsers.has(userId) || onlineUsers.has(String(userId))
  }

  // Get conversations with user details
  const conversationsWithUsers = Object.entries(conversations || {}).map(([userId, convData]) => {
    const userData = users.find(u => (u.id || u._id) === userId)
    return {
      userId,
      user: userData,
      unreadCount: convData.unread_count || 0,
      lastMessage: convData.last_message,
    }
  }).filter(conv => conv.user) // Only show conversations with valid user data

  // Sort by last message time (most recent first)
  conversationsWithUsers.sort((a, b) => {
    const timeA = a.lastMessage?.timestamp || a.lastMessage?.createdAt || 0
    const timeB = b.lastMessage?.timestamp || b.lastMessage?.createdAt || 0
    return new Date(timeB) - new Date(timeA)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.username || user?.name}!</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Active Chats Section */}
          {conversationsWithUsers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Active Chats</h2>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {conversationsWithUsers.map((conv) => (
                  <ChatBubble
                    key={conv.userId}
                    user={conv.user}
                    lastMessage={conv.lastMessage}
                    unreadCount={conv.unreadCount}
                    isOnline={isOnline(conv.userId)}
                    onClick={handleChatBubbleClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-6 bg-gradient-to-br from-indigo-400 to-purple-400 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold">Open Chat</div>
                <div className="text-xs mt-1 opacity-90">
                  {conversationsWithUsers.length > 0 
                    ? `${conversationsWithUsers.length} active conversation${conversationsWithUsers.length > 1 ? 's' : ''}`
                    : 'Start a new conversation'
                  }
                </div>
              </button>
              <div className="p-6 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg opacity-75">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">My Profile</div>
                <div className="text-xs mt-1 opacity-90">Coming soon</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-lg opacity-75">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs mt-1 opacity-90">Coming soon</div>
              </div>
            </div>
          </div>

          {conversationsWithUsers.length === 0 && (
            <div className="mt-8 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">💬 Start Chatting</h3>
            <p className="text-sm text-gray-600 mb-4">
              You don't have any active conversations yet. Click "Open Chat" to search for users and start chatting!
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Start New Chat
            </button>
          </div>
          )}

          <div className="mt-8 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔒 Privacy & Security</h3>
            <p className="text-sm text-gray-600">
              Your conversations are private and secure. Only you and the people you chat with can see your messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
