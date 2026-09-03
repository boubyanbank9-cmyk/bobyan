import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, translations } from '../data/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar')

  const config = useMemo(
    () => LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0],
    [lang]
  )

  const t = translations[lang] || translations.ar

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = config.dir
  }, [lang, config.dir])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
