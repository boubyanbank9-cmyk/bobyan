import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { SiteSettingsProvider } from './hooks/useSiteSettings'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <SiteSettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </StrictMode>
)
