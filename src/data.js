import { REAL_EVENTS } from './realEvents'
// Data for Common Ground: interests, sample students, and the real Sac State events.

export const INTERESTS = [
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'sports', label: 'Sports', emoji: '🏀' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌲' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'culture', label: 'Culture', emoji: '🌎' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
]

export const interestById = Object.fromEntries(INTERESTS.map((i) => [i.id, i]))

// SAMPLE students (made up, first names only) used for the meet-people demo until real accounts exist.
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

// Sample busy times for onboarding (0 = Sunday ... 6 = Saturday).
export const SAMPLE_BUSY = [
  { id: 'b1', label: 'Classes', days: [1, 3], start: '10:00', end: '16:15' },
  { id: 'b2', label: 'Work', days: [2, 4], start: '14:00', end: '18:00' },
]

// Real public events from the Sac State Events calendar (events.csus.edu).
// The "going" numbers in that file were made up for the hackathon, so they're dropped here.
// The students on each event (open / here) are SAMPLE students for the meet-people demo.
export const EVENTS = REAL_EVENTS.map(({ going, ...e }) => e) // eslint-disable-line no-unused-vars
export const EMOJIS = ['🎤', '🎲', '🏀', '🍕', '🎨', '💻', '🌲', '💼', '🎉', '🧘', '🎬', '📚', '☕', '🎮', '⚽', '🎶']

export const MEET_SPOTS = [
  'University Union main entrance',
  'Library Quad fountain',
  'The WELL front desk',
  'Outside the event door',
]

