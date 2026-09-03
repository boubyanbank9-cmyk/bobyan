const STORAGE_KEY = 'tamwil_applications'
const DRAFT_KEY = 'tamwil_application_draft'

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

  const next = [record, ...applications.filter((item) => item.id !== record.id)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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

  const next = { ...current, ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  return next
}

export function clearDraftApplication() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_KEY)
}
