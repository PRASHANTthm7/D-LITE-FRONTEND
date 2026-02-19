import { memo, useEffect, useRef } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import ChatBubble from './ui/ChatBubble'
import TypingIndicator from './TypingIndicator'

const MessageList = memo(() => {
  const { messages, selectedUser, typingUsers } = useChatStore()
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  const currentUserName = (user?.username || user?.name || '').toLowerCase()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [selectedUser])

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30">
        <div className="text-center max-w-md px-6 animate-fade-in">
          <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to D-Lite
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Select a conversation from the sidebar or search for users to start chatting.
          </p>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30">
        <div className="text-center max-w-md px-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No messages yet
          </h3>
          <p className="text-sm text-gray-500">
            Start the conversation with <span className="font-semibold text-indigo-600">{selectedUser?.username || selectedUser?.name}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 pb-2">
      {messages.map((message, index) => {
        const isOwn = (message.sender_id || message.senderId) === (user?.id || user?._id)
        const senderName = isOwn 
          ? 'You' 
          : selectedUser?.username || selectedUser?.name || 'Unknown'
        const messageContent = String(message.content || message.text || '')
        const normalizedContent = messageContent.toLowerCase()
        const isMention =
          !isOwn &&
          currentUserName.length > 0 &&
          normalizedContent.includes(`@${currentUserName}`)
        const isReply = Boolean(
          message.reply_to ||
          message.replyTo ||
          message.reply_to_id ||
          message.parent_id
        )

        // Check if this is a new message (recently sent)
        const isNewMessage = message._id?.startsWith('temp_') || index === messages.length - 1

        return (
          <div
            key={message._id || message.id}
            className={`animate-slide-up ${isNewMessage ? 'animate-message-send' : ''}`}
            style={{ 
              animationDelay: `${Math.min(index * 0.02, 0.2)}s`,
              willChange: 'transform, opacity'
            }}
          >
            <ChatBubble
              message={message}
              isOwn={isOwn}
              senderName={!isOwn ? senderName : null}
              timestamp={message.timestamp || message.createdAt}
              attentionType={isMention ? 'mention' : isReply ? 'reply' : null}
              showAvatar={!isOwn}
            />
          </div>
        )
      })}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  )
})

MessageList.displayName = 'MessageList'

export default MessageList
