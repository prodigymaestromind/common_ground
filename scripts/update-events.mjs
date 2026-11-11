// Turns the Sac State calendar files into the app's event list (src/realEvents.js).
//
// How to refresh the events:
//   1. Download the calendar in chunks (each file holds at most 200 events). Open these in a
//      browser, changing the dates to today, +1 week, +2 weeks, +3 weeks:
//        https://www.trumba.com/calendars/sacramento-state-events.ics
//        https://www.trumba.com/calendars/sacramento-state-events.ics?startdate=YYYYMMDD
//   2. Put the downloaded .ics files in the events-feed/ folder.
//   3. Run:  npm run events
//   4. Check the app (npm run dev), then commit and push.
//
// What is kept: events students can go to, from today to DAYS_AHEAD days out.
// What is left out: holidays and observance days, staff and faculty meetings and trainings,
// visits meant for other schools, alumni-only get-togethers, recovery meetings, and cancelled events.
// Online and off-campus events are kept and labelled.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FEED_DIR = path.join(ROOT, 'events-feed')
const OUT = path.join(ROOT, 'src', 'realEvents.js')
const CURATED = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'curated.json'), 'utf8')) // hand-written details for some events
const DAYS_AHEAD = Number(process.env.DAYS_AHEAD || 31)
const TODAY = process.env.TODAY || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }) // YYYY-MM-DD

// ---------- read the .ics files ----------
const decode = (s = '') => s
  .replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
const noTags = (s = '') => s.replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h\d>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()

function readFeed() {
  const files = fs.existsSync(FEED_DIR) ? fs.readdirSync(FEED_DIR).filter((f) => f.endsWith('.ics')) : []
  if (!files.length) { console.error('No .ics files in events-feed/. See the steps at the top of this script.'); process.exit(1) }
  const byId = new Map()
  for (const f of files) {
    const text = fs.readFileSync(path.join(FEED_DIR, f), 'utf8').replace(/\r?\n[ \t]/g, '')
    for (const block of text.split('BEGIN:VEVENT').slice(1)) {
      const get = (key) => { const m = block.match(new RegExp(`^${key}[^:\\n]*:(.*)$`, 'm')); return m ? decode(m[1]) : '' }
      const custom = (name) => { const m = block.match(new RegExp(`^X-TRUMBA-CUSTOMFIELD;NAME="${name}";ID=(?!21;)[^:\\n]*:(.*)$`, 'm')); return m ? decode(m[1]) : '' }
      const id = (get('UID').match(/(\d+)\s*$/) || [])[1]
      if (!id) continue
      byId.set(id, {
        id, title: get('SUMMARY').trim(), location: get('LOCATION'), category: get('CATEGORIES'),
        start: get('DTSTART'), end: get('DTEND'), allDay: /^DTSTART;VALUE=DATE/m.test(block),
        types: custom('Event Type'), cost: custom('Cost'), short: custom('Short Description'),
        body: get('DESCRIPTION'), image: get('IMAGE'), link: get('X-TRUMBA-LINK'),
      })
    }
  }
  console.log(`Read ${files.length} file(s), ${byId.size} different events.`)
  return [...byId.values()]
}

