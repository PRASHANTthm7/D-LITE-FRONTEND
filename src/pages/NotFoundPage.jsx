import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return
    hasRedirected.current = true

    // Check if we have a referrer or previous page
    const referrer = document.referrer
    const hasHistory = window.history.length > 1

    // Try to go back in history if available
    if (hasHistory && referrer && !referrer.includes(location.pathname)) {
      // Go back to previous page
      navigate(-1)
    } else {
      // If no valid history, redirect to appropriate page based on auth status
      const fallbackRoute = isAuthenticated ? '/dashboard' : '/'
      navigate(fallbackRoute, { replace: true })
    }
  }, [navigate, isAuthenticated, location.pathname])

  // Show a brief loading message while redirecting
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default NotFoundPage
