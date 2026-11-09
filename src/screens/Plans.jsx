import { studentById } from '../data'
import { Avatar, EventCard, Empty, useGate, useNav } from '../components'
import { useStore } from '../store'
import { isGone, weekBucket } from '../utils'
import { KeepInTouchButton } from './StayInTouch'

// Group events under "This week" / "Next week" / "Later"
function ByWeek({ events }) {
  const groups = ['This week', 'Next week', 'Later']
    .map((label) => ({ label, items: events.filter((e) => weekBucket(e.startAt) === label) }))
    .filter((g) => g.items.length)
  return groups.map((g) => (
    <div key={g.label} className="stack">
      <h3 className="week-label">{g.label}</h3>
      {g.items.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  ))
}

export default function Plans() {
  const nav = useNav()
  const gate = useGate()
  const { state, events, eventById } = useStore()
  const upcoming = events.filter((e) => !isGone(e)).sort((a, b) => a.startAt - b.startAt)
  const going = upcoming.filter((e) => state.rsvp[e.id] === 'going')
  const saved = upcoming.filter((e) => state.rsvp[e.id] === 'saved')
  const hosting = upcoming.filter((e) => e.mine)

  // Meet-ups = accepted invites in any chat
  const meetups = Object.values(state.chats).flatMap((c) =>
    c.messages.filter((m) => m.kind === 'invite' && m.invite.status === 'accepted').map((m) => ({ chat: c, m })),
  )
  // People you've actually talked with
  const met = [...new Set(Object.values(state.chats).flatMap((c) =>
    c.messages.some((m) => m.from === 'me') ? c.messages.map((m) => m.from).filter((f) => studentById[f]) : [],
  ))].filter((s) => !state.blocked.includes(s))

  return (
    <div className="screen">
      <h1 className="page-title">My plans</h1>
      {!state.user && (
        <div className="card locked">
          <p><strong>Your saved events live here.</strong> Sign in to RSVP, set meet-ups and keep in touch with people.</p>
          <button className="btn btn-sm btn-primary" onClick={() => gate('student')}>Sign in</button>
        </div>
      )}

      {meetups.length > 0 && (
        <section>
          <h2 className="section-title">Meet-ups set</h2>
          <div className="stack-sm">
            {meetups.map(({ chat, m }) => {
              const p = studentById[chat.studentId]
              const ev = eventById[m.invite.eventId]
              return (
                <button key={m.id} className="card meetup" onClick={() => nav.push('chat', { id: chat.id })}>
                  <Avatar person={p} size={40} />
                  <div>
                    <strong>Meet {p.name} · {m.invite.time}</strong>
                    <span className="muted">{m.invite.spot} · {ev?.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {hosting.length > 0 && (
        <section>
          <h2 className="section-title">Hosting</h2>
          <div className="stack">{hosting.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      <section>
        <h2 className="section-title">✓ Going</h2>
        {going.length === 0 ? <Empty icon="📅" title="Nothing yet">Tap “I'm going” on an event and it shows up here.</Empty>
          : <div className="stack"><ByWeek events={going} /></div>}
      </section>

      <section>
        <h2 className="section-title">🔖 Saved for later</h2>
        {saved.length === 0 ? <Empty icon="🔖" title="Nothing saved">Tap the bookmark on any event to save it here.</Empty>
          : <div className="stack"><ByWeek events={saved} /></div>}
      </section>

      {met.length > 0 && (
        <section>
          <h2 className="section-title">Stay in touch?</h2>
          <p className="muted section-sub">Swap Instagram, Discord and more. Only shared if you <b>both</b> say yes.</p>
          <div className="stack-sm">
            {met.map((s) => {
              const p = studentById[s]
              return (
                <div key={s} className="card person">
                  <Avatar person={p} size={40} />
                  <div className="person-info"><strong>{p.name}</strong><span>{p.major}</span></div>
                  <KeepInTouchButton studentId={s} />
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
