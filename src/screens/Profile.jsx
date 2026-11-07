import { ShieldCheck, RotateCcw } from 'lucide-react'
import { INTERESTS } from '../data'
import { Avatar, Chip, TopBar } from '../components'
import { useStore } from '../store'
import { BusyEditor } from './Onboarding'

export default function Profile() {
  const { state, dispatch } = useStore()
  const u = state.user
  const update = (patch) => dispatch({ type: 'UPDATE_USER', patch })
  const toggle = (id) => update({ interests: u.interests.includes(id) ? u.interests.filter((i) => i !== id) : [...u.interests, id] })

  return (
    <div className="screen">
      <TopBar title="Profile" />
      <div className="profile-head">
        <Avatar person={{ name: u.name, color: 'var(--green)' }} size={72} />
        <h1>{u.name}</h1>
        <p className="muted">{u.email} · <ShieldCheck size={14} /> Verified student</p>
      </div>

      <h2 className="section-title">Interests</h2>
      <div className="chips-wrap">
        {INTERESTS.map((i) => <Chip key={i.id} active={u.interests.includes(i.id)} onClick={() => toggle(i.id)}>{i.emoji} {i.label}</Chip>)}
      </div>

      <h2 className="section-title">My busy times</h2>
      <p className="muted section-sub">Used only to tell you which events fit. Never shown to anyone.</p>
      <BusyEditor busy={u.busy} setBusy={(fn) => update({ busy: typeof fn === 'function' ? fn(u.busy) : fn })} />

      <h2 className="section-title">Privacy</h2>
      <ul className="privacy">
        <li>Only your first name + interests are ever shown, and only at events where you turn on “open to company.”</li>
        <li>No follower counts, likes or popularity scores.</li>
        <li>Your location is never shared.</li>
        <li>You can block and report anyone from a chat.</li>
      </ul>

      <button className="btn btn-ghost danger" onClick={() => { if (confirm('Reset the demo? This clears everything.')) dispatch({ type: 'RESET' }) }}>
        <RotateCcw size={16} /> Reset demo
      </button>
    </div>
  )
}
