// Time + "fits my day" helpers.

const MIN = 60 * 1000

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const sameClock = (day, clock) => { const x = new Date(day); x.setHours(clock.getHours(), clock.getMinutes(), 0, 0); return x }

// Give every event real start/end Date objects.
// An event that runs over several days (like a gallery show, Tue to Fri, 12 to 4pm) is open the
// same hours each day. So startAt/endAt become TODAY's hours (or the next open day's), and
// "runs" keeps the first and last day for labels like "Tue–Fri".
export function withTimes(events, now = Date.now()) {
  const today = startOfDay(now)
  return events.map((e) => {
    const first = new Date(e.startAt)
    const last = new Date(e.endAt)
    if (startOfDay(first).getTime() === startOfDay(last).getTime()) return { ...e, startAt: first, endAt: last }
    const lastDay = startOfDay(last)
    let day = startOfDay(first)
    if (today > day) day = today > lastDay ? lastDay : today
    return { ...e, startAt: sameClock(day, first), endAt: sameClock(day, last), runs: { from: startOfDay(first), to: lastDay } }
  })
}

// "Tue–Fri" for a multi-day event (dates when it runs longer than a week)
export function runsLabel(e) {
  if (!e.runs) return ''
  const days = Math.round((e.runs.to - e.runs.from) / 86400000)
  const fmt = days < 7 ? { weekday: 'short' } : { month: 'short', day: 'numeric' }
  return `${e.runs.from.toLocaleDateString([], fmt)}–${e.runs.to.toLocaleDateString([], fmt)}`
}

// After today's hours: "Closed" if it opens again another day, "Ended" if that was it
export const endedWord = (e, now = Date.now()) => (e.runs && startOfDay(now) < e.runs.to ? 'Closed' : 'Ended')
// "Tue–Fri · 12pm – 4pm" for multi-day events, "Today · 6pm – 8pm" for the rest
export const whenLabel = (e) => `${e.runs ? runsLabel(e) : dayLabel(e.startAt)} · ${fmtRange(e)}`

// All-day events have no start time, so they are never shown as "live"
export const isLive = (e, now = Date.now()) => !e.allDay && e.startAt <= now && e.endAt > now
export const isPast = (e, now = Date.now()) => e.endAt <= now
// Already over AND from an earlier day. Today's events stay listed until midnight (shown as "Ended").
export const isGone = (e, now = Date.now()) => {
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  return e.endAt <= midnight
}

export function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' ', '').toLowerCase()
}

export function fmtRange(e) {
  if (e.allDay) return 'All day'
  return `${fmtTime(e.startAt)} – ${fmtTime(e.endAt)}`
}

export function dayLabel(d) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const diff = Math.round((x - today) / (24 * 60 * MIN))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return x.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

// "Mon, Nov 9"
export const fullDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

// Going counts: hidden when the host turns them off, or automatically when
// fewer than COUNT_MIN are going (a tiny number makes events look empty).
// Students then see "New event". Hosts always see the real number.
export const COUNT_MIN = 10
export const showGoing = (e) => typeof e.going === 'number' && !e.hideCount && e.going >= COUNT_MIN

// "Open to company" wording that never says "0"
export const companyText = (n) => (n === 0 ? 'Be the first to look for company' : n === 1 ? '1 person open to meeting new people' : `${n} open to meeting new people`)
export const soloText = (n) => (n === 0 ? 'Be the first in the solo group' : n === 1 ? '1 person here came solo' : `${n} people here came solo`)

export const costLabel = (c) => (!c ? 'Free' : typeof c === 'string' ? c : `$${c}`)

function minutesOfDay(d) {
  return d.getHours() * 60 + d.getMinutes()
}
function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
function fmtHHMM(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m)
  return fmtTime(d)
}

// Compare an event against the student's busy blocks.
// Returns { status: 'fits' | 'conflict' | 'unknown', note }
export function fitCheck(event, busy = []) {
  if (!busy.length) return { status: 'unknown', note: 'Add your schedule to check' }
  const day = event.startAt.getDay()
  const s = minutesOfDay(event.startAt)
  const e = minutesOfDay(event.endAt) || 24 * 60
  const todays = busy.filter((b) => b.days.includes(day))
  const clash = todays.find((b) => toMin(b.start) < e && toMin(b.end) > s)
  if (clash) return { status: 'conflict', note: `Overlaps your ${clash.label.toLowerCase()} (${fmtHHMM(clash.start)}–${fmtHHMM(clash.end)})` }
  const before = todays.find((b) => toMin(b.end) <= s && s - toMin(b.end) <= 150)
  if (before) return { status: 'fits', note: `You're on campus till ${fmtHHMM(before.end)}. Stay for this!` }
  return { status: 'fits', note: 'Fits your schedule' }
}

export const initials = (name = '?') => name.trim().slice(0, 1).toUpperCase()

export const uid = () => Math.random().toString(36).slice(2, 9)

// Whole days from today (0 = today)
export function daysFromToday(d) {
  const a = new Date()
  a.setHours(0, 0, 0, 0)
  const b = new Date(d)
  b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}

// Weeks run Monday to Sunday. "This week" = today through this Sunday,
// "Next week" = the Monday to Sunday after that, then "Later".
export function weekBucket(d) {
  const n = daysFromToday(d)
  const toSunday = (7 - new Date().getDay()) % 7 // days left until Sunday (0 on a Sunday)
  if (n <= toSunday) return 'This week'
  if (n <= toSunday + 7) return 'Next week'
  return 'Later'
}

// Short day for a card badge: "Today", "Tomorrow", "Friday" (this week), or "Wed, Nov 18" (after Sunday)
export function dayBadge(d) {
  const day = dayLabel(d)
  if (day === 'Today' || day === 'Tomorrow') return day
  return weekBucket(d) === 'This week' ? day.split(',')[0] : fullDate(d)
}

// ----- Add to calendar (no permissions needed) -----
const icsDate = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const icsText = (s = '') => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

// Downloads a .ics file. iPhone opens it in Calendar; laptops open Calendar/Outlook.
export function downloadIcs(e) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Common Ground//EN', 'BEGIN:VEVENT',
    `UID:${e.id}@commonground`, `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(e.startAt)}`, `DTEND:${icsDate(e.endAt)}`,
    `SUMMARY:${icsText(e.title)}`, `LOCATION:${icsText(e.place)}`,
    `DESCRIPTION:${icsText(`${e.desc || ''}${e.link ? `\n\n${e.link}` : ''}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${e.title.replace(/[^\w ]+/g, '').trim() || 'event'}.ics`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1000)
}

export function googleCalUrl(e) {
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: e.title, dates: `${icsDate(e.startAt)}/${icsDate(e.endAt)}`,
    details: `${e.desc || ''}${e.link ? `\n\n${e.link}` : ''}`, location: e.place,
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

// ----- Directions in the phone's maps app -----
export const appleMapsUrl = (lat, lng, name) => `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`
export const googleMapsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
