import { ShieldCheck, RotateCcw, LogOut } from 'lucide-react'
import { INTERESTS } from '../data'
import { Avatar, Chip, TopBar, useNav } from '../components'
import { useStore } from '../store'
import { BusyEditor } from './Onboarding'
import { CONTACT_TYPES } from './StayInTouch'
import { APP_VERSION, CREDIT } from '../version'

export default function Profile() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const u = state.user
  if (!u) return (
    <div className="screen">
      <TopBar title="Profile" />
      <p className="muted center">You're browsing without an account.</p>
      <button className="btn btn-primary btn-lg" onClick={() => nav.push('signin', {})}>Sign in</button>
    </div>
  )
  const update = (patch) => dispatch({ type: 'UPDATE_USER', patch })
  const toggle = (id) => update({ interests: u.interests.includes(id) ? u.interests.filter((i) => i !== id) : [...u.interests, id] })

  return (
    <div className="screen">
      <TopBar title="Profile" />
      <div className="profile-head">
        <Avatar person={{ name: u.name, color: 'var(--green)' }} size={72} />
        <h1>{u.name}</h1>
        <p className="muted">{u.email} · <ShieldCheck size={14} /> {u.role === 'organizer' ? `Organizer · ${u.org}` : 'Verified student'}</p>
      </div>

      {u.role === 'organizer' && (
        <>
          <h2 className="section-title">{u.org || 'Your club'} settings</h2>
          <label className="toggle-row card">
            <div>
              <strong>👥 Show how many people are going</strong>
              <span>Applies to all your events. Under 10 going it's hidden automatically. Off = always show “New event”. You always see the number.</span>
            </div>
            <input type="checkbox" className="switch" checked={u.showCounts !== false} onChange={(e) => dispatch({ type: 'ORG_COUNTS', value: e.target.checked })} />
          </label>
        </>
      )}

      <h2 className="section-title">Interests</h2>
      <div className="chips-wrap">
        {INTERESTS.map((i) => <Chip key={i.id} active={u.interests.includes(i.id)} onClick={() => toggle(i.id)}>{i.emoji} {i.label}</Chip>)}
      </div>

      <h2 className="section-title">My busy times</h2>
      <p className="muted section-sub">Used only to tell you which events fit. Never shown to anyone.</p>
      <BusyEditor busy={u.busy} setBusy={(fn) => update({ busy: typeof fn === 'function' ? fn(u.busy) : fn })} />

      <h2 className="section-title">Ways to stay in touch</h2>
      <p className="muted section-sub">Optional. Only shared with someone when you both say yes.</p>
      <div className="contact-list">
        {CONTACT_TYPES.map((c) => (
          <label key={c.id} className="contact-row">
            <span>{c.label}</span>
            <input value={u.contacts?.[c.id] || ''} placeholder={c.placeholder}
              onChange={(e) => update({ contacts: { ...u.contacts, [c.id]: e.target.value } })} />
          </label>
        ))}
      </div>

      <h2 className="section-title">Privacy</h2>
      <ul className="privacy">
        <li>Only your first name + interests are ever shown, and only at events where you turn on “open to company.”</li>
        <li>No follower counts, likes or popularity scores.</li>
        <li>Your location is never shared.</li>
        <li>You can block and report anyone from a chat.</li>
      </ul>

      <button className="btn btn-outline" onClick={() => { dispatch({ type: 'SIGN_OUT' }); nav.tab('home') }}><LogOut size={16} /> Sign out</button>
      <button className="btn btn-ghost danger" onClick={() => { if (confirm('Reset the app on this phone? This clears your plans, chats and sign-in.')) dispatch({ type: 'RESET' }) }}>
        <RotateCcw size={16} /> Reset app
      </button>
      <p className="version-tag">Common Ground v{APP_VERSION} · {CREDIT}</p>
    </div>
  )
}
