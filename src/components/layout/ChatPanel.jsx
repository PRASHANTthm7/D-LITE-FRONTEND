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
        <div className="px-6 py-4 border-b border-gray-200/60 bg-white/60 backdrop-blur-md shadow-sm sticky top-0 z-10">
          {header}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent via-indigo-50/10 to-purple-50/10"
        style={{ padding: 'calc(1.5rem * var(--ux-spacing-multiplier))' }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col min-h-full justify-end"
          style={{ gap: 'var(--ux-chat-gap)' }}
        >
          {children}
        </div>
      </div>

      {/* Input */}
      {input && (
        <div
          className="px-6 py-4 border-t border-gray-200/60 bg-white/60 backdrop-blur-md shadow-lg sticky bottom-0 z-10 ux-input-container"
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
