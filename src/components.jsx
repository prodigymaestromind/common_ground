// Small shared UI pieces.
import { createContext, useContext, useState } from 'react'
import { ChevronLeft, Clock, MapPin, Users, CheckCircle2, AlertTriangle, CalendarPlus, Radio, Sparkles, Check, Bookmark, BookmarkCheck } from 'lucide-react'
import { interestById } from './data'
import { PLACES, photoUrl } from './places'
import { fmtRange, dayLabel, costLabel, fitCheck, isLive, isPast, initials } from './utils'
import { useStore } from './store'

// ----- Navigation (a simple screen stack) -----
export const NavCtx = createContext(null)
export const useNav = () => useContext(NavCtx)

export function Logo({ size = 28, light = false }) {
  return (
    <span className="logo" style={{ color: light ? '#fff' : 'var(--green)' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="12" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="20" cy="16" r="9" fill="none" stroke="var(--gold)" strokeWidth="3" />
      </svg>
      <span>Common Ground</span>
    </span>
  )
}

export function TopBar({ title, back = true, right }) {
  const nav = useNav()
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" onClick={nav.pop} aria-label="Back">
          <ChevronLeft size={22} />
        </button>
      ) : <span style={{ width: 36 }} />}
      <h1 className="topbar-title">{title}</h1>
      <span className="topbar-right">{right}</span>
    </header>
  )
}

export function Avatar({ person, size = 40 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: person.color || 'var(--green)', fontSize: size * 0.42 }}>
      {initials(person.name)}
    </span>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button className={`chip ${active ? 'chip-on' : ''}`} onClick={onClick} aria-pressed={!!active}>
      {children}
    </button>
  )
}

export function FitBadge({ event, compact }) {
  const { state } = useStore()
  const fit = fitCheck(event, state.user?.busy)
  if (fit.status === 'unknown') return compact ? null : <div className="fit fit-unknown"><CalendarPlus size={16} /> {fit.note}</div>
  const Icon = fit.status === 'fits' ? CheckCircle2 : AlertTriangle
  return (
    <div className={`fit fit-${fit.status}`}>
      <Icon size={compact ? 14 : 16} />
      {compact ? (fit.status === 'fits' ? 'Fits your day' : 'Conflicts') : fit.note}
    </div>
  )
}

export function LiveDot() {
  return <span className="live"><span className="live-dot" /> LIVE</span>
}

