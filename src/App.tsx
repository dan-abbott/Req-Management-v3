// App.tsx - Main application wrapper with authentication

import { AuthProvider } from './components/auth/AuthProvider';
import { Sprint2App } from './Sprint2App';

function App() {
  return (
    <AuthProvider>
      <Sprint2App />
    </AuthProvider>
  );
}

export default App;
