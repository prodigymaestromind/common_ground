import { HeartHandshake, Check } from 'lucide-react'
import { studentById } from '../data'
import { Avatar, EventCard, Empty, useGate, useNav } from '../components'
import { BOARDS, Masonry } from './HomeBoard'
import { Stamps } from './Crews'
import { useStore } from '../store'
import { isPast } from '../utils'

export default function Plans() {
  const nav = useNav()
  const gate = useGate()
  const { state, dispatch, events, eventById, showToast } = useStore()
  const boardStyle = state.style === 'board'
  const going = events.filter((e) => state.rsvp[e.id] === 'going' && !isPast(e)).sort((a, b) => a.startAt - b.startAt)
  const saved = events.filter((e) => state.rsvp[e.id] === 'saved' && !isPast(e)).sort((a, b) => a.startAt - b.startAt)

  // Meet-ups = accepted invites in any chat
  const meetups = Object.values(state.chats).flatMap((c) =>
    c.messages.filter((m) => m.kind === 'invite' && m.invite.status === 'accepted').map((m) => ({ chat: c, m })),
  )
  // People you've actually talked with (they replied)
  const met = [...new Set(Object.values(state.chats).flatMap((c) =>
    c.messages.some((m) => m.from === 'me') ? c.messages.map((m) => m.from).filter((f) => studentById[f]) : [],
  ))].filter((s) => !state.blocked.includes(s))

  const askKeep = (s) => {
    dispatch({ type: 'KEEP_IN_TOUCH', studentId: s, value: 'asked' })
    setTimeout(() => {
      dispatch({ type: 'KEEP_IN_TOUCH', studentId: s, value: 'connected' })
      showToast(`You and ${studentById[s].name} both said yes 🎉`)
    }, 1800)
  }

  return (
    <div className="screen">
      <h1 className="page-title">My plans</h1>
      {!state.user && (
        <div className="card locked">
          <p><strong>Saved events live here.</strong> Sign in to RSVP, set meet-ups and keep in touch with people.</p>
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

      <section>
        <h2 className="section-title">Going</h2>
        {going.length === 0 ? <Empty icon="📅" title="Nothing planned yet">Tap “I'm going” on an event and it shows up here.</Empty>
          : <div className="stack">{going.map((e) => <EventCard key={e.id} event={e} />)}</div>}
      </section>

      {boardStyle && BOARDS.map((b) => {
        const items = events.filter((e) => state.boards[e.id] === b && !isPast(e))
        if (!items.length) return null
        return (
          <section key={b}>
            <h2 className="section-title">📌 {b}</h2>
            <Masonry events={items} />
          </section>
        )
      })}

      {!boardStyle && saved.length > 0 && (
        <section>
          <h2 className="section-title">Saved for later</h2>
          <div className="stack">{saved.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      {state.user && state.style === 'crews' && <Stamps />}

      {met.length > 0 && (
        <section>
          <h2 className="section-title">Stay in touch?</h2>
          <p className="muted section-sub">Contact info is only shared if you <b>both</b> say yes.</p>
          <div className="stack-sm">
            {met.map((s) => {
              const p = studentById[s]
              const st = state.keepInTouch[s]
              return (
                <div key={s} className="card person">
                  <Avatar person={p} size={40} />
                  <div className="person-info"><strong>{p.name}</strong><span>{p.major}</span></div>
                  {!st && <button className="btn btn-sm btn-primary" onClick={() => askKeep(s)}><HeartHandshake size={14} /> Stay in touch</button>}
                  {st === 'asked' && <span className="status">Waiting for {p.name}…</span>}
                  {st === 'connected' && <span className="status ok"><Check size={14} /> Connected</span>}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
