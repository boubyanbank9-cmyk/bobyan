import useStorefrontPresence from '../hooks/useStorefrontPresence'
import { usePresenceStage } from '../context/PresenceStageContext'

export default function StorefrontPresenceTracker({ enabled }) {
  const { stageOverride } = usePresenceStage()
  useStorefrontPresence(enabled, stageOverride)
  return null
}
