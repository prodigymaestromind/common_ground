import { useEffect, useRef, useState } from 'react'
import { Clock, MapPin, Monitor, DollarSign, Car, Users, Bookmark, BookmarkCheck, Check, ShieldCheck, MessageCircle, UserPlus, ExternalLink, Radio, Trash2, CalendarPlus, Navigation, ChevronRight } from 'lucide-react'
import { interestById, MEET_SPOTS } from '../data'
import { studentById } from '../demo'
import { Avatar, Confirm, Cover, DemoTag, Empty, FitBadge, LiveDot, Sheet, SoloBadge, TopBar, WhereTag } from '../components'
import { useNav } from '../nav'
import { useExplain, useGate } from '../hooks'
import { PLACES } from '../places'
import { useStore } from '../store'
import { costLabel, dayLabel, fullDate, fmtRange, runsLabel, endedWord, fmtTime, isLive, isPast, showGoing, companyText, soloText, COUNT_MIN, downloadIcs, googleCalUrl, appleMapsUrl, googleMapsUrl } from '../utils'

export default function EventDetail({ id }) {
  const nav = useNav()
  const { state, dispatch, eventById, sendInvite, openDM, showToast } = useStore()
  const [inviteFor, setInviteFor] = useState(null)
  const [calOpen, setCalOpen] = useState(false)
  const [dirOpen, setDirOpen] = useState(false)
  const [delOpen, setDelOpen] = useState(false)
  const [explain, popup] = useExplain()
  const gate = useGate()
  const e = eventById[id]
  const countRow = useRef(null)
  const showsCount = e && !e.mine && showGoing(e)
  // first time someone sees a going count, explain it once
  useEffect(() => {
    if (showsCount && !state.tips?.count) { const t = setTimeout(() => explain('count', null, countRow.current), 500); return () => clearTimeout(t) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!e) return (
    <div className="screen">
      <TopBar title="Event" />
      <Empty icon="🤔" title="We can't find this event">It may have been deleted, or it already ended and left the list.</Empty>
      <button className="btn btn-primary btn-lg" onClick={() => nav.tab('explore')}>Browse all events</button>
    </div>
  )

  const live = isLive(e)
  const ended = !live && isPast(e)
  const place = PLACES[e.placeId]
  // only show parking when the host gave real info (the calendar's generic line says nothing new)
  const parking = e.parking && !/^see (sac state parking|host)/i.test(e.parking) ? e.parking : ''
  const rsvp = state.rsvp[e.id]
  const going = rsvp === 'going'
  const open = !!state.company[e.id]
  const people = (e.open || []).filter((s) => !state.blocked.includes(s)).map((s) => studentById[s])

  const setRsvp = (value) => {
    dispatch({ type: 'RSVP', eventId: e.id, value })
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
          <WhereTag event={e} />
          {e.soloFriendly && <SoloBadge />}
        </div>
        <h1>{e.title}</h1>
        <p>Hosted by {e.host}</p>
        </div>
      </Cover>

      <div className="detail-body">
        <FitBadge event={e} />
        <ul className="info">
          <li><Clock size={18} /><div><strong>{live ? 'Happening now' : ended ? (endedWord(e) === 'Closed' ? 'Closed for today' : 'Ended today') : dayLabel(e.startAt)}</strong><span>{e.runs ? `${runsLabel(e)} · ${fmtRange(e)} each day` : `${fullDate(e.startAt)} · ${fmtRange(e)}`}</span></div></li>
          {e.online ? (
            <li><Monitor size={18} /><div><strong>Online</strong><span>The join link is on the official page below</span></div></li>
          ) : (
            <li>
              <button className="info-link" onClick={() => (place ? nav.push('place', { id: e.id }) : setDirOpen(true))}>
                <MapPin size={18} /><div><strong>{e.place}</strong><span>{place ? 'Tap to see it on the map' : e.offCampus ? 'Off campus · tap for directions' : 'Tap for directions'}</span></div><ChevronRight size={18} />
              </button>
            </li>
          )}
          <li><DollarSign size={18} /><div><strong>{costLabel(e.cost)}</strong>{!e.cost && <span>No ticket needed</span>}</div></li>
          {parking && <li><Car size={18} /><div><strong>Parking</strong><span>{parking}</span></div></li>}
          <li ref={countRow}><Users size={18} /><div>{e.mine || showsCount
            ? <><strong>{e.going + (going && !e.mine ? 1 : 0)} going {e.demo && <DemoTag />}</strong><span>{e.online ? 'Online event' : companyText(people.length)}</span></>
            : <><strong>{e.online ? 'Online event' : companyText(people.length)}</strong><span>New event · be one of the first to go</span></>}</div></li>
        </ul>
        {e.soloFriendly && <div className="note">✨ <span><b>Welcomes people coming alone.</b> {e.source === 'Sac State Events' ? 'The organizers invite people to come meet others here, so it is a good one to go to on your own.' : 'The host will help solo arrivals meet others (a greeter, mixed tables or an icebreaker).'}</span></div>}
        {!ended && (
          <div className="quick-actions">
            <button className="btn btn-outline" onClick={() => setCalOpen(true)}><CalendarPlus size={16} /> Add to calendar</button>
            {!e.online && <button className="btn btn-outline" onClick={() => setDirOpen(true)}><Navigation size={16} /> Directions</button>}
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

        {live && !e.mine && !e.online && (
          <div className="card here-card">
            <Radio size={22} />
            <div>
              <strong>{e.here?.length ? 'Came alone? You\'re not the only one.' : 'Came alone? Start the solo group.'} {e.here?.length > 0 && e.demo && <DemoTag />}</strong>
              <span>{e.here?.length ? `${soloText(e.here.length)} and want to meet people.` : 'Others who come solo will see your message and can find you.'}</span>
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
              <div><strong>Demo</strong><span>on this device only</span></div>
            </div>
            {(e.hideCount || e.going < COUNT_MIN) && <p className="muted small center">👥 Students see “New event” instead of the number{e.hideCount ? ' (you turned it off)' : ` until ${COUNT_MIN} people are going`}.</p>}
            <p className="muted small center">Demo: this event is saved on this device. Other students will see your posts once real accounts launch.</p>
          </section>
        )}

        {!e.mine && e.online && (
          <section className="company">
            <div className="card locked"><Monitor size={22} /><p><strong>This one is online.</strong> There's no meet-up, so “go with someone” is off for this event. Join from the official page.</p></div>
          </section>
        )}

        {!e.mine && !e.online && <section className="company">
          <h2 className="section-title">Go with someone {e.demo && <DemoTag>Demo · sample students</DemoTag>}</h2>
          {!going && (
            <div className="card locked">
              <Users size={22} />
              <p>{people.length
                ? <><strong>{companyText(people.length)}.</strong> Tap <b>I'm going</b> to see who.</>
                : <><strong>Be the first to look for company.</strong> Tap <b>I'm going</b>, then turn on “open to company” so others going can find you.</>}</p>
            </div>
          )}
          {going && (
            <>
              <label className="toggle-row card">
                <div>
                  <strong>I'm open to company</strong>
                  <span>Others going can see your first name + interests. Off by default.</span>
                </div>
                <input type="checkbox" className="switch" checked={open} onChange={(ev) => { const v = ev.target.checked; if (v) explain('company', () => dispatch({ type: 'COMPANY', eventId: e.id, value: true }), ev); else dispatch({ type: 'COMPANY', eventId: e.id, value: false }) }} />
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
                          <button className="btn btn-sm btn-outline" onClick={(ev) => explain('chat', () => nav.push('chat', { id: openDM(p.id), eventId: e.id }), ev)}><MessageCircle size={14} /> Say hi</button>
                          <button className="btn btn-sm btn-primary" onClick={(ev) => explain('chat', () => setInviteFor(p), ev)}><UserPlus size={14} /> Invite</button>
                        </div>
                      </div>
                    )
                  })}
                  {people.length === 0 && <p className="muted center">No one else yet. You're on the list, so anyone going who wants company will see you.</p>}
                  <p className="muted center small">You choose who to contact. Leave or block any chat at any time.</p>
                </div>
              )}
            </>
          )}
        </section>}
      </div>

      {e.mine ? (
        <div className="action-bar">
          <button className="btn btn-outline danger" onClick={() => setDelOpen(true)}><Trash2 size={16} /> Delete</button>
          <button className="btn btn-going grow" disabled><Check size={18} /> You're hosting</button>
        </div>
      ) : <div className="action-bar">
        <button className={`btn btn-outline ${rsvp === 'saved' ? 'on' : ''}`} disabled={going} title={going ? 'Already in your Plans because you\'re going' : undefined} onClick={() => setRsvp(rsvp === 'saved' ? null : 'saved')}>
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
          <a className="option" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.offCampus ? e.place : `${e.place} Sacramento State`)}`} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Google Maps</a>
        )}
      </Sheet>

      <Confirm open={delOpen} onClose={() => setDelOpen(false)} title="Delete this event?" yes="Delete event" danger
        onYes={() => { nav.pop(); dispatch({ type: 'DELETE_POST', eventId: e.id }); showToast('Event deleted', { label: 'Undo', onClick: () => dispatch({ type: 'RESTORE_POST', event: state.posted.find((x) => x.id === e.id) }) }) }}>
        “{e.title}” will be removed from the feed and the map.
      </Confirm>

      {popup}

      {inviteFor && (
        <InviteSheet
          person={inviteFor} event={e} onClose={() => setInviteFor(null)}
          onSend={(invite) => {
            const chatId = sendInvite(inviteFor.id, invite)
            setInviteFor(null)
            showToast(`Invite sent to ${inviteFor.name}`)
            nav.push('chat', { id: chatId })
          }}
        />
      )}
    </div>
  )
}

// Meet-up times to offer: before the start for upcoming events, the next few minutes for live ones.
function inviteTimes(event) {
  const live = isLive(event)
  const base = live ? Math.ceil(Date.now() / 300000) * 300000 : event.startAt.getTime()
  return (live ? [5, 15, 30] : [-30, -15, 0]).map((m) => fmtTime(new Date(base + m * 60000)))
}

function InviteSheet({ person, event, onClose, onSend }) {
  const [times] = useState(() => inviteTimes(event))
  const [time, setTime] = useState(1)
  const [spot, setSpot] = useState(0)
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
