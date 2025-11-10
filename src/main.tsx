// main.tsx - Entry point (UPDATED FOR SPRINT 2)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Sprint2App } from './Sprint2App'
import { AuthProvider } from './components/auth/AuthProvider'
import './index.css'
import App from './App.tsx'  // Should be App, not Sprint2App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />  // ← This is correct
  </React.StrictMode>
)

