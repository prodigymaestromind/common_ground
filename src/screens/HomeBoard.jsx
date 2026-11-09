// "Board" style: photo-first grid inspired by Pinterest / Poppin.
import { useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'
import { studentById } from '../data'
import { Avatar, Cover, LiveDot, SaveButton, useNav } from '../components'
import { dayLabel, fmtTime, isLive, isPast, showGoing, weekBucket } from '../utils'
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

  const idx = FILTERS.findIndex((f) => f.id === filter)
  const liveN = upcoming.filter((e) => isLive(e)).length
  const summary = {
    now: list.length ? `${list.length} happening right now` : '',
    today: `${list.length} event${list.length === 1 ? '' : 's'} today${liveN ? ` · ${liveN} live now` : ''}`,
    week: `${list.length} event${list.length === 1 ? '' : 's'} in the next 7 days`,
    all: `${list.length} upcoming event${list.length === 1 ? '' : 's'}`,
  }[filter]

  return (
    <div className="screen screen-wide">
      <HomeHeader />
      <div className="greeting">
        <h1>{user ? `Discover, ${user.name}` : 'Discover'}</h1>
      </div>
      <div className="seg seg-glide" style={{ '--n': FILTERS.length, '--i': idx }}>
        <span className="seg-glider" aria-hidden="true" />
        {FILTERS.map((f) => (
          <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}>{f.label}</button>
        ))}
      </div>
      {summary && <p key={`s-${filter}`} className="board-count fade-in">{summary}</p>}
      {list.length === 0 && (
        <p className="muted center empty-note">
          {filter === 'now' ? 'Nothing is happening right now.' : filter === 'today' ? 'Nothing else on today.' : 'No events here yet.'}
        </p>
      )}
      <Masonry key={filter} events={list} />
      {list.length > 0 && <CaughtUp />}
    </div>
  )
}

export function BoardCard({ event, tall }) {
  const nav = useNav()
  const live = isLive(event)
  const ended = !live && isPast(event)
  const faces = (event.open || []).slice(0, 2).map((s) => studentById[s])
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
          {showGoing(event) ? <span className="pin-going"><Users size={13} /> {event.going} going</span> : <span className="pin-new">New event</span>}
        </span>
        <SaveButton event={event} />
      </div>
    </div>
  )
}

// How many columns fit: 2 on phones, 3 on iPad, 4+ on wide screens
function useColumns(ref, min = 220) {
  const [n, setN] = useState(2)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setN(Math.max(2, Math.min(5, Math.floor(e.contentRect.width / min)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, min])
  return n
}

// Columns that fill evenly (left, right, left, right…)
export function Masonry({ events }) {
  const ref = useRef(null)
  const n = useColumns(ref)
  const cols = Array.from({ length: n }, () => [])
  events.forEach((e, i) => cols[i % n].push({ e, i, tall: (i + Math.floor(i / n)) % 2 === 0 }))
  return (
    <div ref={ref} className="masonry" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {cols.map((c, k) => (
        <div key={k} className="masonry-col">{c.map(({ e, i, tall }) => (
          <div key={e.id} className="pop-in" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}><BoardCard event={e} tall={tall} /></div>
        ))}</div>
      ))}
    </div>
  )
}
