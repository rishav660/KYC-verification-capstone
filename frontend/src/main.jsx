import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { KYCProvider } from './context/KYCContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KYCProvider>
      <App />
    </KYCProvider>
  </StrictMode>,
)
