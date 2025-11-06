// main.tsx - Entry point (UPDATED FOR SPRINT 2)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Sprint2App } from './Sprint2App'
import { AuthProvider } from './components/auth/AuthProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Sprint2App />
    </AuthProvider>
  </StrictMode>,
)
