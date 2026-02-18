import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import AuraAvatar from './ui/AuraAvatar'

const ChatBubble = memo(({ 
  user, 
  lastMessage, 
  unreadCount = 0, 
  isOnline = false,
  onClick 
}) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick(user)
    } else {
      // Navigate to chat page with user selected
      navigate('/chat', { state: { selectedUserId: user.id || user._id } })
    }
  }

  const userName = user?.username || user?.name || 'Unknown User'
  const messagePreview = lastMessage?.content || lastMessage?.text || 'No messages yet'
  const messageTime = lastMessage?.timestamp || lastMessage?.createdAt
  const formattedTime = messageTime 
    ? new Date(messageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-4 bg-white/80 hover:bg-white rounded-xl border border-gray-200/60 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md group"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <AuraAvatar
          userId={user?.id || user?._id}
          avatarUrl={user?.avatar || user?.avatarUrl}
          name={userName}
          size="md"
          online={isOnline}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-md ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-800 text-sm truncate">
            {userName}
          </span>
          {formattedTime && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formattedTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 truncate flex-1">
            {messagePreview}
          </p>
          {isOnline && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <svg
        className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
})

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
