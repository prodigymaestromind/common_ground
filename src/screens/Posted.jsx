// Shown right after you post an event.
import { Eye, Home as HomeIcon, Plus } from 'lucide-react'
import { EventCard } from '../components'
import { useNav } from '../nav'
import { useStore } from '../store'

export default function Posted({ id }) {
  const nav = useNav()
  const { eventById } = useStore()
  const e = eventById[id]
  return (
    <div className="screen posted">
      <div className="posted-check">✓</div>
      <h1 className="page-title center">Event posted (demo)</h1>
      <p className="muted center">It shows in the feed and on the map on this device only. Other students will see posts once real accounts launch.</p>
      {e && <EventCard event={e} preview />}
      <div className="stack-sm">
        <button className="btn btn-primary btn-lg" onClick={() => nav.push('event', { id })}><Eye size={18} /> View event</button>
        <button className="btn btn-outline btn-lg" onClick={() => nav.tab('home')}><HomeIcon size={18} /> Go home</button>
        <button className="btn btn-ghost btn-lg" onClick={() => nav.tab('post')}><Plus size={18} /> Post another</button>
      </div>
    </div>
  )
}
