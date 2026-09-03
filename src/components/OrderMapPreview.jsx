import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { getGoogleMapsLink, parseMapLocation } from '../lib/mapLocation'
import {
  configureLeafletIcons,
  createMapTileLayer,
  destroyLeafletMap,
  L,
  refreshLeafletMap,
} from '../lib/leafletSetup'

export default function OrderMapPreview({ mapLocation, height = 220, showLink = true }) {
  const location = parseMapLocation(mapLocation)
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!location || !containerRef.current) return undefined

    const container = containerRef.current
    destroyLeafletMap(mapRef.current, container)
    mapRef.current = null

    configureLeafletIcons()

    let resizeObserver = null
    const timers = []

    const initMap = () => {
      if (!container || container._leaflet_id) return

      const map = L.map(container, {
        center: [location.lat, location.lng],
        zoom: 15,
        scrollWheelZoom: false,
        dragging: true,
        zoomControl: true,
      })

      createMapTileLayer().addTo(map)
      L.marker([location.lat, location.lng]).addTo(map)

      mapRef.current = map

      const refresh = () => refreshLeafletMap(map)
      map.whenReady(refresh)
      requestAnimationFrame(refresh)
      ;[50, 150, 350, 700].forEach((delay) => {
        timers.push(window.setTimeout(refresh, delay))
      })

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(refresh)
        resizeObserver.observe(container)
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(initMap)
    })

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      resizeObserver?.disconnect()
      destroyLeafletMap(mapRef.current, container)
      mapRef.current = null
    }
  }, [location?.lat, location?.lng])

  if (!location) return null

  const mapsLink = getGoogleMapsLink(location)

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="order-map-preview w-full rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden"
        style={{ height, minHeight: height }}
      />
      {location.label && (
        <p className="text-sm font-bold text-slate-700 leading-6">{location.label}</p>
      )}
      <p className="text-xs font-bold text-slate-500" dir="ltr">
        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
      </p>
      {showLink && (
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-black text-teal-700 hover:underline"
        >
          فتح في خرائط Google ↗
        </a>
      )}
    </div>
  )
}
