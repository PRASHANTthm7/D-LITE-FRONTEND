import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { PresenceProvider } from './contexts/PresenceContext'
import { AIProvider } from './contexts/AIContext'
import { SentientProvider } from './sentient/SentientProvider'
import { UXEngineProvider } from './uxEngine'
import ErrorBoundary from './components/ErrorBoundary'
import logger from './utils/logger'
import { validateEnvironment } from './utils/envValidator'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import './index.css'
import './uxEngine/uxEngine.css'

function App() {
  const { isAuthenticated, initAuth } = useAuthStore()

  useEffect(() => {
    // Validate environment variables
    const envValidation = validateEnvironment()
    if (!envValidation.isValid) {
      logger.warn('Environment validation failed', {
        missing: envValidation.missing
      })
    }

    // Initialize auth
    initAuth().catch(error => {
      logger.error('Failed to initialize auth', { error: error.message })
    })
  }, [initAuth])

  return (
    <ErrorBoundary>
      <Router>
        <PresenceProvider>
          <AIProvider>
            <SentientProvider>
              <UXEngineProvider>
                <Routes>
                  <Route 
                    path="/" 
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} 
                  />
                  <Route 
                    path="/login" 
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
                  />
                  <Route 
                    path="/register" 
                    element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} 
                  />
                  <Route 
                    path="/dashboard" 
                    element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/chat" 
                    element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} 
                  />
                </Routes>
              </UXEngineProvider>
            </SentientProvider>
          </AIProvider>
        </PresenceProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
