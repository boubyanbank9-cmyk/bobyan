import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const defaultSettings = {
  brand_name: 'Tamwilcom',
  brand_name_ar: 'تمويلكم',
  brand_subtitle: 'Digital Financing Solutions',
  brand_subtitle_ar: 'حلول تمويل إلكترونية',
  logo_url: '',
  hero_title: '',
  hero_subtitle: '',
  hero_badge: '',
  hero_image_url: '',
  phone: '+96500000000',
  whatsapp: '+96500000000',
  email: 'support@tamweelcom.site',
  address: 'Kuwait',
  address_ar: 'الكويت',
  hours: 'Available daily',
  hours_ar: 'متاح يوميًا',
  deposit_amount: 1,
  delivery_free: true,
  footer_description: '',
  footer_description_ar: '',
  social_instagram: '',
  social_facebook: '',
  paymob_enabled: false,
  content_json: {},
}

function mergeSettings(data) {
  if (!data || typeof data !== 'object') return defaultSettings
  const hasLegacyBrand = /alain|العين|water/i.test(
    `${data.brand_name || ''} ${data.brand_name_ar || ''} ${data.email || ''} ${data.address || ''}`
  )

  return {
    ...defaultSettings,
    ...(hasLegacyBrand ? {} : data),
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
