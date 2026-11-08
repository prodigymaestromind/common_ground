import { useState } from 'react'
import { ShieldCheck, Trash2, Plus, GraduationCap, Megaphone, Palette } from 'lucide-react'
import { INTERESTS, SAMPLE_BUSY, EVENTS } from '../data'
import { Chip, Cover, Logo, StyleSheet, TopBar, useNav } from '../components'
import { useStore, STYLES } from '../store'
import { uid } from '../utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ----- First screen: look around first, sign in later -----
export function Welcome() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const [styleOpen, setStyleOpen] = useState(false)
  const cur = STYLES.find((s) => s.id === state.style)
  const floaters = ['r34', 'r48', 'r33'].map((id) => EVENTS.find((e) => e.id === id)).filter(Boolean)

  return (
    <div className="onboard">
      <div className="onboard-hero">
        <div className="hero-art" aria-hidden="true">
          <div className="hero-logo">
            <svg viewBox="0 0 120 80" width="150" height="100">
              <circle cx="46" cy="40" r="30" fill="none" stroke="#fff" strokeWidth="8" />
              <circle cx="74" cy="40" r="30" fill="none" stroke="var(--gold)" strokeWidth="8" />
            </svg>
          </div>
          {floaters.map((e, i) => (
            <div key={e.id} className={`floater floater-${i}`}>
              <Cover event={e} className="floater-cover" small />
              <span>{e.title}</span>
            </div>
          ))}
        </div>
        <Logo size={30} light />
        <h1>Campus events.<br />People to go with.</h1>
        <p>Everything happening at Sac State in one place, plus a comfortable way to meet people, even if you show up alone.</p>
        <button className="btn btn-gold btn-lg" onClick={() => { nav.tab('home'); dispatch({ type: 'WELCOMED' }) }}>Look around</button>
        <button className="btn btn-ghost-light" onClick={() => { nav.tab('home'); dispatch({ type: 'WELCOMED' }); nav.push('signin', {}) }}>
          I have an account · Sign in
        </button>
        <button className="style-pill light" onClick={() => setStyleOpen(true)}><Palette size={14} /> Style: {cur?.name}</button>
        <p className="small muted-light">No account needed to browse.</p>
      </div>
      <StyleSheet open={styleOpen} onClose={() => setStyleOpen(false)} />
    </div>
  )
}

