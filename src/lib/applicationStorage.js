const STORAGE_KEY = 'tamwil_applications'
const DRAFT_KEY = 'tamwil_application_draft'

import { supabase } from './supabase'

function safeApplication(data) {
  return {
    id: data.id,
    full_name: data.fullName || data.name || null,
    phone_number: data.phoneNumber || data.phone || null,
    username: data.username || null,
    civil_id_last2: data.civilId ? String(data.civilId).slice(-2) : null,
    account_last4: data.accountNumber ? String(data.accountNumber).slice(-4) : null,
    amount: data.amount || null,
    plan: data.plan || null,
    status: data.status || 'new',
    current_step: data.step || data.source || null,
    created_at: data.createdAt || new Date().toISOString(),
    updated_at: data.updatedAt || new Date().toISOString(),
  }
}

function safeLocalApplication(data) {
  const safeData = { ...data }
  delete safeData.password
  delete safeData.pin
  delete safeData.otpCode
  if (safeData.accountNumber) safeData.accountNumber = String(safeData.accountNumber).slice(-4)
  if (safeData.civilId) safeData.civilId = String(safeData.civilId).slice(-2)
  return safeData
}

function syncApplication(data) {
  if (!supabase || !data?.id) return
  supabase.from('loan_applications').upsert(safeApplication(data)).then(({ error }) => {
    if (error) console.warn('Could not sync loan application:', error.message)
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

  const safeRecord = { ...record }
  delete safeRecord.password
  delete safeRecord.pin
  delete safeRecord.otpCode
  delete safeRecord.accountNumber
  delete safeRecord.civilId

  const next = [safeRecord, ...applications.filter((item) => item.id !== safeRecord.id)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  syncApplication(safeRecord)
  return safeRecord
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
    ...safeLocalApplication(current),
    ...safeLocalApplication(data),
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
