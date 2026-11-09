import { useState } from 'react'
import { Compass } from 'lucide-react'
import { INTERESTS } from '../data'
import { Avatar, EventCard, LiveBanner, Logo, SignInButton, StyleButton, useNav } from '../components'
import { useStore } from '../store'
import { isLive, isPast, dayLabel, fitCheck } from '../utils'

// Shared logic for every Home style
export function useHomeData() {
  const { state, events } = useStore()
  const [now] = useState(() => Date.now())
  const user = state.user
  const interests = user?.interests?.length ? user.interests : INTERESTS.map((i) => i.id)
  const busy = user?.busy || []
  const upcoming = events.filter((e) => !isPast(e, now))
  const live = upcoming.filter((e) => isLive(e, now))
  const myLive = live.find((e) => state.rsvp[e.id] === 'going')
  const today = upcoming.filter((e) => !isLive(e, now) && dayLabel(e.startAt) === 'Today')
  const forYou = upcoming
    .filter((e) => dayLabel(e.startAt) !== 'Today' && interests.includes(e.interest))
    .sort((a, b) => (fitCheck(a, busy).status === 'conflict') - (fitCheck(b, busy).status === 'conflict') || a.startAt - b.startAt)
    .slice(0, 5)
  const fitsCount = forYou.filter((e) => fitCheck(e, busy).status === 'fits').length
  return { user, now, upcoming, live, myLive, today, forYou, fitsCount, busy }
}

export function HomeHeader() {
  const nav = useNav()
  const { state } = useStore()
  return (
    <header className="home-head">
      <Logo />
      <div className="head-actions">
        <StyleButton />
        {state.user ? (
          <button className="avatar-btn" onClick={() => nav.push('profile')} aria-label="Profile">
            <Avatar person={{ name: state.user.name, color: 'var(--green)' }} size={36} />
          </button>
        ) : <SignInButton />}
      </div>
    </header>
  )
}

export function CaughtUp() {
  const nav = useNav()
  return (
    <div className="caught-up">
      <div className="caught-check">✓</div>
      <strong>You're all caught up</strong>
      <p className="muted">That's everything picked for you this week. Go live your life 🌿</p>
      <button className="btn btn-outline" onClick={() => nav.tab('explore')}><Compass size={16} /> Browse all events</button>
    </div>
  )
}

export default function Home() {
  const { user, now, live, myLive, today, forYou, fitsCount, busy } = useHomeData()
  return (
    <div className="screen">
      <HomeHeader />
      <div className="greeting">
        <h1>{user ? `Hey ${user.name} 👋` : "What's on at Sac State"}</h1>
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
        <h2 className="section-title">{user ? 'This week for you' : 'This week'}</h2>
        {busy.length > 0 && forYou.length > 0 && <p className="muted section-sub">{fitsCount} of these fit around your schedule</p>}
        <div className="stack">{forYou.map((e) => <EventCard key={e.id} event={e} />)}</div>
      </section>

      <CaughtUp />
    </div>
  )
}
