import { useEffect, useState } from 'react'
import { countOnlineVisitors, VISITORS_CHANNEL } from '../lib/onlinePresence'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function useOnlineVisitorsCount() {
  const [count, setCount] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    const channel = supabase.channel(VISITORS_CHANNEL, {
      config: { presence: { key: `admin-${Date.now()}` } },
    })

    const syncCount = () => {
      setCount(countOnlineVisitors(channel.presenceState()))
    }

    channel
      .on('presence', { event: 'sync' }, syncCount)
      .on('presence', { event: 'join' }, syncCount)
      .on('presence', { event: 'leave' }, syncCount)
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          syncCount()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { count, connected }
}
