import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import logger from './utils/logger'
import { validateEnvironment } from './utils/envValidator'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import './index.css'

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
        <Routes>
          <Route 
            path="/" 
            element={
              <ErrorBoundary>
                {isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />}
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/login" 
            element={
              <ErrorBoundary>
                {!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ErrorBoundary>
                {!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />}
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ErrorBoundary>
                {isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ErrorBoundary>
                {isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
              </ErrorBoundary>
            } 
          />
          {/* Catch-all route for 404 - redirects to previous page */}
          <Route 
            path="*" 
            element={
              <ErrorBoundary>
                <NotFoundPage />
              </ErrorBoundary>
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
