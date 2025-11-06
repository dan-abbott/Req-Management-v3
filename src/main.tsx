import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Sprint2App }from './Sprint2App.tsx'
import { AuthProvider } from './components/auth/AuthProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

