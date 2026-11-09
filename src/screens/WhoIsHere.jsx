import { ShieldCheck, MessageCircle, Users } from 'lucide-react'
import { studentById, interestById } from '../data'
import { Avatar, LiveDot, TopBar, useExplain, useNav } from '../components'
import { useStore } from '../store'

export default function WhoIsHere({ id }) {
  const nav = useNav()
  const { state, eventById, joinGroup, openDM } = useStore()
  const [explain, popup] = useExplain()
  const e = eventById[id]
  const solos = e.here.filter((s) => !state.blocked.includes(s)).map((s) => studentById[s])

  return (
    <div className="screen">
      <TopBar title="Who's here" />
      <div className="here-head">
        <LiveDot />
        <h1>{e.title}</h1>
        <p className="muted">{e.place}</p>
      </div>

      <div className="card solo-crew">
        <Users size={26} />
        <h2>{solos.length} people came solo</h2>
        <p>They opted in to meet new people at this event. Join the group chat to find each other and walk in together.</p>
        <div className="avatars">{solos.map((p) => <Avatar key={p.id} person={p} size={38} />)}</div>
        <button className="btn btn-gold btn-lg" onClick={() => explain('group', () => nav.push('chat', { id: joinGroup(e.id) }))}>Join the solo group chat</button>
        <p className="small"><ShieldCheck size={14} /> You'll share your first name + interests. Your exact location is never shown.</p>
      </div>

      <h2 className="section-title">Looking for company</h2>
      <div className="stack">
        {solos.map((p) => {
          const shared = p.interests.filter((i) => state.user?.interests?.includes(i))
          return (
            <div key={p.id} className="card person">
              <Avatar person={p} size={44} />
              <div className="person-info">
                <strong>{p.name}</strong>
                <span>{p.interests.map((i) => interestById[i].label).join(' · ')}</span>
                {shared.length > 0 && <span className="shared">You both like {interestById[shared[0]].label}</span>}
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => explain('chat', () => nav.push('chat', { id: openDM(p.id), eventId: e.id }))}><MessageCircle size={14} /> Say hi</button>
            </div>
          )
        })}
      </div>
      {popup}
    </div>
  )
}
