// Campus places: map pins + cover photos.
// PHOTOS: drop your own photo into  public/places/<id>.jpg  (e.g. public/places/union.jpg)
// and it shows up automatically. Until then a colored illustration is used.
// COORDINATES (checked Nov 2026):
//   from public listings: Capistrano, Riverside, Mendocino, Shasta (Waze place data),
//   The Nest / Yosemite Hall (Wikipedia), Library (Wikimedia Commons),
//   University Union (OpenStreetMap label), The WELL (west of Parking Structure III,
//   north of Hornet Stadium).
//   Best estimates from campus layout (double-check on a walk): Library Quad, Lassen, Kadema, TEB.

export const CAMPUS_CENTER = [38.5603, -121.4245]

export const PLACES = {
  union: { name: 'University Union', short: 'Union', lat: 38.5596, lng: -121.4226, colors: ['#0b5a3e', '#1f7a55'], icon: '🏛️' },
  library: { name: 'University Library', short: 'Library', lat: 38.5594, lng: -121.424, colors: ['#2d4a6b', '#3f6a96'], icon: '📚' },
  quad: { name: 'Library Quad', short: 'Quad', lat: 38.5604, lng: -121.4238, colors: ['#3d7a2a', '#68a346'], icon: '🌳' },
  well: { name: 'The WELL', short: 'WELL', lat: 38.5571, lng: -121.4229, colors: ['#1d6b73', '#2d97a1'], icon: '💪' },
  riverside: { name: 'Riverside Hall', short: 'Riverside', lat: 38.561, lng: -121.4224, colors: ['#3a3f7a', '#5a61b0'], icon: '💻' },
  nest: { name: 'The Nest', short: 'Nest', lat: 38.5619, lng: -121.4269, colors: ['#7a5a12', '#b58a24'], icon: '🏐' },
  kadema: { name: 'Kadema Hall', short: 'Kadema', lat: 38.5631, lng: -121.4256, colors: ['#8a3d2a', '#c0623f'], icon: '🎨' },
  lassen: { name: 'Lassen Hall', short: 'Lassen', lat: 38.5622, lng: -121.4255, colors: ['#5b3d7a', '#8a5bb0'], icon: '🏫' },
  shasta: { name: 'Shasta Hall (University Theatre)', short: 'Shasta', lat: 38.5647, lng: -121.4239, colors: ['#4a2d6b', '#7a4aa0'], icon: '🎭' },
  mendocino: { name: 'Mendocino Hall', short: 'Mendocino', lat: 38.5627, lng: -121.4236, colors: ['#2d5a6b', '#3f8096'], icon: '🏛️' },
  teb: { name: 'Tschannen Engineering Building', short: 'TEB', lat: 38.5615, lng: -121.4228, colors: ['#3a3f7a', '#5a61b0'], icon: '🛠️' },
  capistrano: { name: 'Capistrano Hall', short: 'Capistrano', lat: 38.5601, lng: -121.4258, colors: ['#6b2d4a', '#a0456f'], icon: '🎷' },
}

// Guess the place from free text (used for events people post)
export function placeFromText(text = '') {
  const t = text.toLowerCase()
  if (t.includes('union') || t.includes('ballroom') || t.includes('redwood')) return 'union'
  if (t.includes('quad')) return 'quad'
  if (t.includes('library')) return 'library'
  if (t.includes('well')) return 'well'
  if (t.includes('riverside')) return 'riverside'
  if (t.includes('nest')) return 'nest'
  if (t.includes('kadema')) return 'kadema'
  if (t.includes('lassen')) return 'lassen'
  if (t.includes('capistrano')) return 'capistrano'
  if (t.includes('shasta')) return 'shasta'
  if (t.includes('mendocino')) return 'mendocino'
  if (t.includes('tschannen') || t.includes('teb')) return 'teb'
  return 'union'
}

export const photoUrl = (id) => `${import.meta.env.BASE_URL}places/${id}.jpg`
