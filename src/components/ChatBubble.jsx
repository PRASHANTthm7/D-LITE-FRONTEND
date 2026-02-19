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
      className={`w-full flex items-center gap-4 p-4 bg-white/90 hover:bg-white rounded-xl border transition-all duration-300 ease-out shadow-sm hover:shadow-lg group transform hover:scale-[1.01] ${
        unreadCount > 0 
          ? 'border-indigo-300/60 hover:border-indigo-400 bg-indigo-50/30' 
          : 'border-gray-200/60 hover:border-gray-300'
      }`}
      style={{ willChange: 'transform, box-shadow' }}
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
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        )}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5 flex items-center justify-center px-1.5 shadow-lg ring-2 ring-white animate-pulse-slow transform transition-transform duration-300 group-hover:scale-110">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`font-semibold text-sm truncate ${
            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {userName}
          </span>
          {formattedTime && (
            <span className={`text-xs flex-shrink-0 ml-2 ${
              unreadCount > 0 ? 'text-indigo-600 font-medium' : 'text-gray-400'
            }`}>
              {formattedTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate flex-1 ${
            unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'
          }`}>
            {messagePreview}
          </p>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="flex-shrink-0">
        {unreadCount > 0 ? (
          <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform duration-300 ease-out"></div>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  )
})

ChatBubble.displayName = 'ChatBubble'

export default ChatBubble
