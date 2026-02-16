import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { useAI } from '../contexts/AIContext'
import { useSentient } from '../sentient/SentientProvider'
import { useUXEngine } from '../uxEngine'
import { socketManager } from '../utils/socket'
import { chatAPI } from '../services/chatService'

const MessageInput = ({ onSendMessage }) => {
  const { selectedUser, selectedGroup } = useChatStore()
  const { user } = useAuthStore()
  const { smartSuggestions, analyzeInput } = useAI()
  const { roomMood, vibeState } = useSentient()
  const { signals } = useUXEngine()
  const {
    inputMode,
    isUserPausing,
    shouldShowCompositionAssist,
    focusMode,
    focusModeSuggestion,
    toggleFocusMode,
    trackTyping,
    dismissFocusModeSuggestion,
  } = signals

  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const aiAnalysisTimeoutRef = useRef(null)

  const currentUserId = user?.id || user?._id || null
  const receiverId = selectedUser?.id || selectedUser?._id || null
  const groupId = selectedGroup?.id || selectedGroup?._id || null

  const inputRows = useMemo(() => {
    if (inputMode === 'expanded') return 3
    if (inputMode === 'collapsed') return 1
    return 2
  }, [inputMode])

  const visibleSuggestions = useMemo(
    () => (smartSuggestions || []).filter(Boolean).slice(0, 3),
    [smartSuggestions]
  )

  const contextualActions = useMemo(() => {
    const actions = []
    const normalizedMood = String(roomMood || '').toLowerCase()
    const normalizedVibe = String(vibeState || '').toLowerCase()

    if (
      normalizedMood === 'deep' ||
      normalizedMood === 'calm' ||
      normalizedVibe === 'contemplative' ||
      normalizedVibe === 'philosophical'
    ) {
      actions.push({
        id: 'expand-thought',
        label: 'Expand thought',
        apply: (currentValue) => {
          if (!currentValue.trim()) return 'Let me break this down:'
          return `${currentValue.trim()}\n- `
        },
      })
    }

    if (
      normalizedMood === 'energetic' ||
      normalizedMood === 'chaotic' ||
      normalizedVibe === 'excited' ||
      normalizedVibe === 'joyful'
    ) {
      actions.push({
        id: 'emoji-shortcut',
        label: 'Emoji shortcut',
        apply: (currentValue) => `${currentValue}${currentValue.endsWith(' ') ? '' : ' '}:)`,
      })
    }

    return actions
  }, [roomMood, vibeState])

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
      trackTyping({ isTyping: false, contentLength: 0 })

      if (onSendMessage) {
        onSendMessage(trimmedMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [currentUserId, emitTypingStatus, groupId, message, onSendMessage, receiverId, trackTyping])

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

    trackTyping({
      isTyping: hasContent,
      contentLength: inputValue.length,
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTypingStatus(false)
      trackTyping({
        isTyping: false,
        contentLength: inputValue.length,
      })
    }, 1000)

    if (aiAnalysisTimeoutRef.current) {
      clearTimeout(aiAnalysisTimeoutRef.current)
    }

    if (inputValue.trim().length >= 8) {
      aiAnalysisTimeoutRef.current = setTimeout(() => {
        analyzeInput(inputValue)
      }, 700)
    }
  }, [analyzeInput, emitTypingStatus, isTyping, trackTyping])

  const handleContextAction = useCallback((action) => {
    setMessage((currentValue) => action.apply(currentValue))
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (aiAnalysisTimeoutRef.current) {
        clearTimeout(aiAnalysisTimeoutRef.current)
      }
      trackTyping({ isTyping: false, contentLength: 0 })
    }
  }, [trackTyping])

  return (
    <div className="flex flex-col gap-2 ux-input-container">
      {focusModeSuggestion && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs">
          <span className="flex-1">{focusModeSuggestion.message}</span>
          <button
            type="button"
            onClick={() => toggleFocusMode(true)}
            className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            Enable
          </button>
          <button
            type="button"
            onClick={dismissFocusModeSuggestion}
            className="px-2 py-1 rounded-md hover:bg-amber-100 transition-colors"
            aria-label="Dismiss focus suggestion"
          >
            Later
          </button>
        </div>
      )}

      {shouldShowCompositionAssist && isUserPausing && visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 ux-panel-suggestions">
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs border border-indigo-100 transition-all ux-touch-target"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {contextualActions.length > 0 && inputMode !== 'collapsed' && (
        <div
          className="flex flex-wrap gap-2 ux-panel-quick-actions"
          style={{ opacity: 'var(--ux-actions-opacity)' }}
        >
          {contextualActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleContextAction(action)}
              className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-gray-200 text-xs text-gray-700 transition-all ux-touch-target"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

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
          className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-gray-800 placeholder-gray-400 transition-all shadow-sm ux-input-expandable"
          rows={inputRows}
          style={{ minHeight: '48px', maxHeight: '160px' }}
        />
      </div>

      <button
        type="button"
        onClick={() => toggleFocusMode(!focusMode)}
        className={`flex-shrink-0 h-12 px-3 rounded-xl text-xs font-semibold border transition-all ux-touch-target ${
          focusMode
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white/90 text-indigo-700 border-indigo-200 hover:bg-indigo-50'
        }`}
        title={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
      >
        Focus
      </button>

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group ux-touch-target"
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
    </div>
  )
}

export default MessageInput
