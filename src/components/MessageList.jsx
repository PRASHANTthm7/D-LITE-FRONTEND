import { memo } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import ChatBubble from './ui/ChatBubble'

const MessageList = memo(() => {
  const { messages, selectedUser } = useChatStore()
  const { user } = useAuthStore()

  const currentUserName = (user?.username || user?.name || '').toLowerCase()
  const spacingClass = 'space-y-2'

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to D-Lite
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Select a conversation from the sidebar or search for users to start chatting.
          </p>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No messages yet
          </h3>
          <p className="text-sm text-gray-500">
            Start the conversation with {selectedUser?.username || selectedUser?.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={spacingClass}>
      {messages.map((message) => {
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

        return (
          <ChatBubble
            key={message._id || message.id}
            message={message}
            isOwn={isOwn}
            senderName={!isOwn ? senderName : null}
            timestamp={message.timestamp || message.createdAt}
          />
        )
      })}
    </div>
  )
})

MessageList.displayName = 'MessageList'

export default MessageList
