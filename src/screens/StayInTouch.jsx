// "Stay in touch": tap a button to share a social. In the real app the other
// person gets a request and you only see each other's info if BOTH say yes.
// For now the other person is a sample student who always says yes, and the
// handles are placeholders (nothing is a real account).
import { useState } from 'react'
import { HeartHandshake, Check } from 'lucide-react'
import { studentById } from '../data'
import { Sheet, useExplain } from '../components'
import { useStore } from '../store'

// Used by Profile for "Ways to stay in touch"
export const CONTACT_TYPES = [
  { id: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
  { id: 'discord', label: 'Discord', placeholder: 'username' },
  { id: 'snapchat', label: 'Snapchat', placeholder: 'username' },
]

const SHARE = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'discord', label: 'Discord', emoji: '🎮' },
  { id: 'snapchat', label: 'Snapchat', emoji: '👻' },
]

const slug = (name = 'you') => name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'you'
// Placeholder handle (shown as plain text, never a link)
export const fakeHandle = (name, kind) => (kind === 'instagram' ? `@${slug(name)}.cg` : `${slug(name)}_cg`)

export function KeepInTouchButton({ studentId }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const [explain, popup] = useExplain()
  const p = studentById[studentId]
  const st = state.keepInTouch[studentId]
  const status = typeof st === 'string' ? st : st?.status

  if (status === 'connected') {
    const kind = st?.shared?.[0] || 'instagram'
    const opt = SHARE.find((s) => s.id === kind) || SHARE[0]
    const mine = state.user?.contacts?.[kind] || fakeHandle(state.user?.name, kind)
    return (
      <div className="touch-card">
        <span className="touch-head"><Check size={14} strokeWidth={3} /> You and {p.name} swapped {opt.label}</span>
        <div className="touch-row"><span>{opt.emoji} {p.name}</span><b>{fakeHandle(p.name, kind)}</b></div>
        <div className="touch-row"><span>{opt.emoji} You</span><b>{mine}</b></div>
      </div>
    )
  }
  if (status === 'asked') return <span className="status">Waiting for {p.name} to say yes…</span>
  return (
    <>
      <button className="btn btn-sm btn-primary" onClick={(ev) => explain('stay', () => setOpen(true), ev)}>
        <HeartHandshake size={14} /> Stay in touch
      </button>
      <ShareSheet open={open} onClose={() => setOpen(false)} student={p} />
      {popup}
    </>
  )
}

function ShareSheet({ open, onClose, student }) {
  const { state, dispatch, showToast } = useStore()

  const share = (kind) => {
    dispatch({ type: 'KEEP_IN_TOUCH', studentId: student.id, value: { status: 'asked', shared: [kind] } })
    onClose()
    setTimeout(() => {
      dispatch({ type: 'KEEP_IN_TOUCH', studentId: student.id, value: { status: 'connected', shared: [kind] } })
      showToast(`${student.name} said yes 🎉`)
    }, 1500)
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Stay in touch with ${student.name}`}>
      <p className="muted">Pick one to share. {student.name} only sees it if they say yes and share back.</p>
      <div className="share-buttons">
        {SHARE.map((s) => (
          <button key={s.id} className="share-btn" onClick={() => share(s.id)}>
            <span className="share-emoji">{s.emoji}</span>
            <span className="share-text">
              <strong>Share {s.label}</strong>
              <small>{state.user?.contacts?.[s.id] || fakeHandle(state.user?.name, s.id)}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="muted small center">Tip: save your phone number for after you've met in person.</p>
    </Sheet>
  )
}
