import { useAuth } from '../auth/AuthProvider'
import { LogOut } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img
              src="/fresh-logo.svg"
              alt="Fresh Consulting"
              className="h-10"
            />
            <div className="border-l border-gray-300 h-8"></div>
            <h1 className="text-xl font-bold text-gray-darkest">
              Requirements Manager
            </h1>
          </div>

          {/* User Info and Sign Out */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-darkest">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-mid">{user.email}</p>
              </div>
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="h-10 w-10 rounded-full"
                />
              )}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-mid hover:text-gray-darkest hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