// ---------- dates ----------
// Pacific time offset for a date: daylight time runs from the 2nd Sunday of March to the 1st Sunday of November.
function offset(ymd) {
  const [y, m, d] = [ymd.slice(0, 4), ymd.slice(4, 6), ymd.slice(6, 8)].map(Number)
  const nthSunday = (month, n) => { const first = new Date(Date.UTC(y, month - 1, 1)).getUTCDay(); return 1 + ((7 - first) % 7) + (n - 1) * 7 }
  const afterStart = m > 3 || (m === 3 && d >= nthSunday(3, 2))
  const beforeEnd = m < 11 || (m === 11 && d < nthSunday(11, 1))
  return afterStart && beforeEnd ? '-07:00' : '-08:00'
}
const iso = (stamp, time) => { const d = stamp.slice(0, 8); const t = time || stamp.slice(9, 15) || '000000'; return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${t.slice(0, 2)}:${t.slice(2, 4)}:00${offset(d)}` }
const addDays = (ymd, n) => { const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8) + n)); return d.toISOString().slice(0, 10).replace(/-/g, '') }

// ---------- rules: what to leave out ----------
const STAFF = /^(faculty senate|employee wellness|learning & development|safety training|center for teaching|information technology|human resources)/i
const NOT_EVENTS = /^(multifaith and cultural)$/i
function skipReason(e, where) {
  if (/cancel+ed|no meeting/i.test(e.title)) return 'cancelled'
  if (STAFF.test(e.category)) return 'staff and faculty'
  if (NOT_EVENTS.test(e.category)) return 'holiday or observance'
  if (/campus closed|\(holiday|final day to|last day to|census date/i.test(e.title)) return 'holiday or observance'
  if (/transfer center visit|city college/i.test(`${e.title} ${e.location}`)) return 'for another school'
  if (e.allDay && !noTags(e.location)) return 'holiday or observance' // an all-day note with no place
  if (/\b(faculty|staff|employees?)\b/i.test(e.title) && !/student/i.test(e.title)) return 'staff and faculty'
  // recovery meetings are anonymous by design, so they don't belong in an app with "I'm going" lists
  if (/\baa meeting|anonymous\b|recovery meeting/i.test(e.title)) return 'private support group'
  if (/^eri\b|research and creative activity/i.test(e.title)) return 'staff and faculty'
  if (/economic forum|business resource|small business|smud spark/i.test(e.title)) return 'community business event'
  // alumni get-togethers are for alumni, but their online career talks are useful to students too
  if (/^alumni/i.test(e.category) && !where.online) return 'alumni only'
  return ''
}

// ---------- rules: where it is ----------
const PLACE_WORDS = [
  ['capistrano', /capistrano|concert hall/i], ['shasta', /shasta|university theatre|playwrights/i], ['kadema', /kadema|witt gallery/i],
  ['well', /the well\b|@ the well|climbing wall|peak adventures|trinity & truckee/i], ['nest', /the nest|yosemite hall|colberg|hornet pavilion|hornet stadium/i],
  ['quad', /library quad|quad\b/i], ['library', /library|carlsen|airc|anthropology museum/i],
  ['lassen', /lassen|dreamer resource/i], ['mendocino', /mendocino/i], ['riverside', /riverside/i], ['teb', /tschannen|\bteb\b|non-?destruct/i],
  ['union', /union|\buu\b|ballroom|redwood room|canyon room|pacific suite|orchard suite|delta room|green & gold|pop-up shop|women.s resource center|swana|nexus|lobby suite|foothill suite|global lounge|multi-?cultural center|pride center/i],
]
const ONLINE = /zoom|virtual|online|webinar|microsoft teams|on24\.com|teams\.microsoft/i
const VAGUE = /^(tba|tbd|register|click|link|see description)/i
const ON_CAMPUS = /hall\b|room\b|center\b|sacramento state|sac state|6000 j|gallery|amphitheater|tea room|clubhouse|guy west|arboretum|stadium|field\b|lab\b|studio|suite|lounge|garden|corp yard|auto shop/i
function whereIs(e) {
  const full = noTags(e.location)
  const first = full.split('\n')[0].trim()
  const placeId = (PLACE_WORDS.find(([, re]) => re.test(full)) || [])[0]
  if (placeId) return { place: first, placeId }
  if (ONLINE.test(full) || (!full && ONLINE.test(`${e.title} ${noTags(e.body).slice(0, 400)}`))) return { place: 'Online', online: true }
  if (!full || VAGUE.test(first)) return { place: 'See the official page', noPlace: true }
  if (ON_CAMPUS.test(full)) return { place: first }
  return { place: full.split('\n').slice(0, 2).join(', '), offCampus: true }
}

// ---------- rules: category ----------
const INTEREST_RULES = [
  ['outdoors', /peak adventures|hike|hiking|kayak|paddle|camping|backpack|skating|yosemite|clean up/i],
  ['games', /(?<!pre-)\bgam(e|es|ing)\b|esports|nexus|trivia|bingo|board game|pixel/i],
  ['music', /concert|recital|jazz|choir|opera|symphon|orchestra|band\b|music|karaoke|ensemble/i],
  ['sports', /sporting event|hornet sports|football|basketball|volleyball|soccer|baseball|softball|tennis|climb|intramural|\bvs\.?\b|watch party/i],
  ['outdoors', /peak adventures|hike|hiking|kayak|camping|backpack|river|outdoor|falls\b|redwoods|trail/i],
  ['art', /exhibit|gallery|theatre|theater|dance|performance|film|movie|art\b|arts\b|craft|paint|bead|ceramic|poetry|literature|reading\b/i],
  ['food', /food|lunch|dinner|breakfast|potluck|pantry|cook|tea gathering|coffee|pizza|tasting/i],
  ['tech', /\btech|hack|coding|\bai\b|data\b|cyber|software|engineering|robot|startup|builders|innovation|entrepreneur/i],
  ['career', /career|resume|interview|internship|job|networking|professional development|information session|grad school|employer|linkedin/i],
  ['wellness', /wellness|health|mindful|yoga|meditat|counsel|fitness|blood drive|self-care|stress|first aid|aa meeting|recovery/i],
  ['culture', /cultur|heritage|celebration|multicultural|pride|identity|community|lecture|discussion|kehilah|international|study abroad|diwali|lunar/i],
]
const EMOJI = { music: '🎵', games: '🎮', sports: '🏀', art: '🎨', food: '🍜', tech: '💻', outdoors: '🌲', career: '💼', culture: '🌎', wellness: '🧘' }
function interestOf(e) {
  const title = `${e.title} ${e.category}`
  const hit = INTEREST_RULES.find(([, re]) => re.test(title)) || INTEREST_RULES.find(([, re]) => re.test(`${e.types} ${e.short}`))
  return hit ? hit[0] : 'culture'
}

// ---------- rules: text ----------
function costOf(raw) {
  const c = raw.trim()
  if (!c) return 'See official page'
  if (/^(free!?|none|no cost|0(\.00)?|\$0(\.00)?)$/i.test(c)) return 0
  if (/^\$?\d+(\.\d+)?$/.test(c)) return Number(c.replace('$', ''))
  const range = c.match(/^\$?(\d+)(?:\.00)?\s*-\s*\$?(\d+)(?:\.00)?$/)
  if (range) return `$${range[1]}–$${range[2]}`
  if (/^free\b.*onecard/i.test(c)) return 'Free w/ OneCard'
  return c.length > 42 ? `${c.slice(0, 40).trim()}…` : c
}
// The calendar's whole description, kept in paragraphs, for "Read more" in the app.
function fullOf(e) {
  return noTags(e.body).split('\n')
    .filter((l) => !/^(cost|event type|short description|event image)\s*:/i.test(l))
    .map((l) => l.replace(/https?:\/\/\S+/g, '').replace(/[\u200b\ufeff]/g, '').replace(/^Link:\s*/i, '').replace(/BUY TICKETS\s*>*/gi, '').replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean).join('\n')
}

function descOf(e) {
  let text = noTags(e.body).split('\n').filter((l) => !/^(cost|event type|short description|event image|contact (name|email|phone)|registration|more info(rmation)?)\s*:/i.test(l))
    .map((l) => l.replace(/BUY TICKETS\s*>*/gi, '').trim()).filter(Boolean)
    // "DROP IN" style headings become "Drop in:", and lines get a full stop so they don't run together
    .map((l) => (/^[A-Z][A-Z &'-]{2,28}$/.test(l) ? `${l[0]}${l.slice(1).toLowerCase()}:` : /[.!?:,;]$/.test(l) ? l : `${l}.`)).join(' ')
  text = text.replace(/https?:\/\/\S+/g, '').replace(/[\u200b\ufeff]/g, '').replace(/\bLink:\s*/g, '').replace(/BUY TICKETS\s*>*/gi, '')
    .replace(/PARKING INFO:.*$/i, '').replace(/\s+/g, ' ').trim()
  const short = e.short.trim()
  let out = short && !text.toLowerCase().includes(short.toLowerCase().slice(0, 40)) ? `${short.replace(/([^.!?])$/, '$1.')} ${text}` : text || short
  out = out.trim()
  if (out.length > 420) { const cut = out.slice(0, 420); const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? ')); out = stop > 160 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…` }
  return out || 'See the official page for details.'
}
const hostOf = (c) => (c.split(',')[0] || '').replace(/^Sac State (?!Featured)/, '').replace(/^Sac State Featured$/, 'Sac State').replace(/^University Union /, '').trim() || 'Sac State'

