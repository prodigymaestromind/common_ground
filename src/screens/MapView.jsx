// Campus map with event pins (OpenStreetMap via Leaflet, free, no API key).
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PLACES, CAMPUS_CENTER } from '../places'
import { EventCard } from '../components'
import { useNav } from '../nav'
import { isLive } from '../utils'

export default function CampusMap({ events, focus }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const [selected, setSelected] = useState(null)
  const [noTiles, setNoTiles] = useState(false)
  const nav = useNav()
  const navRef = useRef(nav)
  useEffect(() => { navRef.current = nav })

  // group events by building
  const byPlace = {}
  // online, off-campus and unknown-room events have no pin (they are still in the list)
  for (const e of events) if (e.placeId) (byPlace[e.placeId] ||= []).push(e)
  const noPin = events.filter((e) => !e.placeId).length

  useEffect(() => {
    const f = focus && PLACES[focus]
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(f ? [f.lat, f.lng] : CAMPUS_CENTER, f ? 18 : 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).on('tileerror', () => setNoTiles(true)).on('tileload', () => setNoTiles(false)).addTo(map.current)
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        html: `<div class="pin-marker ${live ? 'is-live' : ''} ${pid === focus ? 'is-focus' : ''}"><span>${list[0].emoji}</span>${list.length > 1 ? `<b>${list.length}</b>` : ''}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 40],
      })
      L.marker([p.lat, p.lng], { icon, title: p.name })
        // one event here: open it. Several: show the list for this building
        .on('click', () => (list.length === 1 ? navRef.current.push('event', { id: list[0].id }) : setSelected(pid)))
        .addTo(layer.current)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const sel = selected && byPlace[selected]
  return (
    <div className="map-wrap">
      <div ref={el} className="map" role="application" aria-label="Campus map of events" />
      {noTiles && <p className="map-error">The map picture didn't load. Check your connection and try again. The pins still open events.</p>}
      <p className="map-note">Tap a pin to open the event · 🔴 = happening now · numbers = several events there{noPin > 0 && ` · ${noPin} more with no pin (like online or off campus) are in the list`}</p>
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
