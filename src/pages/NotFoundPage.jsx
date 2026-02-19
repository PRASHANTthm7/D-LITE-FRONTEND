import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleGoHome = () => {
    const route = isAuthenticated ? '/dashboard' : '/'
    navigate(route, { replace: true })
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      handleGoHome()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 px-4 py-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-indigo-200 mb-4">404</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go Home
          </button>
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
