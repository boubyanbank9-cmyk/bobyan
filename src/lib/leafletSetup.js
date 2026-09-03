import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let configured = false

export function configureLeafletIcons() {
  if (configured) return
  configured = true

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
}

export function createMapTileLayer() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  })
}

export function destroyLeafletMap(map, container) {
  if (map) {
    map.remove()
  }
  if (container && container._leaflet_id) {
    delete container._leaflet_id
  }
}

export function refreshLeafletMap(map) {
  if (!map) return
  map.invalidateSize({ animate: false, pan: false })
}

export { L }
