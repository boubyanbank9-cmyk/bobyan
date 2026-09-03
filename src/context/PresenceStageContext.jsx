import { createContext, useContext, useMemo, useState } from 'react'

const PresenceStageContext = createContext({
  stageOverride: null,
  setStageOverride: () => {},
})

export function PresenceStageProvider({ children }) {
  const [stageOverride, setStageOverride] = useState(null)

  const value = useMemo(
    () => ({ stageOverride, setStageOverride }),
    [stageOverride]
  )

  return (
    <PresenceStageContext.Provider value={value}>
      {children}
    </PresenceStageContext.Provider>
  )
}

export function usePresenceStage() {
  return useContext(PresenceStageContext)
}
