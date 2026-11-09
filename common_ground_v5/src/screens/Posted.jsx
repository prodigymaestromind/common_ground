import { Eye, Home as HomeIcon, Plus } from 'lucide-react'
import { EventCard, useNav } from '../components'
import { useStore } from '../store'

// Shown right after you post an event
export default function Posted({ id }) {
  const nav = useNav()
  const { eventById } = useStore()
  const e = eventById[id]
  return (
    <div className="screen posted">
      <div className="posted-check">✓</div>
      <h1 className="page-title center">{e?.pending ? 'Event posted!' : 'Event published!'}</h1>
      <p className="muted center">{e?.pending ? 'It shows in the feed now with a “pending club check” tag.' : 'Students can find it in the feed and on the map.'}</p>
      {e && <EventCard event={e} preview />}
      <div className="stack-sm">
        <button className="btn btn-primary btn-lg" onClick={() => nav.push('event', { id })}><Eye size={18} /> View event</button>
        <button className="btn btn-outline btn-lg" onClick={() => nav.tab('home')}><HomeIcon size={18} /> Go home</button>
        <button className="btn btn-ghost btn-lg" onClick={() => nav.tab('post')}><Plus size={18} /> Post another</button>
      </div>
    </div>
  )
}
