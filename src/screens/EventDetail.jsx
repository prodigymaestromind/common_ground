import { useEffect, useState } from 'react'
import { Clock, MapPin, DollarSign, Car, Users, Bookmark, BookmarkCheck, Check, ShieldCheck, MessageCircle, UserPlus, ExternalLink, Radio, Trash2, CalendarPlus, Navigation, ChevronRight } from 'lucide-react'
import { studentById, interestById, MEET_SPOTS } from '../data'
import { Avatar, Cover, FitBadge, LiveDot, Sheet, SoloBadge, TopBar, useExplain, useGate, useNav } from '../components'
import { PLACES } from '../places'
import { useStore } from '../store'
import { costLabel, dayLabel, fullDate, fmtRange, fmtTime, isLive, isPast, downloadIcs, googleCalUrl, appleMapsUrl, googleMapsUrl } from '../utils'

export default function EventDetail({ id }) {
  const nav = useNav()
  const { state, dispatch, eventById, sendInvite, openDM, showToast } = useStore()
  const [inviteFor, setInviteFor] = useState(null)
  const [calOpen, setCalOpen] = useState(false)
  const [dirOpen, setDirOpen] = useState(false)
  const [explain, popup] = useExplain()
  const gate = useGate()
  const e = eventById[id]
  const showsCount = e && !e.mine && !e.hideCount && typeof e.going === 'number'
  // first time someone sees a going count, explain it once
  useEffect(() => {
    if (showsCount && !state.tips?.count) { const t = setTimeout(() => explain('count'), 500); return () => clearTimeout(t) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!e) return <div className="screen"><TopBar title="Event" /><p>Event not found.</p></div>

  const live = isLive(e)
  const ended = !live && isPast(e)
  const place = PLACES[e.placeId]
  const rsvp = state.rsvp[e.id]
  const going = rsvp === 'going'
  const open = !!state.company[e.id]
  const people = (e.open || []).filter((s) => !state.blocked.includes(s)).map((s) => studentById[s])

  const setRsvp = (value) => {
    dispatch({ type: 'RSVP', eventId: e.id, value, interest: e.interest })
    if (value === 'going') showToast(`You're going to ${e.title} ✓`)
    if (value === 'saved') showToast('Saved 🔖 Find it in Plans')
  }

  return (
    <div className="screen screen-detail">
      <TopBar title="" />
      <Cover event={e} className="detail-hero">
        <div className="detail-hero-inner">
        <div className="event-top">
          <span className="event-tag light">{interestById[e.interest]?.label}</span>
          {live && <LiveDot />}
          {e.soloFriendly && <SoloBadge />}
        </div>
        <h1>{e.title}</h1>
        <p>Hosted by {e.host}{e.pending ? ' · pending club check' : ''}</p>
        </div>
      </Cover>

      <div className="detail-body">
        <FitBadge event={e} />
        <ul className="info">
          <li><Clock size={18} /><div><strong>{live ? 'Happening now' : ended ? 'Ended today' : dayLabel(e.startAt)}</strong><span>{fullDate(e.startAt)} · {fmtRange(e)}</span></div></li>
          <li>
            <button className="info-link" onClick={() => (place ? nav.push('place', { id: e.id }) : setDirOpen(true))}>
              <MapPin size={18} /><div><strong>{e.place}</strong><span>Tap to see it on the map</span></div><ChevronRight size={18} />
            </button>
          </li>
          <li><DollarSign size={18} /><div><strong>{costLabel(e.cost)}</strong>{!e.cost && <span>No ticket needed</span>}</div></li>
          <li><Car size={18} /><div><strong>Parking</strong><span>{e.parking}</span></div></li>
          <li><Users size={18} /><div>{e.hideCount && !e.mine ? <><strong>New event</strong><span>Be one of the first to go</span></> : typeof e.going === 'number' ? <><strong>{e.going + (going ? 1 : 0)} going</strong><span>{people.length} open to meeting new people</span></> : <><strong>{people.length} open to meeting new people</strong><span>Tap “I'm going” to find someone to go with</span></>}</div></li>
        </ul>
        {e.soloFriendly && <div className="note">✨ <span><b>Welcomes people coming alone.</b> {e.source === 'Sac State Events' ? 'The organizers invite people to come meet others here, so it is a good one to go to on your own.' : 'The host will help solo arrivals meet others (a greeter, mixed tables or an icebreaker).'}</span></div>}
        {!ended && (
          <div className="quick-actions">
            <button className="btn btn-outline" onClick={() => setCalOpen(true)}><CalendarPlus size={16} /> Add to calendar</button>
            <button className="btn btn-outline" onClick={() => setDirOpen(true)}><Navigation size={16} /> Directions</button>
          </div>
        )}
        <p className="desc">{e.desc}</p>
        {e.need && <div className="good-to-know"><strong>Good to know</strong><span>{e.need}</span></div>}
        {e.link && (
          <a className="btn btn-outline official" href={e.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} /> Official page & sign-up
          </a>
        )}
        <p className="source"><ExternalLink size={14} /> Source: {e.source === 'Sac State Events' ? 'Sac State Events (events.csus.edu)' : e.source}</p>

        {live && e.here?.length > 0 && (
          <div className="card here-card">
            <Radio size={22} />
            <div>
              <strong>Came alone? You're not the only one.</strong>
              <span>{e.here.length} people here came solo and want to meet people.</span>
            </div>
            <button className="btn btn-gold" onClick={() => gate('student', () => nav.push('here', { id: e.id }), 'Sign in to see who came solo')}>See who's here</button>
          </div>
        )}

        {e.mine && (
          <section className="company">
            <h2 className="section-title">You're hosting</h2>
            <div className="card host-card">
              <div><strong>{e.going}</strong><span>going</span></div>
              <div><strong>{people.length}</strong><span>looking for company</span></div>
              <div><strong>{e.pending ? 'Pending' : 'Live'}</strong><span>{e.pending ? 'club check' : 'in the feed'}</span></div>
            </div>
            {e.hideCount && <p className="muted small center">👥 The going count is hidden from students. They see “New event”.</p>}
            <p className="muted small center">Students who come alone see your event in "Go with someone" and the solo group chat.</p>
          </section>
        )}

        {!e.mine && <section className="company">
          <h2 className="section-title">Go with someone</h2>
          {!going && (
            <div className="card locked">
              <Users size={22} />
              <p><strong>{people.length} people going are looking for company.</strong> Tap <b>I'm going</b> to see who.</p>
            </div>
          )}
          {going && (
            <>
              <label className="toggle-row card">
                <div>
                  <strong>I'm open to company</strong>
                  <span>Others going can see your first name + interests. Off by default.</span>
                </div>
                <input type="checkbox" className="switch" checked={open} onChange={(ev) => { const v = ev.target.checked; if (v) explain('company', () => dispatch({ type: 'COMPANY', eventId: e.id, value: true })); else dispatch({ type: 'COMPANY', eventId: e.id, value: false }) }} />
              </label>
              {!open && <p className="muted center small"><ShieldCheck size={14} /> Turn this on to see who else wants company. It works both ways.</p>}
              {open && (
                <div className="stack">
                  {people.map((p) => {
                    const shared = p.interests.filter((i) => state.user?.interests?.includes(i))
                    return (
                      <div key={p.id} className="card person">
                        <Avatar person={p} size={44} />
                        <div className="person-info">
                          <strong>{p.name}</strong>
                          <span>{p.year} · {p.major}</span>
                          <div className="tags">
                            {p.interests.map((i) => (
                              <span key={i} className={`tag ${shared.includes(i) ? 'tag-shared' : ''}`}>{interestById[i].emoji} {interestById[i].label}</span>
                            ))}
                          </div>
                          {shared.length > 0 && <span className="shared">You both like {shared.map((i) => interestById[i].label).join(' & ')}</span>}
                        </div>
                        <div className="person-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => explain('chat', () => nav.push('chat', { id: openDM(p.id), eventId: e.id }))}><MessageCircle size={14} /> Say hi</button>
                          <button className="btn btn-sm btn-primary" onClick={() => explain('chat', () => setInviteFor(p))}><UserPlus size={14} /> Invite</button>
                        </div>
                      </div>
                    )
                  })}
                  <p className="muted center small">You choose who to contact. Leave or block any chat at any time.</p>
                </div>
              )}
            </>
          )}
        </section>}
      </div>

      {e.mine ? (
        <div className="action-bar">
          <button className="btn btn-outline danger" onClick={() => { dispatch({ type: 'DELETE_POST', eventId: e.id }); showToast('Event deleted'); nav.pop() }}><Trash2 size={16} /> Delete</button>
          <button className="btn btn-going grow" disabled><Check size={18} /> You're hosting</button>
        </div>
      ) : <div className="action-bar">
        <button className={`btn btn-outline ${rsvp === 'saved' ? 'on' : ''}`} disabled={going} onClick={() => setRsvp(rsvp === 'saved' ? null : 'saved')}>
          {rsvp === 'saved' ? <BookmarkCheck size={18} /> : <Bookmark size={18} />} {rsvp === 'saved' ? 'Saved' : 'Save'}
        </button>
        <button className={`btn ${going ? 'btn-going' : 'btn-gold'} grow`} onClick={() => (going ? setRsvp(null) : gate('student', () => setRsvp('going'), 'Sign in so people going can find you (you control what they see)'))}>
          {going ? <><Check size={18} /> Going · tap to undo</> : "I'm going"}
        </button>
      </div>}

      <Sheet open={calOpen} onClose={() => setCalOpen(false)} title="Add to calendar">
        <p className="muted">Puts {e.title} in your own calendar. Nothing else is shared.</p>
        <button className="option" onClick={() => { downloadIcs(e); setCalOpen(false) }}><CalendarPlus size={16} /> Apple Calendar / Outlook</button>
        <a className="option" href={googleCalUrl(e)} target="_blank" rel="noopener noreferrer" onClick={() => setCalOpen(false)}><CalendarPlus size={16} /> Google Calendar</a>
      </Sheet>

      <Sheet open={dirOpen} onClose={() => setDirOpen(false)} title="Directions">
        <p className="muted">{e.place}</p>
        {place ? (
          <>
            <a className="option" href={appleMapsUrl(place.lat, place.lng, place.name)} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Apple Maps</a>
            <a className="option" href={googleMapsUrl(place.lat, place.lng)} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Google Maps</a>
          </>
        ) : (
          <a className="option" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.place} Sacramento State`)}`} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Google Maps</a>
        )}
      </Sheet>

      {popup}

      <InviteSheet
        person={inviteFor} event={e} onClose={() => setInviteFor(null)}
        onSend={(invite) => {
          const chatId = sendInvite(inviteFor.id, invite)
          setInviteFor(null)
          showToast(`Invite sent to ${inviteFor.name}`)
          nav.push('chat', { id: chatId })
        }}
      />
    </div>
  )
}

function InviteSheet({ person, event, onClose, onSend }) {
  // Before the start for upcoming events; the next few minutes for live ones.
  const base = isLive(event) ? Math.ceil(Date.now() / 300000) * 300000 : event.startAt.getTime()
  const offsets = isLive(event) ? [5, 15, 30] : [-30, -15, 0]
  const times = offsets.map((m) => fmtTime(new Date(base + m * 60000)))
  const [time, setTime] = useState(1)
  const [spot, setSpot] = useState(0)
  if (!person) return null
  return (
    <Sheet open onClose={onClose} title={`Invite ${person.name}`}>
      <p className="muted">Pick when and where to meet before {event.title}. Public spots only.</p>
      <h3 className="label">Meet at</h3>
      <div className="chips-wrap">
        {times.map((t, i) => <button key={t} className={`chip ${time === i ? 'chip-on' : ''}`} onClick={() => setTime(i)}>{t}</button>)}
      </div>
      <h3 className="label">Spot</h3>
      <div className="stack-sm">
        {MEET_SPOTS.map((s, i) => (
          <button key={s} className={`option ${spot === i ? 'on' : ''}`} onClick={() => setSpot(i)}><MapPin size={16} /> {s}</button>
        ))}
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => onSend({ eventId: event.id, time: times[time], spot: MEET_SPOTS[spot] })}>Send invite</button>
    </Sheet>
  )
}
