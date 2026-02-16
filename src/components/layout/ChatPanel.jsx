import { memo } from 'react'

const ChatPanel = memo(({ 
  header, 
  children, 
  input, 
  focusMode = false 
}) => {
  return (
    <div 
      className={`flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-50/50 to-white/50 transition-all duration-300 ux-focus-chat ${
        focusMode ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {/* Header */}
      {header && (
        <div className="px-6 py-4 border-b border-gray-200/60 bg-white/40 backdrop-blur-sm">
          {header}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: 'calc(1.5rem * var(--ux-spacing-multiplier))' }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col"
          style={{ gap: 'var(--ux-chat-gap)' }}
        >
          {children}
        </div>
      </div>

      {/* Input */}
      {input && (
        <div
          className="px-6 py-4 border-t border-gray-200/60 bg-white/40 backdrop-blur-sm ux-input-container"
          style={{ paddingTop: 'calc(1rem * var(--ux-spacing-multiplier))' }}
        >
          <div className="max-w-4xl mx-auto">
            {input}
          </div>
        </div>
      )}
    </div>
  )
})

ChatPanel.displayName = 'ChatPanel'

export default ChatPanel
