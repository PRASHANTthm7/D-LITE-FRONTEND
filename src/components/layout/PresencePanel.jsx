import { memo } from 'react'

const PresencePanel = memo(({ children, isCollapsed = false }) => {
  if (isCollapsed) return null

  return (
    <div className="w-64 flex-shrink-0 bg-white/30 backdrop-blur-md rounded-l-3xl border-l border-white/30 shadow-soft p-4 transition-all duration-[400ms] ease-in-out ux-panel ux-focus-hidden">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Now</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
})

PresencePanel.displayName = 'PresencePanel'

export default PresencePanel
