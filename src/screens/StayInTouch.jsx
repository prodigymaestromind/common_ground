// "Stay in touch": tap a button to share one social.
// How the real version will work: the other person gets a request, and you
// only see each other's info if BOTH say yes.
// DEMO: the other person is a sample student who always says yes, and their
// handle is a placeholder (see demo.js).
import { useState } from 'react'
import { HeartHandshake, Check } from 'lucide-react'
import { CONTACT_TYPES } from '../data'
import { studentById, demoHandle } from '../demo'
import { DemoTag, Sheet } from '../components'
import { useExplain } from '../hooks'
import { useStore } from '../store'

export function KeepInTouchButton({ studentId }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const [explain, popup] = useExplain()
  const p = studentById[studentId]
  const st = state.keepInTouch[studentId]
  const status = typeof st === 'string' ? st : st?.status

  if (status === 'connected') {
    const kind = CONTACT_TYPES.find((c) => c.id === st?.shared?.[0]) || CONTACT_TYPES[0]
    const mine = state.user?.contacts?.[kind.id] || demoHandle(state.user?.name, kind.id)
    return (
      <div className="touch-card">
        <span className="touch-head"><Check size={14} strokeWidth={3} /> You and {p.name} swapped {kind.label} <DemoTag /></span>
        <div className="touch-row"><span>{kind.emoji} {p.name}</span><b>{demoHandle(p.name, kind.id)}</b></div>
        <div className="touch-row"><span>{kind.emoji} You</span><b>{mine}</b></div>
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
        {CONTACT_TYPES.map((c) => (
          <button key={c.id} className="share-btn" onClick={() => share(c.id)}>
            <span className="share-emoji">{c.emoji}</span>
            <span className="share-text">
              <strong>Share {c.label}</strong>
              <small>{state.user?.contacts?.[c.id] || `${demoHandle(state.user?.name, c.id)} (demo handle)`}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="muted small center">Add your real handles in Profile. Tip: save your phone number for after you've met in person.</p>
    </Sheet>
  )
}
