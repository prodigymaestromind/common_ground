// Time + "fits my day" helpers.

const MIN = 60 * 1000

function atTime(dayOffset, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  d.setDate(d.getDate() + dayOffset)
  return d
}

// Give every event real start/end Date objects.
// "live" events are pinned around the current time so the demo always has something happening now.
export function withTimes(events) {
  const now = Date.now()
  return events.map((e) => {
    if (e.live) {
      const start = new Date(Math.floor((now - 40 * MIN) / (15 * MIN)) * 15 * MIN)
      const end = new Date(start.getTime() + 2 * 60 * MIN)
      return { ...e, startAt: start, endAt: end }
    }
    if (e.startAt) return { ...e, startAt: new Date(e.startAt), endAt: new Date(e.endAt) }
    return { ...e, startAt: atTime(e.day, e.start), endAt: atTime(e.day, e.end) }
  })
}

export const isLive = (e, now = Date.now()) => e.startAt <= now && e.endAt > now
export const isPast = (e, now = Date.now()) => e.endAt <= now

export function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' ', '').toLowerCase()
}

export function fmtRange(e) {
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

// "This week" = next 7 days, "Next week" = the 7 after that, then "Later"
export function weekBucket(d) {
  const n = daysFromToday(d)
  if (n < 7) return 'This week'
  if (n < 14) return 'Next week'
  return 'Later'
}
