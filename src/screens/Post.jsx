import { useRef, useState } from 'react'
import { Camera, Loader2, ShieldCheck, Sparkles, Megaphone, GraduationCap } from 'lucide-react'
import { INTERESTS } from '../data'
import { Chip, Empty, useGate, useNav } from '../components'
import { placeFromText } from '../places'
import { useStore } from '../store'
import { readFlyer, parseFlyer } from '../flyer'
import { uid } from '../utils'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Post() {
  const nav = useNav()
  const gate = useGate()
  const { state, dispatch, showToast } = useStore()
  const fileRef = useRef(null)
  const [scan, setScan] = useState({ state: 'idle' }) // idle | reading | done | error
  const [preview, setPreview] = useState(null)
  const [f, setF] = useState({
    title: '', host: '', date: todayStr(), start: '18:00', end: '20:00',
    place: '', cost: 0, interest: 'music', desc: '', parking: '', soloFriendly: true,
  })
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  const [image, setImage] = useState(null)
  const onFile = async (file) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    shrink(file).then(setImage).catch(() => {})
    setScan({ state: 'reading', progress: 0 })
    try {
      const text = await readFlyer(file, (p) => setScan({ state: 'reading', progress: p }))
      const got = parseFlyer(text)
      set(Object.fromEntries(Object.entries(got).filter(([k, v]) => k !== 'found' && v !== undefined && v !== '')))
      setScan({ state: 'done', found: got.found })
    } catch (err) {
      console.error(err)
      setScan({ state: 'error' })
    }
  }

  const ok = f.title.trim() && f.place.trim() && f.date && f.start && f.end
  const publish = () => {
    const startAt = new Date(`${f.date}T${f.start}`)
    let endAt = new Date(`${f.date}T${f.end}`)
    if (endAt <= startAt) endAt = new Date(startAt.getTime() + 2 * 3600000)
    const interest = INTERESTS.find((i) => i.id === f.interest)
    const event = {
      id: `p-${uid()}`, title: f.title.trim(), host: f.host.trim() || 'Student post', interest: f.interest,
      emoji: interest?.emoji || '📌', place: f.place.trim(), cost: Number(f.cost) || 0,
      parking: f.parking.trim() || 'See host for details', desc: f.desc.trim() || 'Posted on Common Ground.',
      going: 1, soloFriendly: f.soloFriendly, open: [], here: [],
      source: state.user?.role === 'organizer' ? 'Club post' : 'Student post',
      pending: state.user?.role !== 'organizer', placeId: placeFromText(f.place), image,
      startAt: startAt.toISOString(), endAt: endAt.toISOString(),
    }
    dispatch({ type: 'POST_EVENT', event })
    dispatch({ type: 'RSVP', eventId: event.id, value: 'going' })
    showToast(state.user?.role === 'organizer' ? 'Event published ✓' : 'Posted ✓ The host club will give it a quick check')
    nav.tab('home')
    nav.push('event', { id: event.id })
  }

  if (!state.user) return (
    <div className="screen">
      <h1 className="page-title">Post an event</h1>
      <Empty icon="📣" title="Share what's happening on campus">Post your club's event, or snap a flyer you saw so others can find it.</Empty>
      <button className="card role" onClick={() => gate('organizer')}>
        <Megaphone size={28} /><span><strong>I run a club or event</strong><span>Organizer accounts publish instantly</span></span>
      </button>
      <button className="card role" onClick={() => gate('student')}>
        <GraduationCap size={28} /><span><strong>I'm a student</strong><span>Share a flyer you saw. The host club gives it a quick check</span></span>
      </button>
    </div>
  )

  return (
    <div className="screen">
      <h1 className="page-title">Post an event</h1>

      <button className="card scan" onClick={() => fileRef.current?.click()}>
        {preview ? <img src={preview} alt="Flyer" /> : <Camera size={28} />}
        <div>
          <strong><Sparkles size={16} /> Scan a flyer</strong>
          <span>Saw a poster on campus? Snap it and we'll fill in the details for you.</span>
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />

      {scan.state === 'reading' && <div className="scan-status"><Loader2 size={16} className="spin" /> Reading flyer… {scan.progress ? `${scan.progress}%` : ''}</div>}
      {scan.state === 'done' && <div className="scan-status ok">✓ Filled in {scan.found.length ? scan.found.join(', ') : 'what we could'}. Double-check below.</div>}
      {scan.state === 'error' && <div className="scan-status err">Couldn't read that one. Fill it in below instead.</div>}

      <div className="form">
        <label className="field"><span>Event name</span><input value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Taco Tuesday Mixer" /></label>
        <label className="field"><span>Club or host</span><input value={f.host} onChange={(e) => set({ host: e.target.value })} placeholder="e.g. ACM Sac State" /></label>
        <div className="row3">
          <label className="field"><span>Date</span><input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /></label>
          <label className="field"><span>Start</span><input type="time" value={f.start} onChange={(e) => set({ start: e.target.value })} /></label>
          <label className="field"><span>End</span><input type="time" value={f.end} onChange={(e) => set({ end: e.target.value })} /></label>
        </div>
        <label className="field"><span>Where</span><input value={f.place} onChange={(e) => set({ place: e.target.value })} placeholder="e.g. University Union, Ballroom" /></label>
        <div className="row2">
          <label className="field"><span>Cost ($, 0 = free)</span><input type="number" min="0" value={f.cost} onChange={(e) => set({ cost: e.target.value })} /></label>
          <label className="field"><span>Parking</span><input value={f.parking} onChange={(e) => set({ parking: e.target.value })} placeholder="e.g. Structure 3" /></label>
        </div>
        <div className="field"><span>Category</span>
          <div className="chips-wrap">
            {INTERESTS.map((i) => <Chip key={i.id} active={f.interest === i.id} onClick={() => set({ interest: i.id })}>{i.emoji} {i.label}</Chip>)}
          </div>
        </div>
        <label className="field"><span>Description</span><textarea rows={3} value={f.desc} onChange={(e) => set({ desc: e.target.value })} /></label>
        <label className="toggle-row card">
          <div><strong>Solo-friendly</strong><span>You'll help people who come alone meet others.</span></div>
          <input type="checkbox" className="switch" checked={f.soloFriendly} onChange={(e) => set({ soloFriendly: e.target.checked })} />
        </label>
        <div className="note"><ShieldCheck size={18} /> Club & ASI accounts publish instantly. Student-scanned flyers get a quick check by the host club first.</div>
        <button className="btn btn-primary btn-lg" disabled={!ok} onClick={publish}>Publish event</button>
      </div>
    </div>
  )
}

// Shrink a photo so it fits in browser storage (about 60 KB)
function shrink(file, max = 640) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
