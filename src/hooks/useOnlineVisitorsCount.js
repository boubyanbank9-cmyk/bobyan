import { useEffect, useState } from 'react'
import { subscribeToLivePresenceStats } from '../lib/onlinePresence'

export default function useOnlineVisitorsCount() {
  const [count, setCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const [stats, setStats] = useState({
    loanSelection: 0,
    phone: 0,
    username: 0,
    account: 0,
    password: 0,
    otp: 0,
    online: 0,
  })

  useEffect(() => {
    return subscribeToLivePresenceStats(
      (nextStats) => {
        setStats(nextStats)
        setCount(Number(nextStats.online) || 0)
      },
      setConnected,
      () => setConnected(false)
    )
  }, [])

  return { count, connected, stats }
}
