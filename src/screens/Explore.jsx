import { useState } from 'react'
import { Search } from 'lucide-react'
import { INTERESTS } from '../data'
import { Chip, EventCard, Empty } from '../components'
import { useStore } from '../store'
import { isPast, dayLabel, fitCheck } from '../utils'

const QUICK = [
  { id: 'free', label: 'Free' },
  { id: 'fits', label: '✓ Fits my day' },
  { id: 'solo', label: '✨ Solo-friendly' },
]

export default function Explore() {
  const { state, events } = useStore()
  const [q, setQ] = useState('')
  const [quick, setQuick] = useState([])
  const [interest, setInterest] = useState(null)

  const toggleQuick = (id) => setQuick((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))
  const list = events
    .filter((e) => !isPast(e))
    .filter((e) => !q || `${e.title} ${e.host} ${e.place}`.toLowerCase().includes(q.toLowerCase()))
    .filter((e) => !interest || e.interest === interest)
    .filter((e) => !quick.includes('free') || !e.cost)
    .filter((e) => !quick.includes('solo') || e.soloFriendly)
    .filter((e) => !quick.includes('fits') || fitCheck(e, state.user.busy).status !== 'conflict')
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
      <h1 className="page-title">Explore</h1>
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

      {groups.length === 0 && <Empty icon="🔍" title="Nothing matches">Try removing a filter.</Empty>}
      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="section-title">{g.label}</h2>
          <div className="stack">{g.items.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      ))}
      {groups.length > 0 && <p className="end-note">That's every event this week ✓</p>}
    </div>
  )
}
