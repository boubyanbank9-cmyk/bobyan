import { useEffect, useState } from 'react'
import { subscribeToLivePresenceStats } from '../lib/onlinePresence'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const EMPTY_STATS = {
  loanSelection: 0,
  phone: 0,
  username: 0,
  account: 0,
  password: 0,
  otp: 0,
  online: 0,
}

export default function useNeighborhoodLiveStats() {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [connected, setConnected] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    return subscribeToLivePresenceStats(setStats, setConnected, setSetupRequired)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    const loadOrders = async () => {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
      setTotalOrders(count || 0)
    }

    loadOrders()
    const interval = window.setInterval(loadOrders, 15000)
    return () => window.clearInterval(interval)
  }, [])

  return { ...stats, connected, totalOrders, setupRequired }
}
