import { useState, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { chatAPI } from '../services/chatService'
import { socketManager } from '../utils/socket'

export function useMessages() {
  const { selectedUser, selectedGroup, user, addMessage, setMessages } = useChatStore()
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState(null)

  const sendMessage = useCallback(async (content) => {
    if (!user || (!selectedUser && !selectedGroup)) return

    setSendingMessage(true)
    setMessagesError(null)

    try {
      const receiverId = selectedUser?.id || selectedUser?._id
      const groupId = selectedGroup?.id || selectedGroup?._id

      // Send via socket
      // Note: sender_id is NOT sent - backend extracts it from JWT token (auth service)
      socketManager.sendMessage({
        receiver_id: receiverId,
        group_id: groupId,
        content: content.trim(),
      })

      // Also send via API
      // Note: sender_id is NOT sent - backend extracts it from JWT token (auth service)
      await chatAPI.sendMessage(
        null, // senderId - backend will extract from JWT token
        receiverId,
        content.trim(),
        groupId
      )
    } catch (error) {
      setMessagesError(error.message || 'Failed to send message')
      throw error
    } finally {
      setSendingMessage(false)
    }
  }, [user, selectedUser, selectedGroup])

  const loadMessages = useCallback(async () => {
    if (!user || (!selectedUser && !selectedGroup)) return

    setMessagesLoading(true)
    setMessagesError(null)

    try {
      const receiverId = selectedUser?.id || selectedUser?._id
      const groupId = selectedGroup?.id || selectedGroup?._id

      let data
      if (groupId) {
        data = await chatAPI.getGroupMessages(groupId)
      } else {
        data = await chatAPI.getMessages(user.id || user._id, receiverId)
      }

      setMessages(data.messages || [])
    } catch (error) {
      setMessagesError(error.message || 'Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }, [user, selectedUser, selectedGroup, setMessages])

  const clearError = useCallback(() => {
    setMessagesError(null)
  }, [])

  return {
    sendMessage,
    loadMessages,
    sendingMessage,
    messagesLoading,
    messagesError,
    clearError,
  }
}
