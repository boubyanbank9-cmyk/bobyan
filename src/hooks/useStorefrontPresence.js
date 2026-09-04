import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getStageFromPath,
  startVisitorPresence,
  stopVisitorPresence,
} from '../lib/onlinePresence'

export default function useStorefrontPresence(enabled, stageOverride = null) {
  const { pathname } = useLocation()
  const stage = stageOverride || getStageFromPath(pathname)

  useEffect(() => {
    if (!enabled) {
      stopVisitorPresence()
      return
    }

    startVisitorPresence(stage, pathname)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopVisitorPresence()
      } else {
        startVisitorPresence(stage, pathname)
      }
    }

    const handlePageHide = () => stopVisitorPresence()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      stopVisitorPresence()
    }
  }, [enabled, stage, pathname])
}