// Save / Saved / Going: one tap to save, no lists to pick
export function SaveButton({ event, className = '' }) {
  const { state, dispatch, showToast } = useStore()
  const nav = useNav()
  const r = state.rsvp[event.id]
  if (event.mine) return null
  if (r === 'going') {
    return (
      <button className={`save going ${className}`} onClick={() => nav.push('event', { id: event.id })} aria-label="You're going">
        <Check size={17} strokeWidth={3} />
      </button>
    )
  }
  const saved = r === 'saved'
  return (
    <button
      className={`save ${saved ? 'on' : ''} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? 'Saved. Tap to unsave' : 'Save'}
      onClick={(ev) => {
        ev.stopPropagation()
        dispatch({ type: 'RSVP', eventId: event.id, value: saved ? null : 'saved' })
        showToast(saved ? 'Removed from saved' : 'Saved 🔖 Find it in Plans')
      }}
    >
      {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
    </button>
  )
}

export function StatusPill({ event }) {
  const { state } = useStore()
  if (event.mine) return <span className="pill pill-host">Hosting</span>
  const r = state.rsvp[event.id]
  if (r === 'going') return <span className="pill pill-going"><Check size={12} strokeWidth={3} /> Going</span>
  if (r === 'saved') return <span className="pill pill-saved"><BookmarkCheck size={12} /> Saved</span>
  return null
}

export const SoloBadge = () => <span className="pill pill-solo"><Sparkles size={12} /> Welcomes solo</span>

export function EventCard({ event, preview }) {
  const nav = useNav()
  const live = isLive(event)
  const ended = !live && isPast(event)
  return (
    <div className={`card event-card-wrap ${ended ? 'ended' : ''}`}>
    <button className="event-card" onClick={() => !preview && nav.push('event', { id: event.id })} tabIndex={preview ? -1 : 0}>
      <Cover event={event} className="event-thumb" small />
      <div className="event-body">
        <div className="event-top">
          <span className="event-tag">{interestById[event.interest]?.label}</span>
          {live && <LiveDot />}
          <StatusPill event={event} />
        </div>
        <h3 className="event-title">{event.title}</h3>
        <div className="meta"><Clock size={14} /> {live ? `Now · until ${fmtRange(event).split('– ')[1]}` : ended ? `Ended · ${fmtRange(event)}` : `${dayLabel(event.startAt)} · ${fmtRange(event)}`}</div>
        <div className="meta"><MapPin size={14} /> {event.place}</div>
        <div className="event-foot">
          {event.hideCount ? <span className="pill pill-new">New event</span> : typeof event.going === 'number' && <span className="meta"><Users size={14} /> {event.going} going</span>}
          <span className="cost">{costLabel(event.cost)}</span>
          {event.soloFriendly && <SoloBadge />}
        </div>
        {!live && !ended && !preview && <FitBadge event={event} compact />}
      </div>
    </button>
    {!preview && <SaveButton event={event} className="card-save" />}
    </div>
  )
}

export function LiveBanner({ event }) {
  const nav = useNav()
  return (
    <button className="live-banner" onClick={() => nav.push('event', { id: event.id })}>
      <Radio size={22} />
      <div>
        <strong>{event.title} is happening now</strong>
        <span>{event.place.split(',')[0]} · {event.here?.length || 0} people came solo</span>
      </div>
    </button>
  )
}

export function Empty({ icon = '✓', title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-handle" />
        {title && <h2 className="sheet-title">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

// ----- Photo cover: your photo in public/places/<id>.jpg, or a colored illustration -----
const missing = new Set()
export function Cover({ event, placeId, className = '', small, children }) {
  const id = placeId || event?.placeId || 'union'
  const place = PLACES[id] || PLACES.union
  const src = event?.image || (!missing.has(id) ? photoUrl(id) : null)
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = !src || failedSrc === src
  const [c1, c2] = place.colors
  return (
    <div className={`cover ${className}`} style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      {!failed && (
        <img src={src} alt={place.name} loading="lazy"
          onError={() => { if (!event?.image) missing.add(id); setFailedSrc(src) }} />
      )}
      {failed && (
        <div className="cover-art" aria-hidden="true">
          <span className="cover-icon">{event?.emoji || place.icon}</span>
          {!small && <span className="cover-place">{place.short}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

// ----- Sign in only when needed -----
export function useGate() {
  const nav = useNav()
  const { state } = useStore()
  return (role, then, reason) => {
    if (state.user) return then?.()
    nav.push('signin', { role, reason, then })
  }
}

export function SignInButton() {
  const nav = useNav()
  return <button className="btn btn-sm btn-outline" onClick={() => nav.push('signin', {})}>Sign in</button>
}

// ----- Gentle "how this works" pop-ups (each shows once) -----
// usage: const explain = useExplain(); explain('group', () => doTheThing())
export const TIPS = {
  count: {
    icon: '👥', title: 'How many are going',
    lines: [
      'This number counts students who tapped “I\'m going” on Common Ground.',
      'Each club or organizer picks whether to show it. A small number can scare people off, so they can hide it and students see “New event” instead.',
    ],
    demo: '🧪 Preview: the numbers are sample counts for now.',
  },
  company: {
    icon: '👋', title: 'Open to company',
    lines: [
      'Turn this on and other people going to this event can see your first name and interests, and you see theirs.',
      'It only applies to this one event, and you can turn it off anytime.',
    ],
  },
  chat: {
    icon: '💬', title: 'Say hi / Invite',
    lines: [
      'Send a quick message or an invite to meet up at a public spot before the event, so you can walk in together.',
      'Only people who also turned on “open to company” show up here.',
    ],
  },
  group: {
    icon: '🫂', title: 'Solo group chat',
    lines: [
      'Everyone in this chat came to the event alone and wants to meet people.',
      'Use it to find each other (“I\'m by the entrance”) and hang out together. Only first names + interests are shared, never your location.',
    ],
  },
  stay: {
    icon: '🤝', title: 'Stay in touch',
    lines: [
      'Pick what to share, like your Instagram. The other person gets a request.',
      'You only see each other\'s info if you BOTH say yes. Otherwise nothing is shared.',
    ],
  },
}

export function useExplain() {
  const { state } = useStore()
  const [open, setOpen] = useState(null) // { key, then }
  const explain = (key, then) => {
    if (state.tips?.[key]) return then?.()
    setOpen({ key, then })
  }
  const popup = open ? <ExplainSheet tipKey={open.key} onDone={() => { const f = open.then; setOpen(null); f?.() }} /> : null
  return [explain, popup]
}

function ExplainSheet({ tipKey, onDone }) {
  const { dispatch } = useStore()
  const tip = TIPS[tipKey]
  const done = () => { dispatch({ type: 'TIP_SEEN', key: tipKey }); onDone() }
  return (
    <Sheet open onClose={done} title="">
      <div className="explain">
        <div className="explain-icon">{tip.icon}</div>
        <h2>{tip.title}</h2>
        {tip.lines.map((l) => <p key={l}>{l}</p>)}
        <p className="explain-demo">{tip.demo || '🧪 Preview: the people here are sample students and their replies are automatic for now.'}</p>
        <button className="btn btn-primary btn-lg" onClick={done}>Got it</button>
      </div>
    </Sheet>
  )
}