// ----- Sign in: only shows up when you try something that needs it -----
export default function SignIn({ role: startRole, reason, then }) {
  const nav = useNav()
  const { dispatch, showToast } = useStore()
  const [role, setRole] = useState(startRole || null)
  const [step, setStep] = useState(startRole ? 1 : 0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [interests, setInterests] = useState([])
  const [busy, setBusy] = useState(SAMPLE_BUSY)

  const emailOk = /@csus\.edu$/i.test(email.trim())
  const toggle = (id) => setInterests((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))
  const finish = (useBusy) => {
    dispatch({
      type: 'SIGN_UP',
      user: {
        name: name.trim(), email: email.trim(), role, org: org.trim(),
        interests: interests.length ? interests : INTERESTS.map((i) => i.id).slice(0, 3),
        busy: useBusy ? busy : [],
      },
    })
    dispatch({ type: 'WELCOMED' })
    nav.pop()
    showToast(`Welcome, ${name.trim()} ✓`)
    if (then) setTimeout(then, 50)
  }
  const isOrg = role === 'organizer'
  const total = isOrg ? 1 : 3

  return (
    <div className="screen">
      <TopBar title="Sign in" />
      {reason && <div className="note">🔒 {reason}</div>}

      {step === 0 && (
        <div className="onboard-step flat">
          <h2>How will you use it?</h2>
          <p className="muted">You only need an account to meet people or post events. Browsing is always open.</p>
          <button className="card role" onClick={() => { setRole('student'); setStep(1) }}>
            <GraduationCap size={28} />
            <span><strong>I'm a student</strong><span>RSVP, find people to go with, chat</span></span>
          </button>
          <button className="card role" onClick={() => { setRole('organizer'); setStep(1) }}>
            <Megaphone size={28} />
            <span><strong>I run a club or event</strong><span>Post events for your club, ASI or department</span></span>
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="onboard-step flat">
          <Progress step={1} total={total} />
          <h2>{isOrg ? 'Organizer sign in' : 'Who are you?'}</h2>
          <p className="muted">{isOrg ? 'Organizer accounts can publish events right away.' : 'Only your first name is ever shown to other students.'}</p>
          <label className="field">
            <span>First name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Eli" />
          </label>
          <label className="field">
            <span>Sac State email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@csus.edu" inputMode="email" />
            {email && !emailOk && <small className="error">Use your @csus.edu email so everyone here is a real student.</small>}
          </label>
          {isOrg && (
            <label className="field">
              <span>Club or organization</span>
              <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. ACM Sac State" />
            </label>
          )}
          <div className="note"><ShieldCheck size={18} /> Verified students only. No public profiles, no follower counts.</div>
          <button className="btn btn-primary btn-lg" disabled={!name.trim() || !emailOk || (isOrg && !org.trim())}
            onClick={() => (isOrg ? finish(false) : setStep(2))}>
            {isOrg ? 'Sign in' : 'Continue'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboard-step flat">
          <Progress step={2} total={3} />
          <h2>What are you into?</h2>
          <p className="muted">Pick a few. We'll show you events and people that match.</p>
          <div className="chips-wrap">
            {INTERESTS.map((i) => (
              <Chip key={i.id} active={interests.includes(i.id)} onClick={() => toggle(i.id)}>{i.emoji} {i.label}</Chip>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" disabled={interests.length === 0} onClick={() => setStep(3)}>
            {interests.length ? `Continue with ${interests.length}` : 'Pick at least one'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="onboard-step flat">
          <Progress step={3} total={3} />
          <h2>When are you busy?</h2>
          <p className="muted">Optional. We'll tell you which events actually fit around class and work. Stays on your phone.</p>
          <BusyEditor busy={busy} setBusy={setBusy} />
          <button className="btn btn-primary btn-lg" onClick={() => finish(true)}>Finish</button>
          <button className="btn btn-ghost" onClick={() => finish(false)}>Skip for now</button>
        </div>
      )}
    </div>
  )
}

function Progress({ step, total }) {
  return (
    <div className="progress" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => <span key={n} className={n <= step ? 'on' : ''} />)}
    </div>
  )
}

export function BusyEditor({ busy, setBusy }) {
  const update = (id, patch) => setBusy((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  return (
    <div className="busy-list">
      {busy.map((b) => (
        <div key={b.id} className="card busy">
          <div className="busy-row">
            <input className="busy-label" value={b.label} onChange={(e) => update(b.id, { label: e.target.value })} aria-label="Label" />
            <button className="icon-btn" onClick={() => setBusy((x) => x.filter((y) => y.id !== b.id))} aria-label="Remove"><Trash2 size={18} /></button>
          </div>
          <div className="days">
            {DAYS.map((d, i) => (
              <button key={d} className={`day ${b.days.includes(i) ? 'on' : ''}`}
                onClick={() => update(b.id, { days: b.days.includes(i) ? b.days.filter((x) => x !== i) : [...b.days, i] })}>
                {d[0]}
              </button>
            ))}
          </div>
          <div className="busy-time">
            <input type="time" value={b.start} onChange={(e) => update(b.id, { start: e.target.value })} aria-label="Start" />
            <span className="muted">to</span>
            <input type="time" value={b.end} onChange={(e) => update(b.id, { end: e.target.value })} aria-label="End" />
          </div>
        </div>
      ))}
      <button className="btn btn-outline" onClick={() => setBusy((b) => [...b, { id: uid(), label: 'Busy', days: [1], start: '09:00', end: '12:00' }])}>
        <Plus size={16} /> Add a block
      </button>
    </div>
  )
}
