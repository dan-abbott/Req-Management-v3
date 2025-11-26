import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: {
    email: string | null;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  session: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const signInWithGoogle = async () => {
    // Clerk handles OAuth via UI components, not programmatically
    // This will be handled by the SignIn component
    console.log('Sign in handled by Clerk UI');
  };

  const { signOut: clerkSignOut } = useClerkAuth();

  const signOut = async () => {
    await clerkSignOut();
  };

  // Transform Clerk user to match Supabase format
  const user = isSignedIn && clerkUser ? {
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    user_metadata: {
      full_name: clerkUser.fullName || undefined,
      avatar_url: clerkUser.imageUrl || undefined,
    }
  } : null;

  const value = {
    user,
    session: isSignedIn ? { user } : null,
    loading: !isLoaded,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ClerkProvider>
  );
}