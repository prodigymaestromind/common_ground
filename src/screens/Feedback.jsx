// In-app feedback form + one gentle nudge after someone has tried a few things.
// (The buttons that open it are in the Home header, the desktop sidebar and Profile.)
import { useEffect, useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { Sheet } from '../components'
import { useStore } from '../store'
import { sendFeedback } from '../feedback'

const USE_IT = ['Yes', 'Maybe', 'No']

// Small card that slides up once (not a blocking pop-up)
export function FeedbackNudge({ onOpen }) {
  const { state, dispatch } = useStore()
  const [show, setShow] = useState(false)
  const done = state.feedback.submitted || state.feedback.dismissed
  useEffect(() => {
    if (done) return
    // after 3 actions (save, going, message, post) or 2 minutes in the app
    if (state.feedback.actions >= 3) { const t = setTimeout(() => setShow(true), 1200); return () => clearTimeout(t) }
    const t = setTimeout(() => setShow(true), 120000)
    return () => clearTimeout(t)
  }, [done, state.feedback.actions])
  if (!show || done) return null
  return (
    <div className="fb-nudge" role="dialog" aria-label="Feedback request">
      <div>
        <strong>Got 1 minute? 🙏</strong>
        <span>Tell us what you think. It really helps.</span>
      </div>
      <button className="btn btn-sm btn-gold" onClick={() => { setShow(false); onOpen() }}>Give feedback</button>
      <button className="icon-btn" onClick={() => { setShow(false); dispatch({ type: 'FEEDBACK', patch: { dismissed: true } }) }} aria-label="Not now"><X size={18} /></button>
    </div>
  )
}

export function FeedbackSheet({ open, onClose }) {
  const { state, dispatch } = useStore()
  const [stars, setStars] = useState(0)
  const [useIt, setUseIt] = useState('')
  const [confusing, setConfusing] = useState('')
  const [add, setAdd] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const [localOnly, setLocalOnly] = useState(false)

  const submit = async () => {
    setSending(true)
    const answers = {
      rating: stars, would_use: useIt, confusing, add_or_change: add,
      signed_in: !!state.user, role: state.user?.role || 'none',
      at: new Date().toISOString(), device: navigator.userAgent.includes('iPhone') ? 'iPhone' : navigator.userAgent.includes('Android') ? 'Android' : 'Other',
    }
    try {
      const r = await sendFeedback(answers)
      setSent(r.ok ? 'ok' : 'err')
      setLocalOnly(!!r.local)
      if (r.ok) dispatch({ type: 'FEEDBACK', patch: { submitted: true } })
    } catch {
      setSent('err')
    }
    setSending(false)
  }

  const close = () => { onClose(); if (sent === 'ok') setSent(null) }

  return (
    <Sheet open={open} onClose={close} title={sent === 'ok' ? 'Thank you! 💚' : 'Help us improve'}>
      {sent === 'ok' ? (
        <>
          <p className="muted">{localOnly ? 'Your feedback was saved.' : 'Your feedback was sent. It goes straight to the builder of Common Ground.'}</p>
          <button className="btn btn-primary btn-lg" onClick={close}>Back to the app</button>
        </>
      ) : (
        <>
          <p className="muted">4 quick questions · about 1 minute · anonymous</p>

          <h3 className="label">1. How would you rate Common Ground?</h3>
          <div className="stars" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setStars(n)}>
                <Star size={34} fill={n <= stars ? 'var(--gold)' : 'none'} color={n <= stars ? 'var(--gold-2)' : '#b9b6ab'} />
              </button>
            ))}
          </div>

          <h3 className="label">2. Would you actually use this at Sac State?</h3>
          <div className="chips-wrap">
            {USE_IT.map((x) => <button key={x} className={`chip ${useIt === x ? 'chip-on' : ''}`} onClick={() => setUseIt(x)}>{x}</button>)}
          </div>

          <h3 className="label">3. Was anything confusing or hard to do?</h3>
          <textarea className="fb-text" rows={3} value={confusing} onChange={(e) => setConfusing(e.target.value)} placeholder="e.g. I didn't know what the bookmark did" />

          <h3 className="label">4. What's one thing we should add or change?</h3>
          <textarea className="fb-text" rows={3} value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Anything goes" />

          {sent === 'err' && <p className="error">Couldn't send. Check your connection and try again.</p>}
          <button className="btn btn-primary btn-lg" disabled={!stars || sending} onClick={submit}>
            {sending ? <><Loader2 size={18} className="spin" /> Sending…</> : stars ? 'Send feedback' : 'Pick a star rating to send'}
          </button>
        </>
      )}
    </Sheet>
  )
}
