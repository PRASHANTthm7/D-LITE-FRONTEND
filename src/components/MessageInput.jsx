import { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { socketManager } from '../utils/socket'
import { chatAPI } from '../services/chatService'

const MessageInput = ({ onSendMessage }) => {
  const { selectedUser, selectedGroup } = useChatStore()
  const { user } = useAuthStore()

  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const currentUserId = user?.id || user?._id || null
  const receiverId = selectedUser?.id || selectedUser?._id || null
  const groupId = selectedGroup?.id || selectedGroup?._id || null

  const emitTypingStatus = useCallback((typingActive) => {
    if (!currentUserId || (!receiverId && !groupId)) return

    if (typingActive) {
      socketManager.sendTyping(receiverId, groupId)
      return
    }

    socketManager.sendStopTyping(receiverId, groupId)
  }, [currentUserId, groupId, receiverId])

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || !currentUserId || (!receiverId && !groupId)) return

    const { addMessage } = useChatStore.getState()

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      id: `temp_${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: receiverId,
      group_id: groupId,
      content: trimmedMessage,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
      message_type: 'text',
      chat_type: groupId ? 'group' : 'private',
    }

    // Add message immediately to store for instant UI update
    addMessage(optimisticMessage)

    // Clear input immediately
    setMessage('')
    setIsTyping(false)
    emitTypingStatus(false)

    try {
      // Send via socket for real-time delivery
      // Note: sender_id is NOT sent - backend extracts it from JWT token
      socketManager.sendMessage({
        receiver_id: receiverId,
        group_id: groupId,
        content: trimmedMessage,
      })

      // Also send via API for database persistence
      // Note: sender_id is NOT sent - backend extracts it from JWT token
      const savedMessage = await chatAPI.sendMessage(
        null, // senderId - backend will extract from JWT token
        receiverId,
        trimmedMessage,
        groupId
      )

      // Note: The optimistic message will be replaced by the real message
      // when it arrives via WebSocket (receive_message event)
      // This ensures both sender and receiver see the same message in real-time
      
      // If WebSocket message doesn't arrive, replace optimistic message with saved one
      // This is a fallback for cases where WebSocket might be delayed
      setTimeout(() => {
        const { messages: currentMessages, setMessages } = useChatStore.getState()
        const stillHasOptimistic = currentMessages.some(
          msg => (msg._id === optimisticMessage._id || msg.id === optimisticMessage.id) &&
                 msg._id?.startsWith('temp_')
        )
        
        if (stillHasOptimistic && savedMessage) {
          const updatedMessages = currentMessages.map(msg => 
            msg._id === optimisticMessage._id || msg.id === optimisticMessage.id
              ? { ...savedMessage, _id: savedMessage._id || savedMessage.id, id: savedMessage.id || savedMessage._id }
              : msg
          )
          setMessages(updatedMessages)
        }
      }, 1000) // Wait 1 second for WebSocket message, then fallback to API response

      if (onSendMessage) {
        onSendMessage(trimmedMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      const { messages, setMessages } = useChatStore.getState()
      const updatedMessages = messages.filter(
        msg => msg._id !== optimisticMessage._id && msg.id !== optimisticMessage.id
      )
      setMessages(updatedMessages)
    }
  }, [currentUserId, emitTypingStatus, groupId, message, onSendMessage, receiverId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = useCallback((inputValue) => {
    const hasContent = inputValue.trim().length > 0

    if (hasContent && !isTyping) {
      setIsTyping(true)
      emitTypingStatus(true)
    }

    if (!hasContent && isTyping) {
      setIsTyping(false)
      emitTypingStatus(false)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTypingStatus(false)
    }, 1000)
  }, [emitTypingStatus, isTyping])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      emitTypingStatus(false)
    }
  }, [emitTypingStatus])

  return (
    <div className="flex items-end gap-3 px-1">
      {/* Emoji/Attachment button (optional) */}
      <button
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/80 hover:bg-white border border-gray-200/60 flex items-center justify-center transition-all duration-300 ease-out hover:shadow-md group transform hover:scale-105 active:scale-95"
        style={{ willChange: 'transform' }}
        title="Add emoji or attachment"
      >
        <svg 
          className="w-5 h-5 text-gray-500 group-hover:text-indigo-500 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => {
            const nextValue = e.target.value
            setMessage(nextValue)
            handleTyping(nextValue)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-gray-800 placeholder-gray-400 transition-all duration-300 ease-out shadow-sm hover:shadow-md focus:shadow-lg"
          style={{ willChange: 'border-color, box-shadow' }}
          rows={2}
          style={{ minHeight: '52px', maxHeight: '160px' }}
        />
        {message.length > 0 && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {message.length}
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center group"
        style={{ willChange: 'transform, box-shadow' }}
        title="Send message"
      >
        {message.trim() ? (
          <svg 
            className="w-5 h-5 transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-300 ease-out" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 text-white/60" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default MessageInput
