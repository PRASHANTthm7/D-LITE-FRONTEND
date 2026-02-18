import { memo } from 'react'

const ChatBubble = memo(({ 
  message, 
  isOwn, 
  senderName,
  mood = 'balanced',
  timestamp,
  attentionType = null,
}) => {
  const attentionClass = {
    mention: 'ring-1 ring-indigo-300/60',
    reply: 'ring-1 ring-purple-200/70',
    'focus-chat': 'ring-1 ring-gray-200/80',
  }[attentionType] || ''
  
  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 transition-all duration-200`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-[1.125rem] py-[0.875rem] ${
          isOwn
            ? 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white'
            : 'bg-white/70 backdrop-blur-sm text-gray-800'
        } shadow-md transition-all duration-300 hover:shadow-lg ${attentionClass}`}
      >
        {!isOwn && senderName && (
          <div className="text-xs font-medium mb-1 opacity-75">
            {senderName}
          </div>
        )}
        <div className="text-sm leading-[1.6] whitespace-pre-wrap break-words">
          {message.content || message.text}
        </div>
        {timestamp && (
          <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
})

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
