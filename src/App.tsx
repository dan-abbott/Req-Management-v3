import { useAuth } from './components/auth/AuthProvider';
import { Sprint2App } from './Sprint2App';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FB95A]"></div>
      </div>
    );
  }

  // If authenticated, show Sprint 1 app
  if (user) {
    return <Sprint2App />;
  }

  // Not authenticated - this shouldn't happen if AuthProvider redirects properly
  // But just in case, show a simple message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <p className="text-gray-600">Redirecting to authentication...</p>
      </div>
    </div>
  );
}

export default App;
