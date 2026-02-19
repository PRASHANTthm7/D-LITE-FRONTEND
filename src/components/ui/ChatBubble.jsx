import { memo } from 'react'
import AuraAvatar from './AuraAvatar'

const ChatBubble = memo(({ 
  message, 
  isOwn, 
  senderName,
  mood = 'balanced',
  timestamp,
  attentionType = null,
  showAvatar = true,
}) => {
  const attentionClass = {
    mention: 'ring-2 ring-indigo-400/50 shadow-indigo-200/50',
    reply: 'ring-2 ring-purple-300/50 shadow-purple-200/50',
    'focus-chat': 'ring-1 ring-gray-300/50',
  }[attentionType] || ''
  
  const messageTime = timestamp ? new Date(timestamp) : null
  const isToday = messageTime && messageTime.toDateString() === new Date().toDateString()
  const timeDisplay = messageTime 
    ? (isToday 
        ? messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : messageTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
    : null
  
  return (
    <div
      className={`flex items-end gap-2 mb-2 transition-all duration-300 ease-out px-3 group ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mb-1">
          <AuraAvatar
            userId={message.sender_id || message.senderId}
            name={senderName || 'User'}
            size="sm"
            online={false}
          />
        </div>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[70%]`}>
        {/* Sender name for received messages */}
        {!isOwn && senderName && (
          <div className="text-xs font-semibold text-gray-600 mb-1 px-1">
            {senderName}
          </div>
        )}
        
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 ease-out transform hover:scale-[1.01] ${
            isOwn
              ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200/80 text-gray-800 rounded-bl-md shadow-md'
          } ${attentionClass} group-hover:shadow-lg`}
          style={{ willChange: 'transform, box-shadow' }}
        >
          {/* Message content */}
          <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isOwn ? 'text-white' : 'text-gray-800'
          }`}>
            {message.content || message.text || ''}
          </div>
          
          {/* Timestamp and read receipt */}
          <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${
            isOwn ? 'text-white/70' : 'text-gray-500'
          }`}>
            <span className="font-medium">
              {timeDisplay}
            </span>
            {isOwn && (
              <div className="flex items-center gap-0.5">
                {message.read ? (
                  <svg className="w-3.5 h-3.5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Avatar for sent messages (optional, can be hidden) */}
      {isOwn && showAvatar && false && (
        <div className="flex-shrink-0 mb-1">
          <AuraAvatar
            userId={message.sender_id || message.senderId}
            name="You"
            size="sm"
            online={false}
          />
        </div>
      )}
    </div>
  )
})

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
