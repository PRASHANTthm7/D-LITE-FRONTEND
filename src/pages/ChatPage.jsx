import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { socketManager } from '../utils/socket'
import { chatAPI } from '../services/chatService'
import { authAPI } from '../services/authService'
import AppLayout from '../components/layout/AppLayout'
import UsersList from '../components/UsersList'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

const ChatPage = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const {
    users,
    selectedUser,
    messages,
    setUsers,
    setMessages,
    setConversations,
    addMessage,
    updateOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
  } = useChatStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !user) {
      navigate('/login')
      return
    }

    const setupSocket = async () => {
      try {
        await socketManager.connect(token)

        // Setup presence tracking
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

        // Setup message listener
        socketManager.onMessage(async (message) => {
          addMessage(message)
          
          // Refresh conversations to update unread counts if this is a message for us
          const currentUserId = user.id || user._id
          if (message.receiver_id === currentUserId) {
            try {
              const conversationsData = await chatAPI.getConversations(currentUserId)
              setConversations(conversationsData || [])
            } catch (error) {
              console.error('Error refreshing conversations:', error)
            }
          }
        })

        // Fetch conversations first
        const currentUserId = user.id || user._id
        const conversationsData = await chatAPI.getConversations(currentUserId)
        setConversations(conversationsData || [])

        // Fetch only users from conversations (privacy: don't show all users)
        const conversationUserIds = (conversationsData || []).map(conv => conv.user_id)
        
        if (conversationUserIds.length > 0) {
          // Fetch user details for conversation partners
          const userDetailsPromises = conversationUserIds.map(userId => 
            authAPI.getUser(userId).catch(err => {
              console.error(`Error fetching user ${userId}:`, err)
              return null
            })
          )
          const userDetails = await Promise.all(userDetailsPromises)
          const validUsers = userDetails.filter(u => u && u.user).map(u => u.user)
          setUsers(validUsers)
        } else {
          // No conversations yet - empty list
          setUsers([])
        }

        setLoading(false)
      } catch (error) {
        console.error('Socket setup error:', error)
        setLoading(false)
      }
    }

    setupSocket()

    return () => {
      socketManager.offMessage()
    }
  }, [token, user, navigate, setUsers, setConversations, updateOnlineUsers, addOnlineUser, removeOnlineUser, addMessage])

  // Load messages when user is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser || !user) return

      try {
        const currentUserId = user.id || user._id
        const selectedUserId = selectedUser.id || selectedUser._id
        
        const data = await chatAPI.getMessages(currentUserId, selectedUserId)
        setMessages(data.messages || [])

        // Mark unread messages as read
        const unreadMessages = (data.messages || []).filter(
          msg => msg.receiver_id === currentUserId && !msg.read
        )
        
        for (const msg of unreadMessages) {
          try {
            await chatAPI.markMessageAsRead(msg._id || msg.id)
          } catch (error) {
            console.error('Error marking message as read:', error)
          }
        }

        // Refresh conversations to update unread counts
        if (unreadMessages.length > 0) {
          const conversationsData = await chatAPI.getConversations(currentUserId)
          setConversations(conversationsData || [])
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [selectedUser, user, setMessages])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <AppLayout
      sidebarContent={<UsersList />}
      chatHeader={
        selectedUser ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-base">
                {selectedUser.username || selectedUser.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Direct message
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-xs text-gray-500 mt-0.5">Select a conversation or search for users</p>
            </div>
          </div>
        )
      }
      chatContent={<MessageList />}
      chatInput={selectedUser ? <MessageInput /> : null}
      onLogout={logout}
    />
  )
}

export default ChatPage
