import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './components/auth/AuthProvider'
import Sprint3App from './Sprint3App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Sprint3App />
    </AuthProvider>
  </React.StrictMode>,
)
