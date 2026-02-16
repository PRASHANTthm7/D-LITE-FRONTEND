import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.username || user?.name}!</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-6 bg-gradient-to-br from-indigo-400 to-purple-400 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold">Open Chat</div>
                <div className="text-xs mt-1 opacity-90">View conversations & messages</div>
              </button>
              <div className="p-6 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg opacity-75">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">My Profile</div>
                <div className="text-xs mt-1 opacity-90">Coming soon</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-lg opacity-75">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs mt-1 opacity-90">Coming soon</div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🔒 Privacy & Security</h3>
            <p className="text-sm text-gray-600">
              Your conversations are private and secure. Only you and the people you chat with can see your messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
