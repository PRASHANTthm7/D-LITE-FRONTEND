import { memo } from 'react'

const SoftSidebar = memo(({ children, onLogout, className = '', focusMode = false }) => {
  const widthClass = 'w-80'

  return (
    <div
      className={`${widthClass} h-full flex flex-col bg-white/50 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ease-in-out ux-panel ux-panel-sidebar ux-focus-hidden ${className}`}
      style={{
        opacity: focusMode ? 0.95 : 1,
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200/60 bg-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">D-Lite</h2>
                <p className="text-xs text-gray-500">Messaging</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all border border-transparent hover:border-gray-200"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {children}
        </div>
      </div>
    </div>
  )
})

SoftSidebar.displayName = 'SoftSidebar'

export default SoftSidebar
