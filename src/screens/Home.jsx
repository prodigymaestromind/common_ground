// Shared pieces for the Home screen (HomeBoard.jsx is the Home screen).
import { useState } from 'react'
import { Compass } from 'lucide-react'
import { INTERESTS } from '../data'
import { Avatar, Logo, SignInButton, useNav } from '../components'
import { useStore } from '../store'
import { isLive, isGone, dayLabel, fitCheck } from '../utils'

// Shared logic for every Home style
export function useHomeData() {
  const { state, events } = useStore()
  const [now] = useState(() => Date.now())
  const user = state.user
  const interests = user?.interests?.length ? user.interests : INTERESTS.map((i) => i.id)
  const busy = user?.busy || []
  // today's events stay until midnight, even after they end
  const upcoming = events.filter((e) => !isGone(e, now))
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
      <p className="muted">That's everything here. Go live your life 🌿</p>
      <button className="btn btn-outline" onClick={() => nav.tab('explore')}><Compass size={16} /> Browse all events</button>
    </div>
  )
}
