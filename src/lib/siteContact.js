export const SITE_EMAIL = 'help@alainwater.com'
export const SITE_PHONE = '80025246'
export const SITE_WHATSAPP = '+97180025246'

const LEGACY_EMAILS = ['myahalwaht430@gmail.com', 'Ainalalain@gmail.com']
const LEGACY_PHONES = ['+96893649190', '96893649190', '93649190', '+96895330047', '96895330047']

export function getSiteContact() {
  return {
    phone: SITE_PHONE,
    whatsapp: SITE_WHATSAPP,
    email: SITE_EMAIL,
  }
}

export function applySiteContactToSettings(settings = {}) {
  return {
    ...settings,
    phone: SITE_PHONE,
    whatsapp: SITE_WHATSAPP,
    email: SITE_EMAIL,
  }
}

export function replaceLegacyContact(text) {
  if (!text || typeof text !== 'string') return text

  let result = text
  for (const legacy of LEGACY_EMAILS) {
    result = result.replace(new RegExp(legacy.replace(/\./g, '\\.'), 'gi'), SITE_EMAIL)
  }
  for (const legacy of LEGACY_PHONES) {
    result = result.replace(new RegExp(legacy.replace('+', '\\+'), 'g'), SITE_PHONE)
  }
  return result
}
