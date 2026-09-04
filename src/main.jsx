import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { SiteSettingsProvider } from './hooks/useSiteSettings'
import App from './App'
import './index.css'

const basename = window.location.hostname.endsWith('github.io') ? '/bobyan' : undefined

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <SiteSettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </StrictMode>
)
