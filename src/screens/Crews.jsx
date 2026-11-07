// "Crews" style: small groups that go to things together (inspired by clans,
// without leaderboards or points), plus personal "firsts" stamps.
import { useState } from 'react'
import { Users, MessageCircle, Megaphone, LogOut } from 'lucide-react'
import { CREWS, STAMPS, studentById, interestById } from '../data'
import { Avatar, Cover, EventCard, LiveBanner, Sheet, TopBar, useGate, useNav } from '../components'
import { useStore } from '../store'
import { dayLabel, fmtTime, isPast } from '../utils'
import { HomeHeader, CaughtUp, useHomeData } from './Home'

export default function HomeCrews() {
  const nav = useNav()
  const { state, eventById } = useStore()
  const { user, live, myLive, today, forYou } = useHomeData()
  const mine = CREWS.filter((c) => state.crews.includes(c.id))
  const others = CREWS.filter((c) => !state.crews.includes(c.id))
    .sort((a, b) => (user?.interests?.includes(b.interest) ? 1 : 0) - (user?.interests?.includes(a.interest) ? 1 : 0))
  const plans = CREWS.map((c) => ({ crew: c, ev: eventById[c.plan.eventId] })).filter((p) => p.ev && !isPast(p.ev))

  return (
    <div className="screen">
      <HomeHeader />
      <div className="greeting">
        <h1>{user ? `Hey ${user.name} 👋` : 'Find your crew'}</h1>
        <p className="muted">Small groups (6 max) that go to campus events together.</p>
      </div>

      {myLive && <LiveBanner event={myLive} />}

      {mine.length > 0 && (
        <section>
          <h2 className="section-title">Your crews</h2>
          <div className="crew-row">{mine.map((c) => <CrewCard key={c.id} crew={c} mine />)}</div>
        </section>
      )}

      <section>
        <h2 className="section-title">{mine.length ? 'More crews' : 'Crews you might like'}</h2>
        <div className="crew-row">{others.map((c) => <CrewCard key={c.id} crew={c} />)}</div>
      </section>

      <section>
        <h2 className="section-title">Crew plans this week</h2>
        <div className="stack-sm">
          {plans.map(({ crew, ev }) => (
            <button key={crew.id} className="card crew-plan" onClick={() => nav.push('event', { id: ev.id })}>
              <Cover event={ev} className="event-thumb" small />
              <div>
                <span className="crew-tag" style={{ background: crew.color }}>{crew.emblem} {crew.name}</span>
                <strong>{ev.title}</strong>
                <span className="muted">{dayLabel(ev.startAt)} · {fmtTime(ev.startAt)} · {crew.plan.note}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {user && <Stamps />}

      {live.length > 0 && (
        <section>
          <h2 className="section-title">Happening now</h2>
          <div className="stack">{live.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}
      {[...today, ...forYou].length > 0 && (
        <section>
          <h2 className="section-title">Coming up</h2>
          <div className="stack">{[...today, ...forYou].map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}
      <CaughtUp />
    </div>
  )
}

function CrewCard({ crew, mine }) {
  const nav = useNav()
  return (
    <button className="crew-card" style={{ '--crew': crew.color }} onClick={() => nav.push('crew', { id: crew.id })}>
      <span className="crew-emblem">{crew.emblem}</span>
      <strong>{crew.name}</strong>
      <span className="crew-meta">{interestById[crew.interest].label} · {crew.members.length + (mine ? 1 : 0)}/6</span>
      <span className="faces">{crew.members.slice(0, 4).map((m) => <Avatar key={m} person={studentById[m]} size={22} />)}</span>
    </button>
  )
}

export function Stamps() {
  const { state } = useStore()
  const got = STAMPS.filter((s) => state.stamps[s.id]).length
  return (
    <section>
      <h2 className="section-title">Your firsts · {got}/{STAMPS.length}</h2>
      <p className="muted section-sub">Just for you. Never ranked or shown to anyone.</p>
      <div className="stamps">
        {STAMPS.map((s) => (
          <div key={s.id} className={`stamp ${state.stamps[s.id] ? 'on' : ''}`} title={s.hint}>
            <span className="stamp-emoji">{s.emoji}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Crew({ id }) {
  const nav = useNav()
  const gate = useGate()
  const { state, dispatch, events, eventById, joinCrew, rallyCrew, showToast } = useStore()
  const [rally, setRally] = useState(false)
  const crew = CREWS.find((c) => c.id === id)
  const joined = state.crews.includes(id)
  const plan = eventById[crew.plan.eventId]
  const upcoming = events.filter((e) => !isPast(e)).sort((a, b) => a.startAt - b.startAt)
  const full = crew.members.length >= 6

  return (
    <div className="screen">
      <TopBar title="" />
      <div className="crew-hero" style={{ background: crew.color }}>
        <span className="crew-emblem big">{crew.emblem}</span>
        <h1>{crew.name}</h1>
        <p>{crew.about}</p>
        <span className="crew-meta light">{interestById[crew.interest].emoji} {interestById[crew.interest].label} · {crew.members.length + (joined ? 1 : 0)}/6 members</span>
      </div>

      {!joined ? (
        <button className="btn btn-gold btn-lg" disabled={full}
          onClick={() => gate('student', () => { const chat = joinCrew(id); showToast(`You joined ${crew.name} 🎉`); nav.push('chat', { id: chat }) }, 'Sign in to join a crew')}>
          <Users size={18} /> {full ? 'Crew is full' : 'Join crew'}
        </button>
      ) : (
        <div className="row-btns">
          <button className="btn btn-primary grow" onClick={() => nav.push('chat', { id: `crew-${id}` })}><MessageCircle size={16} /> Crew chat</button>
          <button className="btn btn-gold grow" onClick={() => setRally(true)}><Megaphone size={16} /> Rally</button>
        </div>
      )}

      {plan && (
        <section>
          <h2 className="section-title">Next plan</h2>
          <button className="card crew-plan" onClick={() => nav.push('event', { id: plan.id })}>
            <Cover event={plan} className="event-thumb" small />
            <div><strong>{plan.title}</strong><span className="muted">{dayLabel(plan.startAt)} · {fmtTime(plan.startAt)}</span><span className="muted">📍 {crew.plan.note}</span></div>
          </button>
        </section>
      )}

      <section>
        <h2 className="section-title">Members</h2>
        <div className="stack-sm">
          {crew.members.map((m) => {
            const p = studentById[m]
            return (
              <div key={m} className="card person">
                <Avatar person={p} size={40} />
                <div className="person-info"><strong>{p.name}</strong><span>{p.year} · {p.major}</span></div>
              </div>
            )
          })}
          {joined && <div className="card person"><Avatar person={{ name: state.user.name, color: 'var(--green)' }} size={40} /><div className="person-info"><strong>{state.user.name} (you)</strong></div></div>}
        </div>
      </section>

      {joined && (
        <button className="btn btn-ghost danger" onClick={() => { dispatch({ type: 'LEAVE_CREW', crewId: id }); showToast('You left the crew') }}>
          <LogOut size={16} /> Leave crew
        </button>
      )}

      <Sheet open={rally} onClose={() => setRally(false)} title="Rally the crew">
        <p className="muted">Pick something and ask who's in. No pressure, people answer when they can.</p>
        <div className="stack-sm">
          {upcoming.slice(0, 8).map((e) => (
            <button key={e.id} className="option" onClick={() => { setRally(false); nav.push('chat', { id: rallyCrew(id, e.id) }) }}>
              {e.emoji} {e.title} · <span className="muted">{dayLabel(e.startAt).split(',')[0]}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
