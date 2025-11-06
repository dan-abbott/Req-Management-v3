import { useAuth } from '../auth/AuthProvider';
import { Project } from '../../types';
import { ProjectSelector } from '../projects/ProjectSelector';

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export function Header({ projects, selectedProject, onSelectProject, onNewProject }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo and title */}
          <div className="flex items-center gap-4">
            <img 
              src="/Fresh_logo__Suisse.png" 
              alt="Fresh Consulting" 
              className="h-8"
            />
            <div className="border-l border-gray-300 h-8"></div>
            <h1 className="text-xl font-bold text-gray-900">Requirements Manager</h1>
          </div>

          {/* Center: Project selector */}
          <div className="flex-1 flex justify-center px-8">
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={onSelectProject}
              onNewProject={onNewProject}
            />
          </div>

          {/* Right side: User profile and logout */}
          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name || user.email || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#3FB95A] text-white flex items-center justify-center font-semibold">
                  {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
