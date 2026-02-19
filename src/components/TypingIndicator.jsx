import { memo } from 'react'
import AuraAvatar from './ui/AuraAvatar'

const TypingIndicator = memo(({ users = [] }) => {
  if (!users || users.length === 0) return null

  return (
    <div className="flex items-end gap-2 mb-2 px-3 animate-fade-in">
      {users.length === 1 && (
        <div className="flex-shrink-0 mb-1">
          <AuraAvatar
            userId={users[0].id || users[0]._id}
            name={users[0].username || users[0].name || 'User'}
            size="sm"
            online={true}
          />
        </div>
      )}
      <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm animate-fade-in">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }}></div>
          </div>
          {users.length > 1 && (
            <span className="text-xs text-gray-500 ml-2">
              {users.length} people typing...
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

TypingIndicator.displayName = 'TypingIndicator'

export default TypingIndicator
