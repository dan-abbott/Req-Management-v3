/**
 * Get current user info from Clerk
 * This accesses Clerk's global state
 */
export function getCurrentUser(): { email: string; name: string } {
  // Access Clerk's global user object
  const clerk = (window as any).Clerk;
  
  if (clerk?.user) {
    return {
      email: clerk.user.primaryEmailAddress?.emailAddress || 'unknown@example.com',
      name: clerk.user.fullName || clerk.user.firstName || 'Unknown User'
    };
  }
  
  // Fallback if Clerk not loaded yet
  return {
    email: 'unknown@example.com',
    name: 'Unknown User'
  };
}