// ---------- build ----------
const last = addDays(TODAY.replace(/-/g, ''), DAYS_AHEAD)
const today = TODAY.replace(/-/g, '')
const skipped = {}
const kept = []
for (const e of readFeed()) {
  const startDay = e.start.slice(0, 8)
  // all-day events end on the day AFTER their last day in the calendar format
  const endDay = e.allDay && e.end.slice(0, 8) > startDay ? addDays(e.end.slice(0, 8), -1) : e.end.slice(0, 8) || startDay
  if (endDay < today || startDay > last) continue
  const where = whereIs(e)
  const why = skipReason(e, where)
  if (why) { skipped[why] = (skipped[why] || 0) + 1; continue }
  const interest = interestOf(e)
  const hand = CURATED[e.id] || {}
  kept.push({
    id: hand.id || `t${e.id}`,
    ...(where.placeId ? { placeId: where.placeId } : {}),
    title: e.title, host: hostOf(e.category), interest, emoji: EMOJI[interest],
    startAt: e.allDay ? iso(startDay, '000000') : iso(e.start), endAt: e.allDay ? iso(endDay, '235900') : iso(e.end || e.start),
    ...(e.allDay ? { allDay: true } : {}),
    place: where.place, ...(where.online ? { online: true } : {}), ...(where.offCampus ? { offCampus: true } : {}),
    cost: costOf(e.cost), desc: descOf(e), ...(fullOf(e).length > descOf(e).length + 60 ? { more: fullOf(e) } : {}), soloFriendly: false,
    source: 'Sac State Events', link: e.link, ...(e.image ? { image: e.image } : {}),
    ...hand, // hand-written details win
    _key: `${e.title}|${where.place}|${e.start.slice(9)}|${e.end.slice(9)}`, _day: startDay, _endDay: endDay,
  })
}

