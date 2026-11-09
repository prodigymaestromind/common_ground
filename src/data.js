import { REAL_EVENTS } from './realEvents'
// Real data for Common Ground: interests, the Sac State events, and option lists.
// Anything made up (sample students, counts, chat replies) lives in demo.js.

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

// Real public events from the Sac State Events calendar (events.csus.edu).
export const EVENTS = REAL_EVENTS

export const EMOJIS = ['🎤', '🎲', '🏀', '🍕', '🎨', '💻', '🌲', '💼', '🎉', '🧘', '🎬', '📚', '☕', '🎮', '⚽', '🎶']

export const MEET_SPOTS = [
  'University Union main entrance',
  'Library Quad fountain',
  'The WELL front desk',
  'Outside the event door',
]

// Ways students can stay in touch (Profile + the Stay in touch sheet)
export const CONTACT_TYPES = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', placeholder: '@yourhandle' },
  { id: 'discord', label: 'Discord', emoji: '🎮', placeholder: 'username' },
  { id: 'snapchat', label: 'Snapchat', emoji: '👻', placeholder: 'username' },
]
