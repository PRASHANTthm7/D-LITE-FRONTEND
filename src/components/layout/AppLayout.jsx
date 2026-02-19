import { memo, useState, useEffect } from 'react'
import SoftSidebar from '../ui/SoftSidebar'
import ChatPanel from './ChatPanel'

const AppLayout = memo(({ 
  sidebarContent,
  chatHeader,
  chatContent,
  chatInput,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On mobile, close sidebar by default
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out w-full sm:w-80' : 'relative w-full sm:w-80'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
      `}>
        <SoftSidebar onLogout={onLogout}>
          {sidebarContent}
        </SoftSidebar>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
