import { useState } from 'react'
import { CircleHelp, FlaskConical, MessageSquareHeart, RotateCcw, LogOut } from 'lucide-react'
import { INTERESTS, CONTACT_TYPES } from '../data'
import { studentById } from '../demo'
import { Avatar, Chip, Confirm, TopBar } from '../components'
import { useNav } from '../nav'
import { useStore } from '../store'
import { BusyEditor } from './Onboarding'
import { APP_VERSION, CREDIT } from '../version'

export default function Profile() {
  const nav = useNav()
  const { state, dispatch, showToast } = useStore()
  const [ask, setAsk] = useState(null) // 'out' | 'reset'
  const u = state.user
  if (!u) return (
    <div className="screen">
      <TopBar title="Profile" />
      <p className="muted center">You're browsing without an account.</p>
      <button className="btn btn-primary btn-lg" onClick={() => nav.push('signin', {})}>Sign in</button>
      <button className="btn btn-outline" onClick={() => nav.push('help')}><CircleHelp size={16} /> How it works</button>
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
        <p className="muted">{u.email}{u.role === 'organizer' ? ` · Organizer · ${u.org}` : ''}</p>
        <p className="muted small"><FlaskConical size={14} /> Demo account. Your email isn't verified yet, and everything stays on this device.</p>
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
        <li>You can block anyone from a chat. (Demo: reports aren't sent to anyone yet.)</li>
      </ul>

      {state.blocked.length > 0 && (
        <>
          <h2 className="section-title">Blocked</h2>
          <div className="contact-list">
            {state.blocked.map((id) => (
              <div key={id} className="contact-row blocked-row">
                <span>{studentById[id]?.name || 'Student'}</span>
                <button className="link" onClick={() => { dispatch({ type: 'UNBLOCK', studentId: id }); showToast(`${studentById[id]?.name || 'Student'} unblocked`) }}>Unblock</button>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="btn btn-outline" onClick={() => nav.push('help')}><CircleHelp size={16} /> How it works</button>
      <button className="btn btn-outline" onClick={nav.feedback}><MessageSquareHeart size={16} /> Give feedback</button>
      <button className="btn btn-outline" onClick={() => setAsk('out')}><LogOut size={16} /> Sign out</button>
      <button className="btn btn-ghost danger" onClick={() => setAsk('reset')}>
        <RotateCcw size={16} /> Reset app
      </button>
      <p className="version-tag">Common Ground v{APP_VERSION} · {CREDIT}</p>

      <Confirm open={ask === 'out'} onClose={() => setAsk(null)} title="Sign out?" yes="Sign out" danger
        onYes={() => { nav.tab('home'); dispatch({ type: 'SIGN_OUT' }) }}>
        There are no real accounts yet, so signing out clears your plans, chats and posted events on this device.
      </Confirm>
      <Confirm open={ask === 'reset'} onClose={() => setAsk(null)} title="Reset the app?" yes="Reset app" danger
        onYes={() => { nav.tab('home'); dispatch({ type: 'RESET' }) }}>
        This clears everything on this device (your plans, chats and sign-in) and starts over from the welcome screen.
      </Confirm>
    </div>
  )
}
