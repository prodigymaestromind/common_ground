// Swapping contacts: only happens when BOTH students say yes,
// and each person picks exactly what they share.
import { useState } from 'react'
import { HeartHandshake, Check, ShieldCheck } from 'lucide-react'
import { studentById } from '../data'
import { Sheet } from '../components'
import { useStore } from '../store'

export const CONTACT_TYPES = [
  { id: 'instagram', label: 'Instagram', placeholder: '@yourhandle', hint: 'Most common way students stay in touch' },
  { id: 'discord', label: 'Discord', placeholder: 'username', hint: 'Good for gaming & class servers' },
  { id: 'snapchat', label: 'Snapchat', placeholder: 'username', hint: '' },
  { id: 'phone', label: 'Phone', placeholder: '(916) 555-0123', hint: 'Best saved for after you have met in person' },
]

// Demo students' handles (made up, shown as text only)
export const demoContacts = (s) => ({
  instagram: `@${s.name.toLowerCase()}.demo`,
  discord: `${s.name.toLowerCase()}_demo`,
})

export function KeepInTouchButton({ studentId }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const p = studentById[studentId]
  const st = state.keepInTouch[studentId]
  const status = typeof st === 'string' ? st : st?.status
  if (status === 'connected') {
    const theirs = demoContacts(p)
    return (
      <div className="revealed">
        <span><Check size={14} /> <b>You and {p.name} both said yes</b></span>
        <span>Instagram: <b>{theirs.instagram}</b> · Discord: <b>{theirs.discord}</b></span>
        {st?.shared?.length > 0 && <span className="muted small">You shared: {st.shared.map((k) => CONTACT_TYPES.find((c) => c.id === k)?.label).join(', ')}</span>}
      </div>
    )
  }
  if (status === 'asked') return <span className="status">Waiting for {p.name} to say yes…</span>
  return (
    <>
      <button className="btn btn-sm btn-primary" onClick={() => setOpen(true)}><HeartHandshake size={14} /> Stay in touch</button>
      <ShareSheet open={open} onClose={() => setOpen(false)} student={p} />
    </>
  )
}

function ShareSheet({ open, onClose, student }) {
  const { state, dispatch, showToast } = useStore()
  const mine = state.user?.contacts || {}
  const [draft, setDraft] = useState(mine)
  const [pick, setPick] = useState(() => (mine.instagram ? ['instagram'] : []))
  const toggle = (id) => setPick((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]))

  const send = () => {
    dispatch({ type: 'UPDATE_USER', patch: { contacts: { ...mine, ...draft } } })
    dispatch({ type: 'KEEP_IN_TOUCH', studentId: student.id, value: { status: 'asked', shared: pick } })
    onClose()
    setTimeout(() => {
      dispatch({ type: 'KEEP_IN_TOUCH', studentId: student.id, value: { status: 'connected', shared: pick } })
      showToast(`You and ${student.name} both said yes 🎉`)
    }, 1800)
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Stay in touch with ${student.name}`}>
      <p className="muted">Pick what to share. {student.name} only sees it if they say yes too, and you'll see theirs.</p>
      <div className="stack-sm">
        {CONTACT_TYPES.map((c) => (
          <label key={c.id} className="share-opt">
            <input type="checkbox" checked={pick.includes(c.id)} disabled={!draft[c.id]} onChange={() => toggle(c.id)} />
            <span style={{ flex: 1 }}>
              {c.label}
              <input className="inline-input" value={draft[c.id] || ''} placeholder={c.placeholder}
                onChange={(e) => { const v = e.target.value; setDraft((d) => ({ ...d, [c.id]: v })); if (v && !pick.includes(c.id) && c.id !== 'phone') setPick((x) => [...x, c.id]); if (!v) setPick((x) => x.filter((i) => i !== c.id)) }} />
              {c.hint && <small>{c.hint}</small>}
            </span>
          </label>
        ))}
      </div>
      <ul className="tips">
        <li>Most students start with Instagram or Discord. Save your number for after you've met.</li>
        <li>Nothing is shared unless you both say yes. You can still block anyone.</li>
      </ul>
      <button className="btn btn-primary btn-lg" disabled={!pick.length} onClick={send}><ShieldCheck size={16} /> {pick.length ? 'Send request' : 'Add at least one way to reach you'}</button>
    </Sheet>
  )
}