// Same event on back-to-back days (a pop-up shop that runs all week) becomes one event with daily hours.
kept.sort((a, b) => a._key.localeCompare(b._key) || a._day.localeCompare(b._day))
const merged = []
for (const e of kept) {
  const prev = merged[merged.length - 1]
  if (prev && prev._key === e._key && !e.allDay && addDays(prev._endDay, 1) === e._day) {
    prev.endAt = e.endAt; prev._endDay = e._endDay; prev._count = (prev._count || 1) + 1
  } else merged.push({ ...e })
}
// The calendar sometimes lists one event twice (two departments post it under slightly different names).
// Same start, same end, same building and at least two shared title words = the same event. Keep the fuller one.
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter((w) => w.length > 3))
const score = (e) => (e.image ? 1000 : 0) + e.desc.length
const unique = []
let doubles = 0
for (const e of merged) {
  const twin = unique.findIndex((u) => u.startAt === e.startAt && u.endAt === e.endAt && (u.placeId || u.place) === (e.placeId || e.place)
    && (u.title.toLowerCase() === e.title.toLowerCase() || [...words(u.title)].filter((w) => words(e.title).has(w)).length >= 2))
  if (twin === -1) { unique.push(e); continue }
  doubles += 1
  if (score(e) > score(unique[twin])) unique[twin] = e
}
const events = unique.sort((a, b) => a.startAt.localeCompare(b.startAt) || a.title.localeCompare(b.title)).map(({ _key, _day, _endDay, _count, ...e }) => e)

fs.writeFileSync(OUT, `// Real public events from the Sac State Events calendar (events.csus.edu).
// MADE BY A SCRIPT: don't edit by hand. To refresh, see scripts/update-events.mjs.
// Only real event info lives in this file. Sample people and counts are added in demo.js.

// The day this list was last copied from the Sac State events calendar (shown in the app).
export const EVENTS_UPDATED = '${TODAY}'

export const REAL_EVENTS = ${JSON.stringify(events, null, 1)}
`)

const count = (fn) => events.filter(fn).length
console.log(`Kept ${kept.length} events (${events.length} cards after joining back-to-back days), ${TODAY} to ${last.replace(/(\d{4})(\d\d)(\d\d)/, '$1-$2-$3')}.`)
console.log(`  on campus with a map pin: ${count((e) => e.placeId)} · on campus, no pin: ${count((e) => !e.placeId && !e.online && !e.offCampus)} · online: ${count((e) => e.online)} · off campus: ${count((e) => e.offCampus)}`)
console.log('Left out:', skipped, '· listed twice:', doubles)
