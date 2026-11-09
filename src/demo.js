// ============================================================
// DEMO ONLY. Everything in this file is made up:
//   - the sample students
//   - the "going" counts and who is "open to company" at each event
//   - the automatic chat replies and the placeholder social handles
// The app labels all of it as "Demo". When real accounts and chat exist
// (for example with Supabase), this is the file that gets replaced.
// ============================================================
import { interestById } from './data'

// Sample students (first names only).
export const STUDENTS = [
  { id: 's1', name: 'Alex', major: 'Music', year: 'Transfer', interests: ['music', 'games', 'food'], color: '#2f7d5b' },
  { id: 's2', name: 'Maya', major: 'Art', year: 'Junior', interests: ['art', 'music', 'culture'], color: '#b0623a' },
  { id: 's3', name: 'Walter', major: 'Comm Studies', year: 'Senior', interests: ['music', 'sports', 'food'], color: '#3d5a9e' },
  { id: 's4', name: 'Priya', major: 'Computer Science', year: 'Transfer', interests: ['tech', 'games', 'career'], color: '#7a4aa0' },
  { id: 's5', name: 'Jordan', major: 'Kinesiology', year: 'Freshman', interests: ['sports', 'outdoors', 'wellness'], color: '#a03d55' },
  { id: 's6', name: 'Sam', major: 'Mech Engineering', year: 'Sophomore', interests: ['games', 'tech', 'outdoors'], color: '#2b7a8c' },
  { id: 's7', name: 'Leah', major: 'Psychology', year: 'Transfer', interests: ['wellness', 'art', 'music'], color: '#8c6d1f' },
  { id: 's8', name: 'Diego', major: 'Business', year: 'Junior', interests: ['career', 'food', 'sports'], color: '#5b6b2f' },
  { id: 's9', name: 'Kim', major: 'Biology', year: 'Senior', interests: ['outdoors', 'culture', 'food'], color: '#9e3d8a' },
  { id: 's10', name: 'Marcus', major: 'Electrical Eng', year: 'Transfer', interests: ['tech', 'games', 'music'], color: '#3a6e9e' },
]

export const studentById = Object.fromEntries(STUDENTS.map((s) => [s.id, s]))

// The sample student who "joins" when you are first in a solo group chat.
export const FIRST_JOINER = 's3'

// Same event id always gives the same numbers, so the demo doesn't jump around.
function hash(text) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

// Adds sample people and a sample "going" count to real events, and marks them demo: true.
export function withDemoPeople(events) {
  return events.map((e) => {
    const h = hash(e.id)
    const fans = STUDENTS.filter((s) => s.interests.includes(e.interest)).map((s) => s.id)
    const rest = STUDENTS.map((s) => s.id).filter((id) => !fans.includes(id))
    const start = h % Math.max(fans.length, 1)
    const pool = [...fans.slice(start), ...fans.slice(0, start), ...rest]
    return {
      ...e,
      demo: true,
      going: 12 + (h % 70),
      open: pool.slice(0, 2 + (h % 2)),
      here: pool.slice(0, 2 + ((h >> 3) % 2)),
    }
  })
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Automatic reply in a one-on-one demo chat.
export function demoReply(student, user, repliesSoFar) {
  const shared = student.interests.filter((i) => user?.interests?.includes(i))
  const topic = interestById[shared[0] || student.interests[0]].label.toLowerCase()
  if (repliesSoFar === 0) {
    return pick([
      `Hey! Nice to meet you 😄 I'm big into ${topic} too.`,
      'Hi! Yeah I\'m down to go. Kinda nervous going alone tbh lol',
      `Heyy! I'm a ${student.year.toLowerCase()} in ${student.major}. You?`,
    ])
  }
  return pick([
    'Sounds good to me!',
    'For sure, see you there 👋',
    `Haha same. What ${topic} stuff are you into?`,
    'Perfect. I\'ll text here when I get close.',
  ])
}

// Automatic reply in the solo group demo chat.
export const demoGroupReply = () => pick(['Omw! 2 min 🏃', 'Nice, see you there!', 'I\'m wearing a green hoodie lol', 'Yesss more people 🙌'])

// Placeholder social handle, shown as plain text (never a real account or a link).
const slug = (name = 'you') => name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'you'
export const demoHandle = (name, kind) => (kind === 'instagram' ? `@${slug(name)}.demo` : `${slug(name)}_demo`)
