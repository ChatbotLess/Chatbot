import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoutesApp } from './RoutesApp'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutesApp/>
  </StrictMode>
)
