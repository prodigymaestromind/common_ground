// Opened by tapping an event's location: the campus map, zoomed to that building.
import { Navigation } from 'lucide-react'
import { TopBar } from '../components'
import { useStore } from '../store'
import { PLACES } from '../places'
import { isGone, appleMapsUrl, googleMapsUrl } from '../utils'
import CampusMap from './MapView'

export default function PlaceMap({ id }) {
  const { events, eventById } = useStore()
  const e = eventById[id]
  const place = e && PLACES[e.placeId]
  if (!place) return <div className="screen"><TopBar title="Map" /><p className="muted center">No map location for this event.</p></div>
  const upcoming = events.filter((x) => !isGone(x))
  return (
    <div className="screen">
      <TopBar title={place.short} />
      <p className="muted">{e.place}</p>
      <CampusMap events={upcoming} focus={e.placeId} />
      <div className="quick-actions">
        <a className="btn btn-outline" href={appleMapsUrl(place.lat, place.lng, place.name)} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Apple Maps</a>
        <a className="btn btn-outline" href={googleMapsUrl(place.lat, place.lng)} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Google Maps</a>
      </div>
      <p className="muted small center">Pin spots are approximate. Use Apple or Google Maps for walking directions.</p>
    </div>
  )
}
