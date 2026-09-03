import { useCallback, useEffect, useRef } from 'react'
import { OMAN_BOUNDS, OMAN_CENTER, isInsideOman } from '../lib/mapLocation'
import {
  configureLeafletIcons,
  createMapTileLayer,
  destroyLeafletMap,
  L,
  refreshLeafletMap,
} from '../lib/leafletSetup'

function waitForContainerSize(container, callback, attempts = 30) {
  if (!container) return

  if (container.offsetWidth > 0 && container.offsetHeight > 0) {
    callback()
    return
  }

  if (attempts <= 0) {
    callback()
    return
  }

  requestAnimationFrame(() => waitForContainerSize(container, callback, attempts - 1))
}

export function useOmanLeafletMap({ value, onPick, enabled = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onPickRef = useRef(onPick)

  onPickRef.current = onPick

  const placeMarker = useCallback((map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      return
    }

    markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
    markerRef.current.on('dragend', () => {
      const pos = markerRef.current.getLatLng()
      onPickRef.current?.({ lat: pos.lat, lng: pos.lng, label: '' })
    })
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const container = containerRef.current
    if (!container) return undefined

    let cancelled = false
    let resizeObserver = null
    let intersectionObserver = null
    const timers = []
    const initialValue = value

    const scheduleRefresh = (map) => {
      const refresh = () => refreshLeafletMap(map)
      refresh()
      requestAnimationFrame(refresh)
      ;[50, 150, 350, 700, 1200].forEach((delay) => {
        timers.push(window.setTimeout(refresh, delay))
      })
    }

    const initMap = () => {
      if (cancelled || !container || container._leaflet_id) return

      configureLeafletIcons()

      const start = initialValue || OMAN_CENTER
      const map = L.map(container, {
        center: [start.lat, start.lng],
        zoom: initialValue ? 15 : 8,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: OMAN_BOUNDS,
        maxBoundsViscosity: 0.85,
        tap: true,
        zoomControl: true,
        attributionControl: true,
      })

      createMapTileLayer().addTo(map)

      map.on('click', (event) => {
        const { lat, lng } = event.latlng
        if (!isInsideOman(lat, lng)) {
          onPickRef.current?.(null, 'outside')
          return
        }

        placeMarker(map, lat, lng)
        onPickRef.current?.({ lat, lng, label: '' })
      })

      if (initialValue) {
        placeMarker(map, initialValue.lat, initialValue.lng)
      }

      mapRef.current = map

      map.whenReady(() => {
        if (!cancelled) scheduleRefresh(map)
      })

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => refreshLeafletMap(map))
        resizeObserver.observe(container)
      }

      if (typeof IntersectionObserver !== 'undefined') {
        intersectionObserver = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              refreshLeafletMap(map)
            }
          },
          { threshold: 0.08 }
        )
        intersectionObserver.observe(container)
      }
    }

    waitForContainerSize(container, initMap)

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      destroyLeafletMap(mapRef.current, container)
      mapRef.current = null
      markerRef.current = null
    }
  }, [enabled, placeMarker])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !value) return

    placeMarker(map, value.lat, value.lng)
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14), { animate: false })
    refreshLeafletMap(map)
  }, [value?.lat, value?.lng, placeMarker])

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      onPickRef.current?.(null, 'unsupported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        const map = mapRef.current
        if (!map) return

        if (!isInsideOman(lat, lng)) {
          onPickRef.current?.(null, 'outside')
          return
        }

        map.setView([lat, lng], 15)
        placeMarker(map, lat, lng)
        onPickRef.current?.({ lat, lng, label: '' })
      },
      () => onPickRef.current?.(null, 'denied'),
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [placeMarker])

  return { containerRef, useMyLocation }
}
