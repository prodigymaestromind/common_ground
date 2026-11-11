// Post an event (clubs and organizers only).
// DEMO: posts are saved on this device only. Other people can't see them yet.
import { useRef, useState } from 'react'
import { FlaskConical, ImagePlus, Loader2, Sparkles, Megaphone, X } from 'lucide-react'
import { INTERESTS, EMOJIS } from '../data'
import { Chip, Empty, EventCard } from '../components'
import { useNav } from '../nav'
import { useGate } from '../hooks'
import { useStore } from '../store'
import { readFlyer, parseFlyer } from '../flyer'
import { placeFromText } from '../places'
import { uid, withTimes } from '../utils'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Post() {
  const nav = useNav()
  const gate = useGate()
  const { state, dispatch } = useStore()
  const fileRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [image, setImage] = useState(null) // small data URL, saved with the event
  const [file, setFile] = useState(null)
  const [scan, setScan] = useState({ state: 'idle' }) // idle | reading | done | error
  const [f, setF] = useState({
    title: '', host: state.user?.org || '', date: todayStr(), start: '18:00', end: '20:00',
    place: '', cost: 0, interest: 'music', emoji: '🎤', desc: '', parking: '', soloFriendly: true, showCount: state.user?.showCounts !== false,
  })
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  if (!state.user) return (
    <div className="screen">
      <h1 className="page-title">Post an event</h1>
      <Empty icon="📣" title="Share your club's event">Organizers can post events, or snap a flyer and we'll fill in the details.</Empty>
      <button className="card role" onClick={() => gate('organizer')}>
        <Megaphone size={28} /><span><strong>I run a club or event</strong><span>Post events for your club, ASI or department</span></span>
      </button>
      <p className="muted small center">Posting is for clubs, ASI and departments. Students can browse, save and RSVP without posting.</p>
    </div>
  )

  // Only club / event organizers can post. Students see why, and how to switch.
  if (state.user.role !== 'organizer') return (
    <div className="screen">
      <h1 className="page-title">Post an event</h1>
      <Empty icon="📣" title="Posting is for clubs & organizers">
        That keeps the feed real and spam-free. You're signed in as a student, so you can save, RSVP and meet people at any event.
      </Empty>
      <button className="card role" onClick={() => { dispatch({ type: 'SIGN_OUT' }); gate('organizer') }}>
        <Megaphone size={28} /><span><strong>I run a club or event</strong><span>Sign out and sign in as an organizer</span></span>
      </button>
      <button className="btn btn-outline btn-lg" onClick={() => nav.tab('explore')}>Browse events instead</button>
    </div>
  )

  const addPhoto = (picked) => {
    if (!picked || !picked.type.startsWith('image/')) return
    setFile(picked)
    setScan({ state: 'idle' })
    shrink(picked).then(setImage).catch(() => setImage(null))
  }

  const readIt = async () => {
    setScan({ state: 'reading', progress: 0 })
    try {
      const text = await readFlyer(file, (p) => setScan({ state: 'reading', progress: p }))
      const got = parseFlyer(text)
      const fill = Object.fromEntries(Object.entries(got).filter(([k, v]) => k !== 'found' && v !== undefined && v !== ''))
      if (fill.interest) fill.emoji = INTERESTS.find((i) => i.id === fill.interest)?.emoji || f.emoji
      set(fill)
      setScan({ state: 'done', found: got.found })
    } catch (err) {
      console.error(err)
      setScan({ state: 'error' })
    }
  }

  const build = () => {
    const startAt = new Date(`${f.date}T${f.start}`)
    let endAt = new Date(`${f.date}T${f.end}`)
    if (isNaN(startAt)) return null
    if (isNaN(endAt) || endAt <= startAt) endAt = new Date(startAt.getTime() + 2 * 3600000) // preview only: posting is stopped below
    return {
      id: `p-${uid()}`, title: f.title.trim() || 'Your event name', host: f.host.trim() || state.user.name,
      interest: f.interest, emoji: f.emoji, place: f.place.trim() || 'Where is it?', cost: Number(f.cost) || 0,
      parking: f.parking.trim() || 'See host for details', desc: f.desc.trim() || 'Posted on Common Ground.',
      going: 1, soloFriendly: f.soloFriendly, hideCount: !f.showCount, open: [], here: [],
      source: 'Club post', mine: true,
      placeId: placeFromText(f.place), image,
      startAt: startAt.toISOString(), endAt: endAt.toISOString(),
    }
  }
  const draft = build()
  const preview = draft ? withTimes([draft])[0] : null
  // What's still wrong, in plain words (shown under the button)
  const problems = []
  if (!f.title.trim()) problems.push('Add an event name.')
  if (!f.place.trim()) problems.push('Add where it is.')
  if (!draft) problems.push('Pick a date and start time.')
  else {
    if (f.end <= f.start) problems.push('The end time has to be after the start time.')
    else if (new Date(`${f.date}T${f.end}`) <= new Date()) problems.push('That date and time already passed. Pick a time that\'s still coming up.')
  }
  const timeBad = !!draft && (f.end <= f.start || new Date(`${f.date}T${f.end}`) <= new Date())
  const ok = problems.length === 0

  const publish = () => {
    const event = build()
    dispatch({ type: 'POST_EVENT', event })
    nav.tab('post')
    nav.push('posted', { id: event.id })
  }

  return (
    <div className="screen">
      <h1 className="page-title">Post an event</h1>
      <p className="muted section-sub">Posting as {state.user.org || 'your club'}.</p>
      <div className="demo-note"><FlaskConical size={18} /><span><b>Demo.</b> Your event is saved on this device only. Other students will see posts once real accounts launch.</span></div>

      {/* Photo: drag & drop on a laptop, tap to pick on a phone */}
      <div
        className={`drop ${drag ? 'over' : ''} ${image ? 'has' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addPhoto(e.dataTransfer.files?.[0]) }}
        onClick={() => !image && fileRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        aria-label="Add a photo or flyer"
      >
        {image ? (
          <>
            <img src={image} alt="Event" />
            <button className="drop-x" onClick={(e) => { e.stopPropagation(); setImage(null); setFile(null); setScan({ state: 'idle' }) }} aria-label="Remove photo"><X size={16} /></button>
          </>
        ) : (
          <>
            <ImagePlus size={30} />
            <strong>Add a photo or flyer</strong>
            <span>Drag & drop here, or tap to choose</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { addPhoto(e.target.files?.[0]); e.target.value = '' }} />

      {file && scan.state === 'idle' && (
        <button className="btn btn-outline" onClick={readIt}><Sparkles size={16} /> It's a flyer: fill in the details for me</button>
      )}
      {scan.state === 'reading' && <div className="scan-status"><Loader2 size={16} className="spin" /> Reading flyer… {scan.progress ? `${scan.progress}%` : ''}</div>}
      {scan.state === 'done' && <div className="scan-status ok">✓ Filled in {scan.found.length ? scan.found.join(', ') : 'what we could'}. Double-check below.</div>}
      {scan.state === 'error' && <div className="scan-status err">Couldn't read that one. Fill it in below instead.</div>}

      {!image && (
        <div className="field"><span>No photo? Pick an icon</span>
          <div className="emoji-row">
            {EMOJIS.map((em) => (
              <button key={em} className={`emoji-btn ${f.emoji === em ? 'on' : ''}`} onClick={() => set({ emoji: em })} aria-label={`Icon ${em}`}>{em}</button>
            ))}
          </div>
        </div>
      )}

      <div className="form">
        <label className="field"><span>Event name</span><input value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Taco Tuesday Mixer" /></label>
        <label className="field"><span>Club or host</span><input value={f.host} onChange={(e) => set({ host: e.target.value })} placeholder="e.g. ACM Sac State" /></label>
        <div className="row3">
          <label className="field"><span>Date</span><input type="date" min={todayStr()} value={f.date} onChange={(e) => set({ date: e.target.value })} /></label>
          <label className="field"><span>Start</span><input type="time" value={f.start} onChange={(e) => set({ start: e.target.value })} /></label>
          <label className="field"><span>End</span><input type="time" value={f.end} onChange={(e) => set({ end: e.target.value })} /></label>
        </div>
        {timeBad && <small className="error">{problems.at(-1)}</small>}
        <label className="field"><span>Where</span><input value={f.place} onChange={(e) => set({ place: e.target.value })} placeholder="e.g. University Union, Ballroom" /></label>
        <div className="row2">
          <label className="field"><span>Cost ($, 0 = free)</span><input type="number" min="0" value={f.cost} onChange={(e) => set({ cost: e.target.value })} /></label>
          <label className="field"><span>Parking</span><input value={f.parking} onChange={(e) => set({ parking: e.target.value })} placeholder="e.g. Structure 3" /></label>
        </div>
        <div className="field"><span>Category</span>
          <div className="chips-wrap">
            {INTERESTS.map((i) => <Chip key={i.id} active={f.interest === i.id} onClick={() => set({ interest: i.id, emoji: image ? f.emoji : i.emoji })}>{i.emoji} {i.label}</Chip>)}
          </div>
        </div>
        <label className="field"><span>Description</span><textarea rows={3} value={f.desc} onChange={(e) => set({ desc: e.target.value })} /></label>
        <label className="toggle-row card">
          <div>
            <strong>✨ Welcomes people coming alone</strong>
            <span>Adds a badge, and students who came solo can find each other at your event. Have a greeter or mixed tables ready.</span>
          </div>
          <input type="checkbox" className="switch" checked={f.soloFriendly} onChange={(e) => set({ soloFriendly: e.target.checked })} />
        </label>

        <label className="toggle-row card">
          <div>
            <strong>👥 Show how many people are going</strong>
            <span>Under 10 going, students already see “New event” instead. Turn this off to always hide it. You'll still see the number.</span>
          </div>
          <input type="checkbox" className="switch" checked={f.showCount} onChange={(e) => set({ showCount: e.target.checked })} />
        </label>

        {preview && (
          <div className="preview">
            <span className="label">Preview: how students will see it</span>
            <EventCard event={preview} preview />
          </div>
        )}

        <button className="btn btn-primary btn-lg" disabled={!ok} onClick={publish}>Post event (demo)</button>
        {!ok && <p className="btn-hint">To post: {problems.join(' ')}</p>}
      </div>
    </div>
  )
}

// Shrink a photo so it fits in browser storage (about 60 KB)
function shrink(file, max = 720) {
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
