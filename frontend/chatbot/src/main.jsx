import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoutesApp } from './RoutesApp'
import AuthProvider from './context/AuthProvider/AuthProvider'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={client}> 
      <AuthProvider>
        <RoutesApp/>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
