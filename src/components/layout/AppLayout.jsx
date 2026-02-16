import { memo } from 'react'
import SentientBackgroundLayer from './SentientBackgroundLayer'
import SoftSidebar from '../ui/SoftSidebar'
import ChatPanel from './ChatPanel'
import PresencePanel from './PresencePanel'
import { useSentient } from '../../sentient/SentientProvider'

const AppLayout = memo(({ 
  sidebarContent,
  chatHeader,
  chatContent,
  chatInput,
  presenceContent,
  onLogout,
}) => {
  const { focusModeActive, uiMode } = useSentient()

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Sentient Background Layer */}
      <SentientBackgroundLayer />

      {/* Sidebar */}
      <SoftSidebar onLogout={onLogout}>
        {sidebarContent}
      </SoftSidebar>

      {/* Main Chat Area */}
      <ChatPanel 
        header={chatHeader}
        input={chatInput}
        focusMode={focusModeActive}
      >
        {chatContent}
      </ChatPanel>

      {/* Presence Panel (hidden in minimal/whisper mode) */}
      {uiMode !== 'minimal' && uiMode !== 'whisper' && (
        <PresencePanel isCollapsed={focusModeActive}>
          {presenceContent}
        </PresencePanel>
      )}
    </div>
  )
})

AppLayout.displayName = 'AppLayout'

export default AppLayout
