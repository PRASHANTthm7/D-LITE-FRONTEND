import { memo } from 'react'
import SoftSidebar from '../ui/SoftSidebar'
import ChatPanel from './ChatPanel'

const AppLayout = memo(({ 
  sidebarContent,
  chatHeader,
  chatContent,
  chatInput,
  onLogout,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Sidebar */}
      <SoftSidebar onLogout={onLogout}>
        {sidebarContent}
      </SoftSidebar>

      {/* Main Chat Area */}
      <ChatPanel 
        header={chatHeader}
        input={chatInput}
      >
        {chatContent}
      </ChatPanel>
    </div>
  )
})

AppLayout.displayName = 'AppLayout'

export default AppLayout
