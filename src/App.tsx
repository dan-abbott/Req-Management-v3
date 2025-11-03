import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginPage } from './components/auth/LoginPage'
import { Header } from './components/layout/Header'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green mx-auto mb-4"></div>
          <p className="text-gray-mid">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-light">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-darkest mb-4">
            Welcome to Requirements Manager
          </h2>
          <p className="text-gray-mid mb-6">
            Sprint 0 Foundation Complete! 🎉
          </p>
          <div className="bg-fresh-green bg-opacity-10 border-l-4 border-fresh-green p-4 rounded">
            <h3 className="font-semibold text-gray-darkest mb-2">
              Authentication Working
            </h3>
            <ul className="text-sm text-gray-dark space-y-1">
              <li>✅ Google OAuth configured</li>
              <li>✅ User authenticated successfully</li>
              <li>✅ Fresh Consulting branding applied</li>
              <li>✅ Ready for Sprint 1</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-darkest mb-2">
              Your Profile:
            </h4>
            <p className="text-sm text-gray-dark">
              <strong>Name:</strong> {user.user_metadata?.full_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-dark">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
