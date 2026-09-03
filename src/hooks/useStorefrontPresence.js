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
  }, [enabled, stage, pathname])
}
