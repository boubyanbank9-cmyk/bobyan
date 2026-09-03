// Public client credentials — must come from THIS project's .env only.
// No hardcoded fallbacks (keeps dashboards independent).

function clean(value) {
  return String(value || '').trim()
}

const rawUrl = clean(import.meta.env.VITE_SUPABASE_URL)
const rawKey = clean(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)

function isUsableConfig(url, key) {
  if (!url || !key) return false
  if (/your-project/i.test(url)) return false
  if (key.includes('...') || key.length < 40) return false
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url.replace(/\/$/, ''))
}

export const SUPABASE_URL = isUsableConfig(rawUrl, rawKey) ? rawUrl.replace(/\/$/, '') : ''
export const SUPABASE_ANON_KEY = isUsableConfig(rawUrl, rawKey) ? rawKey : ''
