// Small shared UI pieces.
import { createContext, useContext } from 'react'
import { ChevronLeft, Clock, MapPin, Users, CheckCircle2, AlertTriangle, CalendarPlus, Radio, Sparkles } from 'lucide-react'
import { interestById } from './data'
import { fmtRange, dayLabel, costLabel, fitCheck, isLive, initials } from './utils'
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

export function EventCard({ event }) {
  const nav = useNav()
  const { state } = useStore()
  const live = isLive(event)
  const r = state.rsvp[event.id]
  return (
    <button className="card event-card" onClick={() => nav.push('event', { id: event.id })}>
      <div className="event-emoji" aria-hidden="true">{event.emoji}</div>
      <div className="event-body">
        <div className="event-top">
          <span className="event-tag">{interestById[event.interest]?.label}</span>
          {live && <LiveDot />}
          {r === 'going' && <span className="pill pill-going">Going</span>}
          {r === 'saved' && <span className="pill">Saved</span>}
        </div>
        <h3 className="event-title">{event.title}</h3>
        <div className="meta"><Clock size={14} /> {live ? `Now · until ${fmtRange(event).split('– ')[1]}` : `${dayLabel(event.startAt)} · ${fmtRange(event)}`}</div>
        <div className="meta"><MapPin size={14} /> {event.place}</div>
        <div className="event-foot">
          <span className="meta"><Users size={14} /> {event.going} going</span>
          <span className="cost">{costLabel(event.cost)}</span>
          {event.soloFriendly && <span className="pill pill-solo"><Sparkles size={12} /> Solo-friendly</span>}
        </div>
        {!live && <FitBadge event={event} compact />}
      </div>
    </button>
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
