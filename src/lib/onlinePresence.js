import { isSupabaseConfigured, presenceSupabase, supabase } from './supabase'

export const VISITORS_CHANNEL = 'alain-online-visitors'
export const PRESENCE_HEARTBEAT_MS = 3000
export const PRESENCE_STALE_MS = 20000
export const ADMIN_PRESENCE_POLL_MS = 500

export const PRESENCE_STAGES = {
  visitor: 'visitor',
  checkoutPersonal: 'checkout_personal',
  checkoutDelivery: 'checkout_delivery',
  checkoutPayment: 'checkout_payment',
  checkoutOtp: 'checkout_otp',
}

const VISITOR_ID_KEY = 'alain_visitor_id'

let memoryVisitorId = null
let visitorHeartbeatTimer = null
let visitorActive = false
let visitorPageListenersAttached = false
let visitorPayload = {
  stage: PRESENCE_STAGES.visitor,
  path: '/',
}

let adminPollTimer = null
const statsListeners = new Set()
const connectionListeners = new Set()
const setupListeners = new Set()

const EMPTY_STATS = {
  visitors: 0,
  personal: 0,
  delivery: 0,
  payment: 0,
  otp: 0,
  online: 0,
}

export function getVisitorId() {
  try {
    let id = sessionStorage.getItem(VISITOR_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(VISITOR_ID_KEY, id)
    }
    return id
  } catch {
    if (!memoryVisitorId) {
      memoryVisitorId = crypto.randomUUID()
    }
    return memoryVisitorId
  }
}

export function getStageFromPath(pathname) {
  if (pathname === '/checkout/otp' || pathname === '/checkout/payment-failed') {
    return PRESENCE_STAGES.checkoutOtp
  }
  if (pathname === '/checkout/confirm') {
    return PRESENCE_STAGES.checkoutPayment
  }
  if (pathname === '/checkout') {
    return PRESENCE_STAGES.checkoutPersonal
  }
  if (pathname.startsWith('/checkout')) {
    return PRESENCE_STAGES.checkoutPersonal
  }
  return PRESENCE_STAGES.visitor
}

export function getNeighborhoodPresenceStats(payload) {
  if (!payload || typeof payload !== 'object') return EMPTY_STATS
  return {
    visitors: Number(payload.visitors) || 0,
    personal: Number(payload.personal) || 0,
    delivery: Number(payload.delivery) || 0,
    payment: Number(payload.payment) || 0,
    otp: Number(payload.otp) || 0,
    online: Number(payload.online) || 0,
  }
}

function staleSeconds() {
  return Math.max(5, Math.floor(PRESENCE_STALE_MS / 1000))
}

function isSetupError(error) {
  if (!error) return false
  const message = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase()
  return (
    error.code === 'PGRST202'
    || error.code === 'PGRST205'
    || error.code === '42883'
    || error.code === '42P01'
    || message.includes('get_live_session_stats')
    || message.includes('touch_live_session')
    || message.includes('live_visitor_sessions')
  )
}

async function upsertLiveSession() {
  if (!visitorActive || !presenceSupabase) return false

  const { error } = await presenceSupabase.rpc('touch_live_session', {
    p_visitor_id: getVisitorId(),
    p_stage: visitorPayload.stage,
    p_path: visitorPayload.path,
  })

  return !error
}

async function removeLiveSession() {
  if (!presenceSupabase) return

  await presenceSupabase.rpc('clear_live_session', {
    p_visitor_id: getVisitorId(),
  })
}

function stopVisitorHeartbeat() {
  if (visitorHeartbeatTimer) {
    window.clearInterval(visitorHeartbeatTimer)
    visitorHeartbeatTimer = null
  }
}

function startVisitorHeartbeat() {
  stopVisitorHeartbeat()
  visitorHeartbeatTimer = window.setInterval(() => {
    upsertLiveSession()
  }, PRESENCE_HEARTBEAT_MS)
}

function onVisitorPageHide() {
  visitorActive = false
  stopVisitorHeartbeat()
  removeLiveSession()
}

function emitLiveStats(stats) {
  statsListeners.forEach((listener) => listener(stats))
}

function emitConnection(connected) {
  connectionListeners.forEach((listener) => listener(connected))
}

function emitSetupRequired(setupRequired) {
  setupListeners.forEach((listener) => listener(setupRequired))
}

async function fetchLiveStats() {
  if (!supabase) {
    return { stats: EMPTY_STATS, setupRequired: false, ok: false }
  }

  const { data, error } = await supabase.rpc('get_live_session_stats', {
    p_stale_seconds: staleSeconds(),
  })

  if (error) {
    return {
      stats: EMPTY_STATS,
      setupRequired: isSetupError(error),
      ok: false,
    }
  }

  return {
    stats: getNeighborhoodPresenceStats(data),
    setupRequired: false,
    ok: true,
  }
}

async function refreshLiveStats() {
  const { stats, setupRequired, ok } = await fetchLiveStats()
  emitLiveStats(stats)
  emitSetupRequired(setupRequired)
  emitConnection(ok && !setupRequired)
  return stats
}

function stopAdminHub() {
  if (adminPollTimer) {
    window.clearInterval(adminPollTimer)
    adminPollTimer = null
  }
  emitConnection(false)
}

function startAdminHub() {
  if (!isSupabaseConfigured || !supabase) return

  refreshLiveStats()

  if (!adminPollTimer) {
    adminPollTimer = window.setInterval(() => {
      refreshLiveStats()
    }, ADMIN_PRESENCE_POLL_MS)
  }
}

export function updateVisitorPresence(stage, path) {
  visitorPayload = { stage, path }
  upsertLiveSession()
}

export function startVisitorPresence(stage, path) {
  if (!isSupabaseConfigured || !presenceSupabase) return

  visitorActive = true
  visitorPayload = { stage, path }
  upsertLiveSession()
  startVisitorHeartbeat()

  if (!visitorPageListenersAttached) {
    window.addEventListener('pagehide', onVisitorPageHide)
    window.addEventListener('beforeunload', onVisitorPageHide)
    visitorPageListenersAttached = true
  }
}

export function stopVisitorPresence() {
  visitorActive = false
  stopVisitorHeartbeat()

  if (visitorPageListenersAttached) {
    window.removeEventListener('pagehide', onVisitorPageHide)
    window.removeEventListener('beforeunload', onVisitorPageHide)
    visitorPageListenersAttached = false
  }

  removeLiveSession()
}

export function subscribeToLivePresenceStats(onStats, onConnection, onSetupRequired) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {}
  }

  statsListeners.add(onStats)
  if (onConnection) connectionListeners.add(onConnection)
  if (onSetupRequired) setupListeners.add(onSetupRequired)

  startAdminHub()

  return () => {
    statsListeners.delete(onStats)
    if (onConnection) connectionListeners.delete(onConnection)
    if (onSetupRequired) setupListeners.delete(onSetupRequired)

    if (statsListeners.size === 0 && connectionListeners.size === 0 && setupListeners.size === 0) {
      stopAdminHub()
    }
  }
}

export function countOnlineVisitors(rows) {
  return Array.isArray(rows) ? rows.length : 0
}

export function countPresenceByStage(rows, stage) {
  if (!Array.isArray(rows)) return 0
  return rows.filter((row) => row.stage === stage).length
}
