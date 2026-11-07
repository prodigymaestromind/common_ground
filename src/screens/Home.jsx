import { useState } from 'react'
import { Compass } from 'lucide-react'
import { Avatar, EventCard, LiveBanner, Logo, useNav } from '../components'
import { useStore } from '../store'
import { isLive, isPast, dayLabel, fitCheck } from '../utils'

export default function Home() {
  const nav = useNav()
  const { state, events } = useStore()
  const user = state.user
  const [now] = useState(() => Date.now())
  const upcoming = events.filter((e) => !isPast(e, now))
  const live = upcoming.filter((e) => isLive(e, now))
  const myLive = live.find((e) => state.rsvp[e.id] === 'going')
  const today = upcoming.filter((e) => !isLive(e, now) && dayLabel(e.startAt) === 'Today')
  const forYou = upcoming
    .filter((e) => dayLabel(e.startAt) !== 'Today' && user.interests.includes(e.interest))
    .sort((a, b) => (fitCheck(a, user.busy).status === 'conflict') - (fitCheck(b, user.busy).status === 'conflict') || a.startAt - b.startAt)
    .slice(0, 5)
  const fitsCount = forYou.filter((e) => fitCheck(e, user.busy).status === 'fits').length

  return (
    <div className="screen">
      <header className="home-head">
        <Logo />
        <button className="avatar-btn" onClick={() => nav.push('profile')} aria-label="Profile">
          <Avatar person={{ name: user.name, color: 'var(--green)' }} size={36} />
        </button>
      </header>

      <div className="greeting">
        <h1>Hey {user.name} 👋</h1>
        <p className="muted">{new Date(now).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {myLive && <LiveBanner event={myLive} />}

      {live.length > 0 && (
        <section>
          <h2 className="section-title">Happening now</h2>
          <div className="stack">{live.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      {today.length > 0 && (
        <section>
          <h2 className="section-title">Later today</h2>
          <div className="stack">{today.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      <section>
        <h2 className="section-title">This week for you</h2>
        {user.busy.length > 0 && forYou.length > 0 && (
          <p className="muted section-sub">{fitsCount} of these fit around your schedule</p>
        )}
        <div className="stack">{forYou.map((e) => <EventCard key={e.id} event={e} />)}</div>
      </section>

      <div className="caught-up">
        <div className="caught-check">✓</div>
        <strong>You're all caught up</strong>
        <p className="muted">That's everything picked for you this week. Go live your life 🌿</p>
        <button className="btn btn-outline" onClick={() => nav.tab('explore')}><Compass size={16} /> Browse all events</button>
      </div>
    </div>
  )
}
