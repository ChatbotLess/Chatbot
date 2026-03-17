import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoutesApp } from './RoutesApp'
import AuthProvider from './context/AuthProvider/AuthProvider'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RoutesApp/>
    </AuthProvider>
  </StrictMode>
)
