import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { chatAPI } from '../services/chatService'
import { authAPI } from '../services/authService'
import { socketManager } from '../utils/socket'
import ChatBubble from '../components/ChatBubble'
import AuraAvatar from '../components/ui/AuraAvatar'

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
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
      } finally {
        setLoading(false)
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

  // Filter by search query
  const filteredConversations = conversationsWithUsers.filter(conv => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const userName = (conv.user?.username || conv.user?.name || '').toLowerCase()
    const lastMessage = (conv.lastMessage?.content || conv.lastMessage?.text || '').toLowerCase()
    return userName.includes(query) || lastMessage.includes(query)
  })

  // Sort by last message time (most recent first)
  filteredConversations.sort((a, b) => {
    const timeA = a.lastMessage?.timestamp || a.lastMessage?.createdAt || 0
    const timeB = b.lastMessage?.timestamp || b.lastMessage?.createdAt || 0
    return new Date(timeB) - new Date(timeA)
  })

  // Separate conversations with unread messages
  const unreadConversations = filteredConversations.filter(conv => conv.unreadCount > 0)
  const readConversations = filteredConversations.filter(conv => conv.unreadCount === 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <AuraAvatar
                  userId={user?.id || user?._id}
                  name={user?.username || user?.name || 'User'}
                  size="md"
                  online={true}
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {user?.username || user?.name || 'Dashboard'}
                  </h1>
                  <p className="text-xs text-gray-500">Welcome back!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  New Chat
                </span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{conversationsWithUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Online Friends</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversationsWithUsers.filter(conv => isOnline(conv.userId)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {conversationsWithUsers.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-gray-800 placeholder-gray-400 transition-all shadow-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <div className="space-y-6">
            {/* Unread Conversations */}
            {unreadConversations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Unread</h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {unreadConversations.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {unreadConversations.map((conv) => (
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

            {/* Read Conversations */}
            {readConversations.length > 0 && (
              <div>
                {unreadConversations.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent</h2>
                )}
                <div className="space-y-2">
                  {readConversations.map((conv) => (
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
          </div>
        ) : conversationsWithUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/60 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Your First Conversation</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any active conversations yet. Click the button below to search for users and start chatting!
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          /* No Search Results */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/60 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No conversations found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
