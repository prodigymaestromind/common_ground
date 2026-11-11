// Explore: search and filter every upcoming event, as a list or on the campus map.
import { lazy, Suspense } from 'react'
import { Search, List, Map as MapIcon } from 'lucide-react'
import { INTERESTS } from '../data'
import { Chip, EventCard, Empty } from '../components'
import { useNow } from '../hooks'
import { useStore } from '../store'
import { EVENTS_UPDATED } from '../realEvents'
import { isGone, dayLabel, fitCheck, fullDate, weekBucket } from '../utils'

// The map library is big, so it only loads when someone opens the map.
const CampusMap = lazy(() => import('./MapView'))

const RANGES = ['This week', 'Next week', 'All upcoming']
const QUICK = [
  { id: 'free', label: 'Free' },
  { id: 'fits', label: '✓ Fits my day' },
  { id: 'solo', label: '✨ Welcomes solo' },
  { id: 'campus', label: '📍 On campus' },
  { id: 'online', label: '💻 Online' },
]

export default function Explore() {
  const { state, events, explore, setExplore } = useStore()
  const now = useNow()
  const { view, range, q, quick, interest } = explore
  const setQ = (v) => setExplore((x) => ({ ...x, q: v }))
  const setQuick = (fn) => setExplore((x) => ({ ...x, quick: typeof fn === 'function' ? fn(x.quick) : fn }))
  const setInterest = (v) => setExplore((x) => ({ ...x, interest: v }))
  const setView = (v) => setExplore((x) => ({ ...x, view: v }))
  const setRange = (r) => setExplore((x) => ({ ...x, range: r }))

  const filtered = q || quick.length > 0 || interest
  const clear = () => setExplore((x) => ({ ...x, q: '', quick: [], interest: null }))
  const toggleQuick = (id) => setQuick((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))
  const list = events
    .filter((e) => !isGone(e, now))
    .filter((e) => range === 'All upcoming' || weekBucket(e.startAt) === range)
    .filter((e) => !q || `${e.title} ${e.host} ${e.place}`.toLowerCase().includes(q.toLowerCase()))
    .filter((e) => !interest || e.interest === interest)
    .filter((e) => !quick.includes('free') || !e.cost)
    .filter((e) => !quick.includes('solo') || e.soloFriendly)
    .filter((e) => !quick.includes('campus') || (!e.online && !e.offCampus))
    .filter((e) => !quick.includes('online') || e.online)
    .filter((e) => !quick.includes('fits') || fitCheck(e, state.user?.busy).status !== 'conflict')
    .sort((a, b) => a.startAt - b.startAt)

  const groups = []
  for (const e of list) {
    const label = dayLabel(e.startAt)
    const g = groups.find((x) => x.label === label)
    if (g) g.items.push(e)
    else groups.push({ label, items: [e] })
  }

  return (
    <div className="screen screen-wide">
      <div className="title-row">
        <h1 className="page-title">Explore</h1>
        <div className="seg seg-sm">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><List size={15} /> List</button>
          <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}><MapIcon size={15} /> Map</button>
        </div>
      </div>
      <div className="seg">
        {RANGES.map((r) => (
          <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>
      <label className="search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, clubs, places" />
      </label>
      <div className="chips-row">
        {QUICK.map((c) => <Chip key={c.id} active={quick.includes(c.id)} onClick={() => toggleQuick(c.id)}>{c.label}</Chip>)}
      </div>
      <div className="chips-row">
        {INTERESTS.map((i) => (
          <Chip key={i.id} active={interest === i.id} onClick={() => setInterest(interest === i.id ? null : i.id)}>{i.emoji} {i.label}</Chip>
        ))}
      </div>

      {view === 'map' && (
        <Suspense fallback={<div className="map map-loading">Loading map…</div>}>
          <CampusMap events={list} />
        </Suspense>
      )}
      {view === 'list' && groups.length === 0 && (
        <>
          <Empty icon="🔍" title={filtered ? 'Nothing matches' : `Nothing ${range === 'All upcoming' ? 'coming up' : range.toLowerCase()} yet`}>
            {filtered ? 'Your search or filters are hiding everything.' : 'The calendar has no events here right now.'}
          </Empty>
          {filtered
            ? <button className="btn btn-outline" onClick={clear}>Clear search and filters</button>
            : range !== 'All upcoming' && <button className="btn btn-outline" onClick={() => setRange('All upcoming')}>See all upcoming</button>}
        </>
      )}
      {view === 'list' && groups.map((g) => (
        <section key={g.label}>
          <h2 className="section-title">{g.label}</h2>
          <div className="stack card-grid">{g.items.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      ))}
      {view === 'list' && groups.length > 0 && (
        <p className="end-note">
          That's everything {range === 'All upcoming' ? 'coming up' : range.toLowerCase()} ✓
          {range === 'This week' && <> · <button className="link" onClick={() => setRange('Next week')}>See next week →</button></>}
          <br /><span className="fresh-note">Events from the Sac State calendar · updated {fullDate(`${EVENTS_UPDATED}T12:00:00`)}</span>
        </p>
      )}
    </div>
  )
}
