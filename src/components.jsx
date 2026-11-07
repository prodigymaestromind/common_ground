// Small shared UI pieces.
import { createContext, useContext, useState } from 'react'
import { ChevronLeft, Clock, MapPin, Users, CheckCircle2, AlertTriangle, CalendarPlus, Radio, Sparkles, Palette, Check } from 'lucide-react'
import { interestById } from './data'
import { PLACES, photoUrl } from './places'
import { fmtRange, dayLabel, costLabel, fitCheck, isLive, initials } from './utils'
import { useStore, STYLES } from './store'

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
      <Cover event={event} className="event-thumb" small />
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

// ----- Photo cover: your photo in public/places/<id>.jpg, or a colored illustration -----
const missing = new Set()
export function Cover({ event, placeId, className = '', small, children }) {
  const id = placeId || event?.placeId || 'union'
  const place = PLACES[id] || PLACES.union
  const src = event?.image || (!missing.has(id) ? photoUrl(id) : null)
  const [failed, setFailed] = useState(!src)
  const [c1, c2] = place.colors
  return (
    <div className={`cover ${className}`} style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      {!failed && (
        <img src={src} alt={place.name} loading="lazy"
          onError={() => { if (!event?.image) missing.add(id); setFailed(true) }} />
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

// ----- Style switcher -----
export function StyleButton() {
  const [open, setOpen] = useState(false)
  const { state } = useStore()
  const cur = STYLES.find((x) => x.id === state.style)
  return (
    <>
      <button className="style-pill" onClick={() => setOpen(true)} aria-label="Switch style">
        <Palette size={14} /> {cur?.name}
      </button>
      <StyleSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function StylePicker({ onPick }) {
  const { state, dispatch } = useStore()
  return (
    <div className="stack-sm">
      {STYLES.map((st) => (
        <button key={st.id} className={`option style-option ${state.style === st.id ? 'on' : ''}`}
          onClick={() => { dispatch({ type: 'STYLE', style: st.id }); onPick?.(st.id) }}>
          <span className="style-emoji">{st.emoji}</span>
          <span className="style-text"><strong>{st.name}</strong><span>{st.desc}</span></span>
          {state.style === st.id && <Check size={18} />}
        </button>
      ))}
    </div>
  )
}

export function StyleSheet({ open, onClose }) {
  const nav = useNav()
  return (
    <Sheet open={open} onClose={onClose} title="Pick a style">
      <p className="muted">Same app, same data, different feel. Switch anytime.</p>
      <StylePicker onPick={() => { onClose(); nav.tab('home') }} />
      <p className="muted small center">Share a style directly: add <b>?style=board</b> or <b>?style=crews</b> to the link.</p>
    </Sheet>
  )
}
