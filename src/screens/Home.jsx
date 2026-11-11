// Home: a photo board of events. "Happening now" comes first.
import { useEffect, useRef, useState } from 'react'
import { CircleHelp, Compass, FlaskConical, MessageSquareHeart, X } from 'lucide-react'
import { studentById } from '../demo'
import { Avatar, Cover, GoingCount, LiveDot, Logo, SaveButton, SignInButton } from '../components'
import { useNav } from '../nav'
import { useNow } from '../hooks'
import { useStore } from '../store'
import { APP_VERSION, CREDIT } from '../version'
import { EVENTS_UPDATED } from '../realEvents'
import { dayBadge, dayLabel, endedWord, fmtTime, fullDate, isGone, isLive, isPast, weekBucket } from '../utils'

const FILTERS = [
  { id: 'now', label: '🔴 Now' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'all', label: 'All' },
]

export default function Home() {
  const nav = useNav()
  const { state, dispatch, events, forYou, setForYou } = useStore()
  const now = useNow()
  const user = state.user
  // today's events stay until midnight, even after they end
  const likes = user?.role === 'student' ? user.interests || [] : []
  const mineOnly = forYou && likes.length > 0
  const upcoming = events.filter((e) => !isGone(e, now)).filter((e) => !mineOnly || e.mine || likes.includes(e.interest))
  const liveCount = upcoming.filter((e) => isLive(e, now)).length
  const [filter, setFilter] = useState(liveCount ? 'now' : 'today')

  const list = upcoming
    .filter((e) => {
      if (filter === 'now') return isLive(e, now)
      if (filter === 'today') return dayLabel(e.startAt) === 'Today'
      if (filter === 'week') return weekBucket(e.startAt) === 'This week'
      return true
    })
    // events that already ended today go to the bottom
    .sort((a, b) => isPast(a, now) - isPast(b, now) || a.startAt - b.startAt)

  const n = list.length
  const summary = {
    now: n ? `${n} happening right now` : '',
    today: `${n} event${n === 1 ? '' : 's'} today${liveCount ? ` · ${liveCount} live now` : ''}`,
    week: `${n} event${n === 1 ? '' : 's'} this week`,
    all: `${n} upcoming event${n === 1 ? '' : 's'}`,
  }[filter]

  return (
    <div className="screen screen-wide">
      <header className="home-head">
        <Logo />
        <div className="head-actions">
          <button className="icon-btn head-fb" onClick={() => nav.push('help')} aria-label="How it works" title="How it works"><CircleHelp size={20} /></button>
          <button className="icon-btn head-fb" onClick={nav.feedback} aria-label="Give feedback" title="Give feedback"><MessageSquareHeart size={20} /></button>
          {user ? (
            <button className="avatar-btn" onClick={() => nav.push('profile')} aria-label="Profile">
              <Avatar person={{ name: user.name, color: 'var(--green)' }} size={36} />
            </button>
          ) : <SignInButton />}
        </div>
      </header>
      <div className="greeting">
        <h1>{user ? `Discover, ${user.name}` : 'Discover'}</h1>
      </div>

      {!state.tips.demoNote && (
        <div className="demo-note">
          <FlaskConical size={18} />
          <span><b>Demo preview.</b> The events are real Sac State events. The people, “going” counts and chats are samples for now.</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'TIP_SEEN', key: 'demoNote' })} aria-label="Hide this note"><X size={16} /></button>
        </div>
      )}

      <div className="seg seg-glide" style={{ '--n': FILTERS.length, '--i': FILTERS.findIndex((f) => f.id === filter) }}>
        <span className="seg-glider" aria-hidden="true" />
        {FILTERS.map((f) => (
          <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}>{f.label}</button>
        ))}
      </div>
      <div className="board-bar">
        {summary ? <p key={`s-${filter}`} className="board-count fade-in">{summary}</p> : <span />}
        {likes.length > 0 && (
          <label className="for-you" title="Only show events that match your interests">
            <span>For you</span>
            <input type="checkbox" className="switch switch-sm" checked={forYou} onChange={(e) => setForYou(e.target.checked)} />
          </label>
        )}
      </div>

      {n === 0 && (
        <p className="muted center empty-note">
          {filter === 'now' ? 'Nothing is happening right now.' : filter === 'today' ? 'Nothing else on today.' : filter === 'week' ? 'Nothing left this week. Tap All to see what\'s coming up.' : 'No events here yet.'}
          {mineOnly && <><br />“For you” is on, so you only see your interests. <button className="link" onClick={() => setForYou(false)}>Show everything</button></>}
        </p>
      )}
      <Board key={filter} events={list} now={now} />

      <div className="caught-up">
        {n > 0 && (
          <>
            <div className="caught-check">✓</div>
            <strong>You're all caught up</strong>
            <p className="muted">That's everything here. Go live your life 🌿</p>
          </>
        )}
        <button className="btn btn-outline" onClick={() => nav.tab('explore')}><Compass size={16} /> Browse all events</button>
        <p className="fresh-note">Events from the Sac State calendar · updated {fullDate(`${EVENTS_UPDATED}T12:00:00`)}</p>
        <p className="foot-links">
          <button className="link" onClick={() => nav.push('help')}>How it works</button> · <button className="link" onClick={nav.feedback}>Give feedback</button>
        </p>
        <p className="version-tag">v{APP_VERSION} · {CREDIT}</p>
      </div>
    </div>
  )
}

function BoardCard({ event, tall, now }) {
  const nav = useNav()
  const live = isLive(event, now)
  const ended = !live && isPast(event, now)
  const faces = (event.open || []).slice(0, 2).map((s) => studentById[s])
  return (
    <div className={`pin ${ended ? 'ended' : ''}`}>
      <button className="pin-main" onClick={() => nav.push('event', { id: event.id })}>
        <Cover event={event} className={`pin-cover ${tall ? 'tall' : ''}`}>
          <div className="pin-top">
            {live ? <span className="pin-badge"><LiveDot /></span> : <span className="pin-badge">{ended ? endedWord(event, now) : dayBadge(event.startAt)}</span>}
            {!event.cost && <span className="pin-badge">Free</span>}
          </div>
          <div className="pin-shade">
            <strong>{event.title}</strong>
            <span>{live ? 'Happening now' : ended ? `${endedWord(event, now)} ${fmtTime(event.endAt)}` : fmtTime(event.startAt)} · {event.place.split(',')[0]}</span>
          </div>
        </Cover>
      </button>
      <div className="pin-foot">
        <span className="pin-people">
          <span className="faces">{faces.map((p) => <Avatar key={p.id} person={p} size={22} />)}</span>
          <GoingCount event={event} />
        </span>
        <SaveButton event={event} />
      </div>
    </div>
  )
}

// How many columns fit: 2 on phones, 3 on iPad, up to 5 on wide screens
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

// Columns that fill evenly (left to right), with a mix of tall and short cards
function Board({ events, now }) {
  const ref = useRef(null)
  const n = useColumns(ref)
  const cols = Array.from({ length: n }, () => [])
  events.forEach((e, i) => cols[i % n].push({ e, i, tall: (i + Math.floor(i / n)) % 2 === 0 }))
  return (
    <div ref={ref} className="masonry" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {cols.map((c, k) => (
        <div key={k} className="masonry-col">
          {c.map(({ e, i, tall }) => (
            <div key={e.id} className="pop-in" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}><BoardCard event={e} tall={tall} now={now} /></div>
          ))}
        </div>
      ))}
    </div>
  )
}
