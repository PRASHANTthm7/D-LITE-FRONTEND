/**
 * Example Component: Smart Sidebar with UX Engine
 * 
 * This demonstrates how to:
 * 1. Access UX signals (behavior, predictions, focus mode)
 * 2. Use Tailwind utilities for responsive layout
 * 3. Track user interactions
 */

import { useUXEngine } from '../uxEngine'

export const SmartSidebar = ({ chats = [] }) => {
  const {
    signals: {
      prioritizedChats,
      focusMode,
      spacing,
      shouldShowCompositionAssist,
      recentChats,
      frequentChats,
      trackChatAccess,
    },
  } = useUXEngine()

  // Get ordered chats based on UX predictions
  const orderedChats = prioritizedChats.length > 0 ? prioritizedChats : chats.map(c => c.id)

  const handleChatClick = (chatId) => {
    trackChatAccess(chatId)
  }

  if (focusMode) {
    // Focus mode: hide sidebar completely
    return null
  }

  return (
    <aside className="ux-panel ux-panel-sidebar w-64 bg-white dark:bg-slate-900 border-r border-purple-200 dark:border-purple-900/30">
      <div className={`ux-spacing-${spacing} h-full overflow-y-auto`}>
        {/* Header */}
        <div className="p-4 border-b border-purple-100 dark:border-purple-900/20">
          <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            Chats
          </h2>
        </div>

        {/* Priority Section: Predicted Next Chat */}
        {prioritizedChats[0] && (
          <div className="px-3 py-4">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">
              Next
            </p>
            <button
              onClick={() => handleChatClick(prioritizedChats[0])}
              className="ux-chat-item w-full text-left bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800"
            >
              {chats.find(c => c.id === prioritizedChats[0])?.name || 'Chat'}
            </button>
          </div>
        )}

        {/* Recent Chats Section */}
        {recentChats.length > 0 && (
          <div className="px-3 py-4">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Recent
            </p>
            <div className="space-y-2">
              {recentChats.slice(0, 3).map((chatId, idx) => (
                <button
                  key={chatId}
                  onClick={() => handleChatClick(chatId)}
                  className={`ux-chat-item ux-priority-${idx + 1} w-full text-left`}
                >
                  {chats.find(c => c.id === chatId)?.name || 'Chat'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequent Chats Section */}
        {frequentChats.length > 0 && (
          <div className="px-3 py-4">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Frequent
            </p>
            <div className="space-y-2">
              {frequentChats.slice(0, 3).map((chatId, idx) => (
                <button
                  key={chatId}
                  onClick={() => handleChatClick(chatId)}
                  className={`ux-chat-item ux-priority-${idx + 4} w-full text-left text-sm opacity-75 hover:opacity-100`}
                >
                  {chats.find(c => c.id === chatId)?.name || 'Chat'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Chats */}
        <div className="px-3 py-4 border-t border-purple-100 dark:border-purple-900/20">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
            All Chats
          </p>
          <div className="space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="ux-chat-item w-full text-left text-sm p-2 rounded"
              >
                {chat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/**
 * Example: Smart Input Area
 * Expands/collapses based on typing activity
 */
export const SmartInputArea = ({ onSendMessage }) => {
  const {
    signals: {
      inputMode,
      isUserPausing,
      shouldShowCompositionAssist,
      trackTyping,
    },
  } = useUXEngine()

  const handleInput = (e) => {
    trackTyping(e.target.value.length > 0)
  }

  return (
    <div className="ux-input-container ux-input-expandable border-t border-purple-200 dark:border-purple-900/30 bg-white dark:bg-slate-900">
      <div className="p-4">
        {/* Composition Assist - shows when pausing */}
        {isUserPausing && shouldShowCompositionAssist && (
          <div className="ux-smooth-transition mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              💡 Consider adding more details...
            </p>
          </div>
        )}

        {/* Input field */}
        <div className="flex items-end gap-3">
          <input
            type="text"
            onInput={handleInput}
            placeholder="Message..."
            className="flex-1 ux-smooth-transition px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => onSendMessage()}
            className="ux-interaction-button px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: Adaptive Message Container
 * Changes spacing based on activity level
 */
export const AdaptiveMessageContainer = ({ messages }) => {
  const {
    signals: { spacing, focusMode },
  } = useUXEngine()

  return (
    <div
      className={`
        ux-focus-chat
        ux-smooth-transition
        flex-1
        overflow-y-auto
        ${spacing === 'compact' ? 'ux-compact-layout' : 'ux-spacing-normal'}
        ${focusMode ? 'max-w-2xl mx-auto' : ''}
      `}
    >
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`
            ux-smooth-transition
            p-3
            rounded-lg
            mb-2
            ${msg.isMention ? 'ux-attention-mention' : ''}
            ${msg.isReply ? 'ux-attention-reply' : ''}
          `}
        >
          <p className="font-semibold text-purple-900 dark:text-purple-100">
            {msg.author}
          </p>
          <p className="text-slate-700 dark:text-slate-300 mt-1">
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Example: Focus Mode Toggle
 * Shows in header when UX detects prolonged typing
 */
export const FocusModeToggle = () => {
  const {
    signals: { focusMode, focusModeSuggestion, toggleFocusMode },
  } = useUXEngine()

  return (
    <div className="flex items-center gap-2">
      {/* Suggestion Toast */}
      {focusModeSuggestion && (
        <div className="ux-smooth-transition px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {focusModeSuggestion.message}
          </span>
          <button
            onClick={() => toggleFocusMode(true)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
          >
            Enable
          </button>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => toggleFocusMode(!focusMode)}
        className={`
          ux-interaction-button
          px-3 py-2
          text-sm
          font-semibold
          ${focusMode
            ? 'bg-purple-600 text-white'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
          }
        `}
        title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      >
        {focusMode ? '🎯 Focused' : '👁️ Focus'}
      </button>
    </div>
  )
}
