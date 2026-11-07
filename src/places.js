// Campus places: map pins + cover photos.
// PHOTOS: drop your own photo into  public/places/<id>.jpg  (e.g. public/places/union.jpg)
// and it shows up automatically. Until then a colored illustration is used.
// COORDINATES are approximate. Check them in Google Maps and adjust if a pin looks off.

export const CAMPUS_CENTER = [38.5598, -121.4238]

export const PLACES = {
  union: { name: 'University Union', short: 'Union', lat: 38.5578, lng: -121.4234, colors: ['#0b5a3e', '#1f7a55'], icon: '🏛️' },
  library: { name: 'University Library', short: 'Library', lat: 38.55944, lng: -121.42361, colors: ['#2d4a6b', '#3f6a96'], icon: '📚' },
  quad: { name: 'Library Quad', short: 'Quad', lat: 38.5603, lng: -121.4226, colors: ['#3d7a2a', '#68a346'], icon: '🌳' },
  well: { name: 'The WELL', short: 'WELL', lat: 38.5568, lng: -121.4223, colors: ['#1d6b73', '#2d97a1'], icon: '💪' },
  riverside: { name: 'Riverside Hall', short: 'Riverside', lat: 38.5622, lng: -121.4220, colors: ['#3a3f7a', '#5a61b0'], icon: '💻' },
  nest: { name: 'The Nest', short: 'Nest', lat: 38.5629, lng: -121.4250, colors: ['#7a5a12', '#b58a24'], icon: '🏐' },
  kadema: { name: 'Kadema Hall', short: 'Kadema', lat: 38.5590, lng: -121.4268, colors: ['#8a3d2a', '#c0623f'], icon: '🎨' },
  lassen: { name: 'Lassen Hall', short: 'Lassen', lat: 38.5604, lng: -121.4262, colors: ['#5b3d7a', '#8a5bb0'], icon: '🏫' },
  capistrano: { name: 'Capistrano Hall', short: 'Capistrano', lat: 38.5614, lng: -121.4242, colors: ['#6b2d4a', '#a0456f'], icon: '🎷' },
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
  return 'union'
}

export const photoUrl = (id) => `${import.meta.env.BASE_URL}places/${id}.jpg`
