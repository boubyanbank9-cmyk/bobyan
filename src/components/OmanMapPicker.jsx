import { useCallback, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../context/LanguageContext'
import { useOmanLeafletMap } from '../hooks/useOmanLeafletMap'
import { isInsideOman } from '../lib/mapLocation'

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'ar',
      },
    })
    if (!response.ok) return ''
    const data = await response.json()
    return data.display_name || ''
  } catch {
    return ''
  }
}

function formatCoords(location) {
  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
}

function PinIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function GpsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  )
}

export function MapPickerButton({ value, onClick }) {
  const { t } = useLanguage()
  const c = t.checkout

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-sky-200 bg-sky-50/80 hover:bg-sky-50 transition text-start group"
    >
      <span className="w-11 h-11 rounded-full bg-[#0d6b8a] text-white flex items-center justify-center shrink-0 shadow-sm">
        <PinIcon />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block font-black text-[#0d6b8a] text-[15px] leading-snug">
          {value ? c.map.change : c.pickFromMap}
        </span>
        <span className="block text-xs text-sky-700/80 font-semibold mt-0.5">
          {value ? value.label || formatCoords(value) : c.pickFromMapHint}
        </span>
      </span>

      <span className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-200 transition">
        <ChevronIcon />
      </span>
    </button>
  )
}

export default function OmanMapPicker({ open, initialLocation, onConfirm, onClose }) {
  const { t } = useLanguage()
  const m = t.checkout.map
  const [selected, setSelected] = useState(initialLocation || null)
  const [loadingLabel, setLoadingLabel] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setSelected(initialLocation || null)
    setError('')
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, initialLocation])

  const handlePick = useCallback(
    (location, reason) => {
      if (reason === 'outside') {
        setError(m.outsideUae || m.outsideOman)
        return
      }
      if (reason === 'unsupported') {
        setError(m.geoUnsupported)
        return
      }
      if (reason === 'denied') {
        setError(m.geoDenied)
        return
      }
      if (!location) return
      setError('')
      setSelected(location)
    },
    [m.geoDenied, m.geoUnsupported, m.outsideUae, m.outsideOman]
  )

  const { containerRef, useMyLocation } = useOmanLeafletMap({
    value: selected,
    onPick: handlePick,
    enabled: open,
  })

  const handleConfirm = async () => {
    if (!selected) {
      setError(m.pickRequired)
      return
    }

    if (!isInsideOman(selected.lat, selected.lng)) {
      setError(m.outsideUae || m.outsideOman)
      return
    }

    setLoadingLabel(true)
    const label = await reverseGeocode(selected.lat, selected.lng)
    setLoadingLabel(false)

    onConfirm({
      lat: selected.lat,
      lng: selected.lng,
      label: label || formatCoords(selected),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={m.cancel}
      />

      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(88vh,680px)]">
        <div className="bg-[#e53935] px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <h3 className="font-black text-white text-base flex-1 text-center">{m.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-white/90 hover:bg-white/15 font-black text-xl leading-none shrink-0"
            aria-label={m.cancel}
          >
            ×
          </button>
        </div>

        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2.5 shrink-0">
          <p className="text-xs font-bold text-[#0d6b8a] text-center leading-6">{m.hint}</p>
        </div>

        <div
          ref={containerRef}
          className="uae-map-picker w-full bg-slate-200 relative z-0 flex-1 min-h-[280px]"
          style={{ height: 'min(48vh, 380px)' }}
          aria-label={m.title}
        />

        {error && (
          <p className="px-4 py-2 text-red-600 text-xs font-bold bg-red-50 border-t border-red-100 text-center">
            {error}
          </p>
        )}

        <div className="p-4 space-y-3 shrink-0 bg-white border-t border-slate-100">
          <button
            type="button"
            onClick={useMyLocation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#e53935] bg-white text-[#e53935] font-black text-sm hover:bg-red-50 transition"
          >
            <GpsIcon />
            {m.useMyLocation}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected || loadingLabel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ef6b6b] hover:bg-[#e53935] text-white font-black text-sm disabled:opacity-50 transition"
          >
            <CheckIcon />
            {loadingLabel ? m.confirming : m.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
