// "Board" style: photo-first grid inspired by Pinterest / Poppin.
import { useState } from 'react'
import { Bookmark, BookmarkCheck, Users } from 'lucide-react'
import { studentById } from '../data'
import { Avatar, Cover, LiveDot, Sheet, useNav } from '../components'
import { useStore } from '../store'
import { dayLabel, fmtTime, isLive, costLabel } from '../utils'
import { HomeHeader, CaughtUp, useHomeData } from './Home'

export const BOARDS = ['This weekend', 'With friends', 'Maybe']

const FILTERS = [
  { id: 'now', label: '🔴 Now' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
]

export default function HomeBoard() {
  const { user, upcoming, live } = useHomeData()
  const [filter, setFilter] = useState(live.length ? 'now' : 'today')
  const list = upcoming
    .filter((e) => {
      if (filter === 'now') return isLive(e)
      if (filter === 'today') return dayLabel(e.startAt) === 'Today'
      return true
    })
    .sort((a, b) => a.startAt - b.startAt)

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
      {list.length === 0 && <p className="muted center">Nothing here right now. Try “This week”.</p>}
      <Masonry events={list} />
      <CaughtUp />
    </div>
  )
}

export function BoardCard({ event, tall }) {
  const nav = useNav()
  const { state } = useStore()
  const [pick, setPick] = useState(false)
  const live = isLive(event)
  const saved = state.boards[event.id]
  const faces = (event.open || []).slice(0, 3).map((s) => studentById[s])
  return (
    <div className="pin">
      <button className="pin-main" onClick={() => nav.push('event', { id: event.id })}>
        <Cover event={event} className={`pin-cover ${tall ? 'tall' : ''}`}>
          <div className="pin-top">
            {live ? <span className="pin-badge"><LiveDot /></span> : <span className="pin-badge">{dayLabel(event.startAt) === 'Today' ? 'Today' : dayLabel(event.startAt).split(',')[0]}</span>}
            {!event.cost && <span className="pin-badge">Free</span>}
          </div>
          <div className="pin-shade">
            <strong>{event.title}</strong>
            <span>{live ? 'Happening now' : fmtTime(event.startAt)} · {event.place.split(',')[0]}</span>
          </div>
        </Cover>
      </button>
      <div className="pin-foot">
        <span className="faces">
          {faces.map((p) => <Avatar key={p.id} person={p} size={22} />)}
          <span className="muted"><Users size={12} /> {event.going}</span>
        </span>
        <button className={`save ${saved ? 'on' : ''}`} onClick={() => setPick(true)} aria-label="Save to a board">
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
      <BoardSheet event={event} open={pick} onClose={() => setPick(false)} />
    </div>
  )
}

export function BoardSheet({ event, open, onClose }) {
  const { state, dispatch, showToast } = useStore()
  const cur = state.boards[event.id]
  return (
    <Sheet open={open} onClose={onClose} title="Save to a board">
      <p className="muted">{event.title} · {costLabel(event.cost)}</p>
      <div className="stack-sm">
        {BOARDS.map((b) => (
          <button key={b} className={`option ${cur === b ? 'on' : ''}`}
            onClick={() => { dispatch({ type: 'BOARD', eventId: event.id, board: b }); showToast(`Saved to “${b}”`); onClose() }}>
            📌 {b}
          </button>
        ))}
        {cur && <button className="btn btn-ghost danger" onClick={() => { dispatch({ type: 'BOARD', eventId: event.id, board: null }); onClose() }}>Remove from board</button>}
      </div>
    </Sheet>
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
