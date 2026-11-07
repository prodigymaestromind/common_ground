// Flyer scanning: reads text from a photo (OCR, runs in the browser)
// and guesses the event details from it.

export async function readFlyer(file, onProgress) {
  const { createWorker } = await import('tesseract.js')
  // Default: tesseract loads its engine + English data from a CDN.
  // Set VITE_TESS_LOCAL=1 to load them from /public/tesseract instead (offline demos).
  const local = import.meta.env.VITE_TESS_LOCAL
    ? { workerPath: `${import.meta.env.BASE_URL}tesseract/worker.min.js`, corePath: `${import.meta.env.BASE_URL}tesseract/`, langPath: `${import.meta.env.BASE_URL}tesseract/` }
    : {}
  const worker = await createWorker('eng', 1, {
    ...local,
    logger: (m) => m.status === 'recognizing text' && onProgress?.(Math.round(m.progress * 100)),
  })
  try {
    const { data } = await worker.recognize(file)
    return data.text
  } finally {
    await worker.terminate()
  }
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const PLACES = ['union', 'library', 'well', 'hall', 'quad', 'nest', 'room', 'center', 'ballroom', 'stadium', 'courtyard', 'theatre', 'theater']
const INTEREST_WORDS = {
  music: ['music', 'concert', 'open mic', 'band', 'jazz', 'dj', 'sing'],
  games: ['game', 'gaming', 'esports', 'tournament', 'board'],
  sports: ['volleyball', 'basketball', 'soccer', 'football', 'intramural', 'vs'],
  art: ['art', 'paint', 'pottery', 'drawing', 'gallery'],
  food: ['food', 'pizza', 'taco', 'free food', 'snacks', 'boba', 'juice', 'bbq'],
  tech: ['code', 'coding', 'hack', 'tech', 'ai', 'robot', 'acm', 'computer'],
  outdoors: ['hike', 'outdoor', 'camping', 'kayak', 'climb'],
  career: ['career', 'resume', 'internship', 'job', 'networking', 'recruit'],
  culture: ['culture', 'cultural', 'heritage', 'festival', 'night market', 'bollywood'],
  wellness: ['yoga', 'mindful', 'wellness', 'meditation', 'mental'],
}

const pad = (n) => String(n).padStart(2, '0')

function to24(h, m, ap) {
  let hh = Number(h)
  if (ap) {
    ap = ap.toLowerCase()
    if (ap.startsWith('p') && hh < 12) hh += 12
    if (ap.startsWith('a') && hh === 12) hh = 0
  } else if (hh < 8) hh += 12 // "6" on a flyer almost always means 6 PM
  return `${pad(hh)}:${pad(Number(m || 0))}`
}

export function parseFlyer(raw) {
  const text = raw.replace(/\r/g, '')
  const lower = text.toLowerCase()
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 2)
  const out = {}

  // Host: a line that names a club/org. Title: the first other "headline-ish" line.
  const hostRe = /\b(club|association|society|presents|sac state|acm|asi|department|center|council)\b/i
  const hostLine = lines.find((l) => hostRe.test(l) && l.length <= 40)
  if (hostLine) out.host = hostLine.replace(/\s*presents:?$/i, '').trim()
  const headline = (l) => /[a-z]{3}/i.test(l) && l.length <= 40 && !/\d{1,2}[:/]\d/.test(l) && !/\d\s*(am|pm)/i.test(l)
  out.title = lines.find((l) => l !== hostLine && headline(l)) || ''
  out.title = out.title.replace(/[^\w &!'’\-:]/g, '').trim()

  // Date
  const now = new Date()
  let date = null
  const m1 = lower.match(new RegExp(`(${MONTHS.join('|')})[a-z]*\\.?\\s+(\\d{1,2})`))
  const m2 = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/)
  if (m1) date = new Date(now.getFullYear(), MONTHS.indexOf(m1[1]), Number(m1[2]))
  else if (m2) date = new Date(now.getFullYear(), Number(m2[1]) - 1, Number(m2[2]))
  else {
    const wd = lower.match(new RegExp(`\\b(${WEEKDAYS.join('|')})[a-z]*\\b`))
    if (wd) {
      date = new Date(now)
      const diff = (WEEKDAYS.indexOf(wd[1]) - now.getDay() + 7) % 7
      date.setDate(now.getDate() + diff)
    }
  }
  if (date) out.date = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  // Time range like "6-8pm", "6:00 PM - 8:30 PM", "7pm"
  const tr = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/)
  const t1 = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/)
  if (tr) {
    out.start = to24(tr[1], tr[2], tr[3] || tr[6])
    out.end = to24(tr[4], tr[5], tr[6])
  } else if (t1) {
    out.start = to24(t1[1], t1[2], t1[3])
    const [h, m] = out.start.split(':').map(Number)
    out.end = `${pad(Math.min(h + 2, 23))}:${pad(m)}`
  }

  // Place
  const placeLine = lines.find((l) => PLACES.some((p) => new RegExp(`\\b${p}\\b`, 'i').test(l)))
  if (placeLine) out.place = placeLine.replace(/^(where|location|place)\s*[:-]\s*/i, '')

  // Cost
  if (/\bfree\b/.test(lower)) out.cost = 0
  const money = lower.match(/\$\s?(\d+)/)
  if (money) out.cost = Number(money[1])

  // Interest
  let best = null
  let bestScore = 0
  for (const [id, words] of Object.entries(INTEREST_WORDS)) {
    const score = words.filter((w) => lower.includes(w)).length
    if (score > bestScore) { best = id; bestScore = score }
  }
  if (best) out.interest = best

  out.desc = lines.filter((l) => l !== out.title).slice(0, 4).join(' ')
  out.found = ['title', 'date', 'start', 'place', 'cost'].filter((k) => out[k] !== undefined && out[k] !== '')
  return out
}
