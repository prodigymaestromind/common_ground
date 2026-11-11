// Small shared UI pieces. (Hooks live in hooks.jsx, navigation in nav.js.)
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, Clock, MapPin, Monitor, Users, CheckCircle2, AlertTriangle, CalendarPlus, Sparkles, Check, Bookmark, BookmarkCheck } from 'lucide-react'
import { interestById } from './data'
import { PLACES } from './places'
import { TIPS } from './tips'
import { useNav } from './nav'
import { useStore } from './store'
import { fmtRange, costLabel, fitCheck, isLive, isPast, initials, showGoing, endedWord, whenLabel } from './utils'

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

// Marks anything that isn't real yet (sample people, sample counts, automatic chats).
export function DemoTag({ children = 'Demo' }) {
  return <span className="demo-tag" title="Sample data for the demo. Not real yet.">{children}</span>
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

// "Online" or "Off campus" label, so nobody walks to the Union for a Zoom talk
export function WhereTag({ event }) {
  if (event.online) return <span className="pill pill-where"><Monitor size={12} /> Online</span>
  if (event.offCampus) return <span className="pill pill-where"><MapPin size={12} /> Off campus</span>
  return null
}

export const SoloBadge = () => <span className="pill pill-solo"><Sparkles size={12} /> Welcomes solo</span>

// "39 going" (with a Demo tag when the number is a sample), or "New event" when it's hidden.
export function GoingCount({ event }) {
  if (!showGoing(event)) return <span className="pill pill-new">New event</span>
  return (
    <span className="going">
      <Users size={13} /> {event.going} <span className="going-word">going</span>
      {event.demo && <DemoTag />}
    </span>
  )
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

function StatusPill({ event }) {
  const { state } = useStore()
  if (event.mine) return <span className="pill pill-host">Hosting</span>
  const r = state.rsvp[event.id]
  if (r === 'going') return <span className="pill pill-going"><Check size={12} strokeWidth={3} /> Going</span>
  if (r === 'saved') return <span className="pill pill-saved"><BookmarkCheck size={12} /> Saved</span>
  return null
}

// The list-style event card (Explore, Plans, map panel, post preview)
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
            <WhereTag event={event} />
            <StatusPill event={event} />
          </div>
          <h3 className="event-title">{event.title}</h3>
          <div className="meta"><Clock size={14} /> {live ? `Now · until ${fmtRange(event).split('– ')[1]}` : ended ? `${endedWord(event)} · ${fmtRange(event)}` : whenLabel(event)}</div>
          <div className="meta">{event.online ? <Monitor size={14} /> : <MapPin size={14} />} {event.place}</div>
          <div className="event-foot">
            <GoingCount event={event} />
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

export function Empty({ icon = '✓', title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}

// Slides up from the bottom on phones, centered box on bigger screens. Esc or a tap outside closes it.
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
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

// "Are you sure?" pop-up for things that are hard to take back.
export function Confirm({ open, title, children, yes, danger, onYes, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="muted">{children}</p>
      <div className="confirm-actions">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onClose(); onYes() }}>{yes}</button>
      </div>
    </Sheet>
  )
}

// Event picture: the event's own photo/flyer, or a colored tile with its icon.
export function Cover({ event, className = '', small, children }) {
  // no known building (online, off campus): a plain green tile with no building name
  const place = PLACES[event?.placeId] || { colors: ['#0b5a3e', '#1f7a55'], icon: '📅', short: event?.online ? 'Online' : event?.offCampus ? 'Off campus' : '' }
  const src = event?.image
  const [failedSrc, setFailedSrc] = useState(null)
  const showPhoto = src && failedSrc !== src
  const [c1, c2] = place.colors
  return (
    <div className={`cover ${className}`} style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      {showPhoto ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
      ) : (
        <div className="cover-art" aria-hidden="true">
          <span className="cover-icon">{event?.emoji || place.icon}</span>
          {!small && <span className="cover-place">{place.short}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

export function SignInButton() {
  const nav = useNav()
  return <button className="btn btn-sm btn-outline" onClick={() => nav.push('signin', {})}>Sign in</button>
}

// One-time explainer (see hooks.jsx > useExplain). Dims the screen, lights up
// the thing you tapped, and points a card at it.
export function Spotlight({ tipKey, el, onDone }) {
  const { dispatch } = useStore()
  const tip = TIPS[tipKey]
  const [rect, setRect] = useState(null)
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const [cardH, setCardH] = useState(380)
  const cardRef = useRef(null)
  const wide = view.w >= 768

  useLayoutEffect(() => {
    if (!el) return
    const target = el.closest('.toggle-row, .here-card, .info li') || el
    // scroll so the highlighted thing has room for the card next to it
    const scroller = target.closest('.scroll, .side-panel')
    const first = target.getBoundingClientRect()
    const big = window.innerWidth >= 768
    if (scroller && (first.top < 60 || first.bottom > window.innerHeight * (big ? 0.8 : 0.45))) {
      scroller.scrollBy({ top: first.top - window.innerHeight * (big ? 0.3 : 0.18) })
    }
    const measure = () => {
      const r = target.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      setView({ w: window.innerWidth, h: window.innerHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [el])

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  }, [rect, view.w])

  const done = () => { dispatch({ type: 'TIP_SEEN', key: tipKey }); onDone() }
  const pad = 6
  const hole = rect && { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }

  // Where the card goes. Uses the card's real height so it never runs off the screen.
  let cardStyle
  let arrow = null
  if (hole && wide) {
    const W = 380
    const gap = 16
    const m = 12
    const cx = hole.left + hole.width / 2
    const cy = hole.top + hole.height / 2
    const clampX = (x) => Math.min(Math.max(m, x), view.w - W - m)
    const clampY = (y) => Math.min(Math.max(m, y), Math.max(m, view.h - cardH - m))
    const below = hole.top + hole.height + gap
    if (below + cardH + m <= view.h) {
      cardStyle = { top: below, left: clampX(cx - W / 2), width: W }
      arrow = { side: 'top', style: { left: Math.min(Math.max(24, cx - cardStyle.left), W - 24) } }
    } else if (hole.top - gap - cardH >= m) {
      cardStyle = { top: hole.top - gap - cardH, left: clampX(cx - W / 2), width: W }
      arrow = { side: 'bottom', style: { left: Math.min(Math.max(24, cx - cardStyle.left), W - 24) } }
    } else if (hole.left + hole.width + gap + W + m <= view.w) {
      cardStyle = { top: clampY(cy - cardH / 2), left: hole.left + hole.width + gap, width: W }
      arrow = { side: 'left', style: { top: Math.min(Math.max(24, cy - cardStyle.top), cardH - 24) } }
    } else if (hole.left - gap - W >= m) {
      cardStyle = { top: clampY(cy - cardH / 2), left: hole.left - gap - W, width: W }
      arrow = { side: 'right', style: { top: Math.min(Math.max(24, cy - cardStyle.top), cardH - 24) } }
    } else {
      cardStyle = { top: clampY(below), left: clampX(cx - W / 2), width: W }
    }
  } else if (hole) {
    // phones: card at the bottom, or at the top when the highlighted thing is low on the screen
    const roomBelow = view.h - (hole.top + hole.height)
    if (roomBelow < cardH + 24 && hole.top > roomBelow) cardStyle = { top: 'calc(10px + env(safe-area-inset-top))', bottom: 'auto' }
  }

  return (
    <div className={`spot ${wide ? 'spot-wide' : ''}`} role="dialog" aria-label={tip.title} onClick={done}>
      {hole ? <div className="spot-hole" style={hole} /> : <div className="spot-dim" />}
      <div ref={cardRef} className={`spot-card ${wide && hole ? 'floating' : ''}`} style={cardStyle} onClick={(ev) => ev.stopPropagation()}>
        {arrow && <span className={`spot-arrow ${arrow.side}`} style={arrow.style} />}
        <div className="explain">
          <div className="explain-icon">{tip.icon}</div>
          <h2>{tip.title}</h2>
          {tip.lines.map((l) => <p key={l}>{l}</p>)}
          <p className="explain-demo">🧪 {tip.demo}</p>
          <button className="btn btn-primary btn-lg" onClick={done} autoFocus>Got it</button>
        </div>
      </div>
    </div>
  )
}
