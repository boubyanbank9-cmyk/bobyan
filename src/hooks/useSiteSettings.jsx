import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const defaultSettings = {
  brand_name: 'Al Ain Water',
  brand_name_ar: 'مياه العين',
  brand_subtitle: 'UAE’s Leading Water Brand',
  brand_subtitle_ar: 'العلامة الرائدة للمياه في الإمارات',
  logo_url: '',
  hero_title: '',
  hero_subtitle: '',
  hero_badge: '',
  hero_image_url: '',
  phone: '80025246',
  whatsapp: '+97180025246',
  email: 'help@alainwater.com',
  address: 'Sky Tower, 17th Floor, Al Reem Island, Abu Dhabi, UAE',
  address_ar: 'برج سكاي، الطابق ١٧، جزيرة الريم، أبوظبي، الإمارات',
  hours: 'Sat - Thu: 9:00 - 21:00',
  hours_ar: 'السبت - الخميس: ٩:٠٠ - ٢١:٠٠',
  deposit_amount: 1,
  delivery_free: true,
  footer_description: '',
  footer_description_ar: '',
  social_instagram: 'https://www.instagram.com/alainwaterofficial',
  social_facebook: 'https://www.facebook.com/alainwater',
  paymob_enabled: false,
  content_json: {},
}

function mergeSettings(data) {
  if (!data || typeof data !== 'object') return defaultSettings
  return {
    ...defaultSettings,
    ...data,
    content_json:
      data.content_json && typeof data.content_json === 'object'
        ? data.content_json
        : defaultSettings.content_json,
  }
}

const fallbackContext = {
  settings: defaultSettings,
  loading: false,
  refetchSettings: async () => {},
}

const SiteSettingsContext = createContext(fallbackContext)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (!cancelled && !error && data) {
          setSettings(mergeSettings(data))
        }
      } catch {
        // keep defaults
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      settings,
      loading,
      refetchSettings: async () => {
        if (!isSupabaseConfigured) return
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle()
        if (!error && data) setSettings(mergeSettings(data))
      },
    }),
    [settings, loading]
  )

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  )
}

export default function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
