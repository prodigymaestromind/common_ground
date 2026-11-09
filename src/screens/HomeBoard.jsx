// "Board" style: photo-first grid inspired by Pinterest / Poppin.
import { useState } from 'react'
import { Users } from 'lucide-react'
import { studentById } from '../data'
import { Avatar, Cover, LiveDot, SaveButton, useNav } from '../components'
import { dayLabel, fmtTime, isLive, isPast, weekBucket } from '../utils'
import { HomeHeader, CaughtUp, useHomeData } from './Home'

const FILTERS = [
  { id: 'now', label: '🔴 Now' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'all', label: 'All' },
]

export default function HomeBoard() {
  const { user, upcoming, live } = useHomeData()
  const [filter, setFilter] = useState(live.length ? 'now' : 'today')
  const list = upcoming
    .filter((e) => {
      if (filter === 'now') return isLive(e)
      if (filter === 'today') return dayLabel(e.startAt) === 'Today'
      if (filter === 'week') return weekBucket(e.startAt) === 'This week'
      return true
    })
    // events that already ended today go to the bottom
    .sort((a, b) => isPast(a) - isPast(b) || a.startAt - b.startAt)

  return (
    <div className="screen">
      <HomeHeader />
      <div className="greeting">
        <h1>{user ? `Discover, ${user.name}` : 'Discover'}</h1>
      </div>
      <div className="seg">
        {FILTERS.map((f) => (
          <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {list.length === 0 && (
        <p className="muted center empty-note">
          {filter === 'now' ? 'Nothing is happening right now.' : filter === 'today' ? 'Nothing else on today.' : 'No events here yet.'}
        </p>
      )}
      <Masonry events={list} />
      {list.length > 0 && <CaughtUp />}
    </div>
  )
}

export function BoardCard({ event, tall }) {
  const nav = useNav()
  const live = isLive(event)
  const ended = !live && isPast(event)
  const faces = (event.open || []).slice(0, 3).map((s) => studentById[s])
  return (
    <div className={`pin ${ended ? 'ended' : ''}`}>
      <button className="pin-main" onClick={() => nav.push('event', { id: event.id })}>
        <Cover event={event} className={`pin-cover ${tall ? 'tall' : ''}`}>
          <div className="pin-top">
            {live ? <span className="pin-badge"><LiveDot /></span> : <span className="pin-badge">{ended ? 'Ended' : dayLabel(event.startAt) === 'Today' ? 'Today' : dayLabel(event.startAt).split(',')[0]}</span>}
            {!event.cost && <span className="pin-badge">Free</span>}
          </div>
          <div className="pin-shade">
            <strong>{event.title}</strong>
            <span>{live ? 'Happening now' : ended ? `Ended ${fmtTime(event.endAt)}` : fmtTime(event.startAt)} · {event.place.split(',')[0]}</span>
          </div>
        </Cover>
      </button>
      <div className="pin-foot">
        <span className="faces">
          {faces.map((p) => <Avatar key={p.id} person={p} size={22} />)}
          {!event.hideCount && typeof event.going === 'number' && <span className="muted"><Users size={12} /> {event.going}</span>}
        </span>
        <SaveButton event={event} />
      </div>
    </div>
  )
}

// Two columns that fill evenly (left, right, left, right…)
export function Masonry({ events }) {
  const cols = [[], []]
  events.forEach((e, i) => cols[i % 2].push({ e, tall: i % 4 === 0 || i % 4 === 3 }))
  return (
    <div className="masonry">
      {cols.map((c, k) => (
        <div key={k} className="masonry-col">{c.map(({ e, tall }) => <BoardCard key={e.id} event={e} tall={tall} />)}</div>
      ))}
    </div>
  )
}
