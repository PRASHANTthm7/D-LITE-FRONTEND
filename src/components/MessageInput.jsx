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

    try {
      // Send via socket
      socketManager.sendMessage({
        sender_id: currentUserId,
        receiver_id: receiverId,
        group_id: groupId,
        content: trimmedMessage,
      })

      // Also send via API for persistence
      await chatAPI.sendMessage(
        currentUserId,
        receiverId,
        trimmedMessage,
        groupId
      )

      setMessage('')
      setIsTyping(false)
      emitTypingStatus(false)

      if (onSendMessage) {
        onSendMessage(trimmedMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
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
    <div className="flex items-end gap-3">
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
          className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-gray-800 placeholder-gray-400 transition-all shadow-sm"
          rows={2}
          style={{ minHeight: '48px', maxHeight: '160px' }}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
        title="Send message"
      >
        <svg 
          className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  )
}

export default MessageInput
