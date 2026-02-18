import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const { user, token, logout } = useAuthStore()
  const {
    users,
    selectedUser,
    selectedGroup,
    messages,
    onlineUsers,
    typingUsers,
    setUsers,
    setMessages,
    setConversations,
    setSelectedUser,
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
        // Connect socket (will reuse existing connection if available)
        try {
          await socketManager.connect(token)
        } catch (connectError) {
          console.error('Socket connection failed:', connectError)
          // Continue with setup even if socket connection fails
          // User can still view conversations, just won't get real-time updates
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

              // Setup message listener
              socketManager.onMessage(async (receivedMessage) => {
                const currentUserId = user.id || user._id
                const selectedUserId = selectedUser?.id || selectedUser?._id
                const selectedGroupId = selectedGroup?.id || selectedGroup?._id
                
                // Check if message is for group or private chat
                const isGroupMessage = !!receivedMessage.group_id
                
                // Only add message if it's for the currently selected conversation
                let isForCurrentConversation = false
                
                if (isGroupMessage) {
                  // For group messages: check if it's for the currently selected group
                  isForCurrentConversation = receivedMessage.group_id === selectedGroupId
                } else {
                  // For private messages: check if it's between current user and selected user
                  isForCurrentConversation = 
                    (receivedMessage.receiver_id === currentUserId && receivedMessage.sender_id === selectedUserId) ||
                    (receivedMessage.sender_id === currentUserId && receivedMessage.receiver_id === selectedUserId)
                }
                
                // Add message if it's for current conversation or if no conversation is selected (for notifications)
                if (isForCurrentConversation || (!selectedUser && !selectedGroup)) {
                  // Check if message already exists (avoid duplicates)
                  const { messages } = useChatStore.getState()
                  const messageExists = messages.some(
                    msg => (msg._id === receivedMessage._id || msg.id === receivedMessage.id) ||
                           (msg._id === receivedMessage._id || msg.id === receivedMessage.id)
                  )
                  
                  if (!messageExists) {
                    addMessage(receivedMessage)
                  }
                }

                // Refresh conversations to update unread counts if this is a message for us
                // For group messages, all members receive them, so we don't mark as read automatically
                if (!isGroupMessage && receivedMessage.receiver_id === currentUserId) {
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
        let conversationsData = []
        try {
          conversationsData = await chatAPI.getConversations(currentUserId) || []
        } catch (error) {
          console.error('Error fetching conversations:', error)
          conversationsData = []
        }
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
        } else {
          // No conversations yet - empty list
          setUsers([])
        }

        // Handle pre-selected user from navigation state
        const selectedUserId = location.state?.selectedUserId
        if (selectedUserId) {
          // Check if user is already in the list
          const existingUser = users.find(u => (u.id || u._id) === selectedUserId)
          if (existingUser) {
            setSelectedUser(existingUser)
          } else {
            // Fetch user if not in list
            try {
              const userData = await authAPI.getUser(selectedUserId)
              if (userData && userData.user) {
                const newUser = userData.user
                setUsers([...users, newUser])
                setSelectedUser(newUser)
              }
            } catch (error) {
              console.error('Error fetching selected user:', error)
            }
          }
          // Clear the state to avoid re-selecting on re-render
          navigate(location.pathname, { replace: true, state: {} })
        }

        setLoading(false)
      } catch (error) {
        console.error('Socket setup error:', error)
        setLoading(false)
      }
    }

    setupSocket()

    return () => {
      // Cleanup message listener
      socketManager.offMessage()
      // Note: Don't disconnect socket here as DashboardPage might need it
      // Socket should only disconnect on logout
    }
  }, [token, user, navigate, setUsers, setConversations, updateOnlineUsers, addOnlineUser, removeOnlineUser, addMessage, location, selectedUser, selectedGroup])

  // Load messages when user or group is selected - ALWAYS load from database
  useEffect(() => {
    const loadMessages = async () => {
      // Handle group messages
      if (selectedGroup && user) {
        try {
          const groupId = selectedGroup.id || selectedGroup._id
          
          if (!groupId) {
            console.warn('Missing group ID for loading messages')
            return
          }

          // Join group room for real-time updates
          socketManager.joinGroup(groupId)

          // Always fetch messages from database to ensure persistence
          const data = await chatAPI.getGroupMessages(groupId)
          
          // Sort messages by timestamp to ensure correct order
          const sortedMessages = (data.messages || []).sort((a, b) => {
            const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
            const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
            return timeA - timeB
          })
          
          setMessages(sortedMessages)
        } catch (error) {
          console.error('Error loading group messages:', error)
          setMessages([])
        }
        return
      }

      // Handle private messages
      if (!selectedUser || !user) {
        // Clear messages if no user selected
        setMessages([])
        return
      }

      try {
        const currentUserId = user.id || user._id
        const selectedUserId = selectedUser.id || selectedUser._id
        
        if (!currentUserId || !selectedUserId) {
          console.warn('Missing user IDs for loading messages')
          return
        }

        // Always fetch messages from database to ensure persistence
        // This ensures messages are loaded even after logout/login
        const data = await chatAPI.getMessages(currentUserId, selectedUserId)
        
        // Sort messages by timestamp to ensure correct order
        const sortedMessages = (data.messages || []).sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
          const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
          return timeA - timeB
        })
        
        setMessages(sortedMessages)

        // Mark unread messages as read (only for private messages)
        const unreadMessages = sortedMessages.filter(
          msg => (msg.receiver_id === currentUserId || msg.receiverId === currentUserId) && !msg.read
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
          try {
            const conversationsData = await chatAPI.getConversations(currentUserId)
            setConversations(conversationsData || [])
          } catch (error) {
            console.error('Error refreshing conversations:', error)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        // Set empty array on error to show no messages
        setMessages([])
      }
    }

    loadMessages()
  }, [selectedUser, selectedGroup, user, setMessages, setConversations])

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
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AuraAvatar
                  userId={selectedUser.id || selectedUser._id}
                  avatarUrl={selectedUser.avatarUrl}
                  name={selectedUser.username || selectedUser.name}
                  size="md"
                  online={onlineUsers.has(selectedUser.id || selectedUser._id)}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-gray-900 text-base">
                    {selectedUser.username || selectedUser.name}
                  </div>
                  {onlineUsers.has(selectedUser.id || selectedUser._id) && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  {onlineUsers.has(selectedUser.id || selectedUser._id) ? (
                    <>
                      <span className="text-green-500">Online</span>
                      <span>•</span>
                      <span>Direct message</span>
                    </>
                  ) : (
                    <span>Direct message</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-gray-100/80 transition-colors"
                title="More options"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
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
