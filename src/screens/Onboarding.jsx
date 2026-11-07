import { useState } from 'react'
import { ShieldCheck, Trash2, Plus } from 'lucide-react'
import { INTERESTS, SAMPLE_BUSY } from '../data'
import { Chip, Logo } from '../components'
import { useStore } from '../store'
import { uid } from '../utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Onboarding() {
  const { dispatch } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState([])
  const [busy, setBusy] = useState(SAMPLE_BUSY)

  const emailOk = /@csus\.edu$/i.test(email.trim())
  const toggle = (id) => setInterests((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))
  const finish = (useBusy) =>
    dispatch({ type: 'SIGN_UP', user: { name: name.trim(), email: email.trim(), interests, busy: useBusy ? busy : [] } })

  return (
    <div className="onboard">
      {step === 0 && (
        <div className="onboard-hero">
          <Logo size={44} light />
          <h1>Campus events.<br />People to go with.</h1>
          <p>Everything happening at Sac State in one place, plus a comfortable way to meet people, even if you show up alone.</p>
          <button className="btn btn-gold btn-lg" onClick={() => setStep(1)}>Get started</button>
          <p className="small muted-light">Takes 30 seconds · Sac State students only</p>
        </div>
      )}

      {step === 1 && (
        <div className="onboard-step">
          <Progress step={1} />
          <h2>Who are you?</h2>
          <p className="muted">Only your first name is ever shown to other students.</p>
          <label className="field">
            <span>First name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Eli" autoFocus />
          </label>
          <label className="field">
            <span>Sac State email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@csus.edu" inputMode="email" />
            {email && !emailOk && <small className="error">Use your @csus.edu email so everyone here is a real student.</small>}
          </label>
          <div className="note"><ShieldCheck size={18} /> Verified students only. No public profiles, no follower counts.</div>
          <button className="btn btn-primary btn-lg" disabled={!name.trim() || !emailOk} onClick={() => setStep(2)}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="onboard-step">
          <Progress step={2} />
          <h2>What are you into?</h2>
          <p className="muted">Pick a few. We'll show you events and people that match.</p>
          <div className="chips-wrap">
            {INTERESTS.map((i) => (
              <Chip key={i.id} active={interests.includes(i.id)} onClick={() => toggle(i.id)}>
                {i.emoji} {i.label}
              </Chip>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" disabled={interests.length === 0} onClick={() => setStep(3)}>
            {interests.length ? `Continue with ${interests.length}` : 'Pick at least one'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="onboard-step">
          <Progress step={3} />
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

function Progress({ step }) {
  return (
    <div className="progress" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => <span key={n} className={n <= step ? 'on' : ''} />)}
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
          <div className="busy-row">
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
