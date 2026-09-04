import { isSupabaseConfigured, supabase } from './supabase'

const HEARTBEAT_MS = 8000
const STALE_SECONDS = 25
let heartbeatTimer
let visitorId

const EMPTY_PRESENCE_STATS = {
  loanSelection: 0,
  phone: 0,
  username: 0,
  account: 0,
  password: 0,
  otp: 0,
  online: 0,
}

function asCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count >= 0 ? count : 0
}

function normalizePresenceStats(data) {
  const source = Array.isArray(data) ? data[0] || {} : data || {}
  return {
    loanSelection: asCount(source.loanSelection ?? source.loan_selection),
    phone: asCount(source.phone),
    username: asCount(source.username),
    account: asCount(source.account),
    password: asCount(source.password),
    otp: asCount(source.otp),
    online: asCount(source.online),
  }
}

export const PRESENCE_STAGES = {
  visitor: 'visitor', loanSelection: 'loan_selection', phone: 'phone_verification',
  username: 'username_verification', account: 'account_verification',
  password: 'password_verification', otp: 'otp_verification',
}

function getVisitorId() {
  if (visitorId) return visitorId
  visitorId = localStorage.getItem('tamwil_presence_id') || crypto.randomUUID?.()
  if (!visitorId) visitorId = `00000000-0000-4000-8000-${Date.now().toString().padStart(12, '0').slice(-12)}`
  localStorage.setItem('tamwil_presence_id', visitorId)
  return visitorId
}

export function getStageFromPath(pathname = '/') {
  if (pathname === '/register') return PRESENCE_STAGES.loanSelection
  if (pathname === '/phone-verification') return PRESENCE_STAGES.phone
  if (pathname === '/continue-application') return PRESENCE_STAGES.username
  if (pathname === '/continue-application-step-2') return PRESENCE_STAGES.account
  if (pathname === '/continue-application-step-3') return PRESENCE_STAGES.password
  if (pathname === '/otp-verification') return PRESENCE_STAGES.otp
  return PRESENCE_STAGES.visitor
}

async function touch(stage, path) {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.rpc('touch_live_session', {
    p_visitor_id: getVisitorId(), p_stage: stage, p_path: path,
  })
  if (error) console.warn('Presence update failed:', error.message)
}

export function startVisitorPresence(stage, path) {
  if (typeof window === 'undefined') return
  window.clearInterval(heartbeatTimer)
  touch(stage, path)
  heartbeatTimer = window.setInterval(() => touch(stage, path), HEARTBEAT_MS)
}

export function stopVisitorPresence() {
  window.clearInterval(heartbeatTimer)
  heartbeatTimer = undefined
  if (isSupabaseConfigured && supabase && visitorId) supabase.rpc('clear_live_session', { p_visitor_id: visitorId })
}

export function subscribeToLivePresenceStats(setStats, setConnected, setSetupRequired) {
  if (!isSupabaseConfigured || !supabase) return undefined
  let active = true
  const load = async () => {
    const { data, error } = await supabase.rpc('get_live_session_stats', { p_stale_seconds: STALE_SECONDS })
    if (!active) return
    if (error) {
      setConnected(false)
      setSetupRequired(error.message.includes('function') || error.message.includes('live_visitor_sessions'))
      return
    }
    setStats({ ...EMPTY_PRESENCE_STATS, ...normalizePresenceStats(data) })
    setConnected(true)
    setSetupRequired(false)
  }
  load()
  const interval = window.setInterval(load, HEARTBEAT_MS)
  const channel = supabase.channel('live-presence-admin')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_visitor_sessions' }, load)
    .subscribe()
  return () => { active = false; window.clearInterval(interval); supabase.removeChannel(channel) }
}