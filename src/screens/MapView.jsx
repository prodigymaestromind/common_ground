// Campus map with event pins (OpenStreetMap via Leaflet, free, no API key).
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PLACES, CAMPUS_CENTER } from '../places'
import { EventCard } from '../components'
import { isLive } from '../utils'

export default function CampusMap({ events }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const [selected, setSelected] = useState(null)

  // group events by building
  const byPlace = {}
  for (const e of events) (byPlace[e.placeId || 'union'] ||= []).push(e)

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(CAMPUS_CENTER, 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.current)
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [])

  const key = events.map((e) => e.id).join(',')
  useEffect(() => {
    layer.current.clearLayers()
    Object.entries(byPlace).forEach(([pid, list]) => {
      const p = PLACES[pid]
      if (!p) return
      const live = list.some((e) => isLive(e))
      const icon = L.divIcon({
        className: '',
        html: `<div class="pin-marker ${live ? 'is-live' : ''}"><span>${list[0].emoji}</span>${list.length > 1 ? `<b>${list.length}</b>` : ''}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 40],
      })
      L.marker([p.lat, p.lng], { icon, title: p.name })
        .on('click', () => setSelected(pid))
        .addTo(layer.current)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const sel = selected && byPlace[selected]
  return (
    <div className="map-wrap">
      <div ref={el} className="map" role="application" aria-label="Campus map of events" />
      <p className="map-note">Tap a pin · 🔴 = happening now · pins are approximate</p>
      {sel && (
        <div className="map-panel">
          <div className="map-panel-head">
            <strong>{PLACES[selected].name}</strong>
            <button className="link" onClick={() => setSelected(null)}>Close</button>
          </div>
          <div className="stack-sm">{sel.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </div>
      )}
    </div>
  )
}
