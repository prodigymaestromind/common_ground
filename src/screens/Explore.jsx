import { useState } from 'react'
import { Search, List, Map as MapIcon } from 'lucide-react'
import { INTERESTS } from '../data'
import { Chip, EventCard, Empty } from '../components'
import { useStore } from '../store'
import { isGone, dayLabel, fitCheck, weekBucket } from '../utils'
import CampusMap from './MapView'

const QUICK = [
  { id: 'free', label: 'Free' },
  { id: 'fits', label: '✓ Fits my day' },
  { id: 'solo', label: '✨ Welcomes solo' },
]

const remembered = { view: 'list', range: 'This week' }

export default function Explore() {
  const { state, events } = useStore()
  const [q, setQ] = useState('')
  const [quick, setQuick] = useState([])
  const [interest, setInterest] = useState(null)
  // remember List/Map + week tab when you come back from an event
  const [view, setViewState] = useState(remembered.view)
  const [range, setRangeState] = useState(remembered.range)
  const setView = (v) => { remembered.view = v; setViewState(v) }
  const setRange = (r) => { remembered.range = r; setRangeState(r) }

  const toggleQuick = (id) => setQuick((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))
  const list = events
    .filter((e) => !isGone(e))
    .filter((e) => range === 'All upcoming' || weekBucket(e.startAt) === range)
    .filter((e) => !q || `${e.title} ${e.host} ${e.place}`.toLowerCase().includes(q.toLowerCase()))
    .filter((e) => !interest || e.interest === interest)
    .filter((e) => !quick.includes('free') || !e.cost)
    .filter((e) => !quick.includes('solo') || e.soloFriendly)
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
    <div className="screen">
      <div className="title-row">
        <h1 className="page-title">Explore</h1>
        <div className="seg seg-sm">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><List size={15} /> List</button>
          <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}><MapIcon size={15} /> Map</button>
        </div>
      </div>
      <div className="seg">
        {['This week', 'Next week', 'All upcoming'].map((r) => (
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

      {view === 'map' && <CampusMap events={list} />}
      {view === 'list' && groups.length === 0 && <Empty icon="🔍" title="Nothing matches">Try removing a filter.</Empty>}
      {view === 'list' && groups.map((g) => (
        <section key={g.label}>
          <h2 className="section-title">{g.label}</h2>
          <div className="stack">{g.items.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      ))}
      {view === 'list' && groups.length > 0 && <p className="end-note">That's everything {range === 'All upcoming' ? 'coming up' : range.toLowerCase()} ✓{range === 'This week' && <> · <button className="link" onClick={() => setRange('Next week')}>See next week →</button></>}</p>}
    </div>
  )
}
