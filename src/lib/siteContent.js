export function pickLocalized(settings, field, lang) {
  if (!settings) return ''
  const isAr = lang === 'ar' || lang === 'ur'
  const arValue = settings[`${field}_ar`]
  const value = settings[field]
  if (isAr && arValue) return arValue
  return value || ''
}

export function pickBrandName(settings, t, lang) {
  const fromDb = pickLocalized(settings, 'brand_name', lang)
  return fromDb || (lang === 'ar' || lang === 'ur' ? t.brandAr : t.brand)
}

export function pickBrandSubtitle(settings, t, lang) {
  const fromDb = pickLocalized(settings, 'brand_subtitle', lang)
  if (fromDb) return fromDb
  return lang === 'ar' || lang === 'ur' ? t.brandAr : t.brand
}
