export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function passesLuhnCheck(cardNumber) {
  const digits = digitsOnly(cardNumber)
  if (!digits) return false

  let sum = 0
  let alternate = false

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(digits[i], 10)
    if (Number.isNaN(digit)) return false

    if (alternate) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    alternate = !alternate
  }

  return sum % 10 === 0
}

function isVisaNumber(digits) {
  return /^4\d{15}$/.test(digits) && passesLuhnCheck(digits)
}

function isMastercardNumber(digits) {
  if (!/^\d{16}$/.test(digits)) return false

  const prefix2 = parseInt(digits.slice(0, 2), 10)
  const prefix4 = parseInt(digits.slice(0, 4), 10)

  if (prefix2 >= 51 && prefix2 <= 55) {
    return passesLuhnCheck(digits)
  }

  if (prefix4 >= 2221 && prefix4 <= 2720) {
    return passesLuhnCheck(digits)
  }

  return false
}

export function isValidPaymentCardNumber(cardNumber) {
  const digits = digitsOnly(cardNumber)
  return isVisaNumber(digits) || isMastercardNumber(digits)
}

export function detectCardBrand(cardNumber) {
  const digits = digitsOnly(cardNumber)
  if (!digits) return null

  if (digits.startsWith('4')) return 'visa'
  if (digits.startsWith('5')) return 'mastercard'

  if (digits.startsWith('2')) {
    if (digits.length < 4) return 'mastercard'

    const prefix4 = parseInt(digits.slice(0, 4), 10)
    if (prefix4 >= 2221 && prefix4 <= 2720) return 'mastercard'
    return null
  }

  return null
}

export function getCardNumberError(cardNumber) {
  const digits = digitsOnly(cardNumber)

  if (!/^\d{16}$/.test(digits)) {
    return 'number'
  }

  if (!isValidPaymentCardNumber(cardNumber)) {
    return 'fakeCard'
  }

  return null
}

export function getLiveCardNumberError(cardNumber) {
  const digits = digitsOnly(cardNumber)
  if (digits.length < 16) return null

  if (!isValidPaymentCardNumber(cardNumber)) {
    return 'fakeCard'
  }

  return null
}

export function isCardNumberValid(cardNumber) {
  return getCardNumberError(cardNumber) === null
}

export function isExpiryValid(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false

  const [mm, yy] = expiry.split('/').map((part) => parseInt(part, 10))
  if (mm < 1 || mm > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (yy < currentYear) return false
  if (yy === currentYear && mm < currentMonth) return false

  return true
}

export function isCvvValid(cvv) {
  return /^\d{3}$/.test(String(cvv || ''))
}

export function isHolderNameValid(name) {
  return String(name || '').trim().length >= 2
}

export function validateCardForm({ holderName, number, expiry, cvv }) {
  const errors = {}

  if (!isHolderNameValid(holderName)) {
    errors.holderName = 'holderName'
  }

  const numberError = getCardNumberError(number)
  if (numberError) {
    errors.number = numberError
  }

  if (!isExpiryValid(expiry)) {
    errors.expiry = 'expiry'
  }

  if (!isCvvValid(cvv)) {
    errors.cvv = 'cvv'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
