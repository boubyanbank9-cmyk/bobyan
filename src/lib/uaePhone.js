/** UAE mobile: +971 then 9 digits starting with 5 (05XXXXXXXX). */

export function sanitizeUaePhoneInput(input) {
  let digits = String(input || '').replace(/\D/g, '')

  if (digits.startsWith('00971')) digits = digits.slice(5)
  else if (digits.startsWith('971')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)

  return digits.slice(0, 9)
}

export function normalizeUaePhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  if (!digits) return null

  let national = ''

  if (digits.startsWith('00971') && digits.length >= 14) {
    national = digits.slice(5, 14)
  } else if (digits.startsWith('971') && digits.length >= 12) {
    national = digits.slice(3, 12)
  } else if (digits.startsWith('05') && digits.length === 10) {
    national = digits.slice(1)
  } else if (digits.length === 9) {
    national = digits
  } else {
    return null
  }

  if (!/^5\d{8}$/.test(national)) {
    return null
  }

  return `+971${national}`
}

export function formatUaePhoneDisplay(input) {
  const normalized = normalizeUaePhone(input)
  if (!normalized) {
    return sanitizeUaePhoneInput(input)
  }

  const national = normalized.slice(4)
  return `${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`
}

export function isValidUaePhone(input) {
  return normalizeUaePhone(input) !== null
}

export function formatUaePhoneForDisplay(stored) {
  const normalized = normalizeUaePhone(stored)
  if (!normalized) return stored || '—'
  const national = normalized.slice(4)
  return `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`
}

// Backwards-compatible aliases while imports migrate
export const sanitizeOmaniPhoneInput = sanitizeUaePhoneInput
export const normalizeOmaniPhone = normalizeUaePhone
export const formatOmaniPhoneDisplay = formatUaePhoneDisplay
export const isValidOmaniPhone = isValidUaePhone
export const formatOmaniPhoneForDisplay = formatUaePhoneForDisplay
