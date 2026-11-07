// Demo data for Common Ground.
// Events are placed relative to TODAY so the demo always has
// "happening now" and "this week" events, whatever day you open it.

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

// Fake students (first names only, for privacy).
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

// day = days from today (0 = today). live = happening right now (times set at load).
export const EVENTS = [
  {
    id: 'e1', title: 'Open Mic Night', host: 'University Union', interest: 'music', emoji: '🎤',
    live: true, place: 'University Union, Redwood Room', cost: 0,
    parking: 'Lot 5 / Structure 5. Free after 6 PM',
    desc: 'Sing, play, read poetry, or try stand-up, or just hang out and enjoy the show. All skill levels welcome.',
    going: 31, soloFriendly: true, source: 'Sac State Events',
    open: ['s1', 's2', 's3'], here: ['s3', 's2', 's7'],
  },
  {
    id: 'e2', title: 'Free Jamba Juice Pop-Up', host: 'Drama Club', interest: 'food', emoji: '🥤',
    live: true, place: 'Library Quad', cost: 0, parking: 'Walk-up, center of campus',
    desc: 'Come say hi to the Drama Club and grab a free smoothie while they last.',
    going: 54, soloFriendly: false, source: 'Club post',
    open: ['s8', 's9'], here: ['s8'],
  },
  {
    id: 'e3', title: 'Board Game Night', host: 'Anime & Games Club', interest: 'games', emoji: '🎲',
    day: 0, start: '19:00', end: '21:30', place: 'University Union, Ballroom', cost: 0,
    parking: 'Structure 3. $3 evening permit',
    desc: 'Catan, Codenames, Uno and more. Tables are mixed so you play with new people.',
    going: 22, soloFriendly: true, source: 'Club post', open: ['s4', 's6', 's10'], here: [],
  },
  {
    id: 'e4', title: 'Hornet Volleyball vs UC San Diego', host: 'Hornet Athletics', interest: 'sports', emoji: '🏐',
    day: 1, start: '13:00', end: '15:00', place: 'The Nest', cost: 0,
    parking: 'Lot 9 next to the Nest. Free on weekends',
    desc: 'Free for students with OneCard. Wear green and gold!',
    going: 140, soloFriendly: false, source: 'Sac State Events', open: ['s5', 's3', 's8'], here: [],
  },
  {
    id: 'e5', title: 'Fall Colors Day Hike', host: 'ASI Peak Adventures', interest: 'outdoors', emoji: '🍂',
    day: 1, start: '07:00', end: '17:00', place: 'Meet at Peak Adventures (The WELL)', cost: 25,
    parking: 'Lot 7 near The WELL',
    desc: 'Guided day hike with transportation included. Spots are limited, so register ahead.',
    going: 14, soloFriendly: true, source: 'Sac State Events', open: ['s9', 's5'], here: [],
  },
  {
    id: 'e6', title: 'Intro to Pottery Night', host: 'Department of Art', interest: 'art', emoji: '🏺',
    day: 2, start: '18:00', end: '20:00', place: 'Kadema Hall, Studio 145', cost: 5,
    parking: 'Structure 2',
    desc: 'Hands-on wheel throwing for beginners. All materials provided.',
    going: 12, soloFriendly: true, source: 'Sac State Events', open: ['s2', 's7'], here: [],
  },
  {
    id: 'e7', title: 'Resume Review Drop-In', host: 'Career Center', interest: 'career', emoji: '📄',
    day: 2, start: '12:00', end: '14:00', place: 'Lassen Hall 2nd floor', cost: 0,
    parking: 'Structure 2',
    desc: 'Bring a printed or digital resume and get 15-minute feedback from a career advisor.',
    going: 38, soloFriendly: false, source: 'Sac State Events', open: ['s4', 's8'], here: [],
  },
  {
    id: 'e8', title: 'Weekly Dose of Mindfulness', host: 'Student Health & Counseling', interest: 'wellness', emoji: '🧘',
    day: 3, start: '12:00', end: '12:30', place: 'The WELL, Room 1010', cost: 0,
    parking: 'Lot 7',
    desc: 'A 30-minute guided session to reset between classes. No experience needed.',
    going: 9, soloFriendly: true, source: 'Sac State Events', open: ['s7', 's5'], here: [],
  },
  {
    id: 'e9', title: 'Hack Night: Build a Discord Bot', host: 'ACM Sac State', interest: 'tech', emoji: '🤖',
    day: 3, start: '17:30', end: '19:30', place: 'Riverside Hall 1001', cost: 0,
    parking: 'Structure 5',
    desc: 'Bring a laptop. Mentors help you build and deploy your first bot. Pizza provided.',
    going: 27, soloFriendly: true, source: 'Club post', open: ['s4', 's6', 's10'], here: [],
  },
  {
    id: 'e10', title: 'Bollywood Night', host: 'Indian Student Association', interest: 'culture', emoji: '💃',
    day: 4, start: '18:00', end: '21:00', place: 'University Union, Ballroom', cost: 0,
    parking: 'Structure 3',
    desc: 'Music, dancing, and food. FREE for Hornets.',
    going: 96, soloFriendly: false, source: 'Sac State Events', open: ['s2', 's9', 's1'], here: [],
  },
  {
    id: 'e11', title: 'Street Fighter 6 Tournament', host: 'Esports @ Sac State', interest: 'games', emoji: '🕹️',
    day: 4, start: '13:00', end: '15:00', place: 'University Union, Game Room', cost: 0,
    parking: 'Structure 3',
    desc: 'Bracket for all levels plus casual setups. Bring your own controller if you have one.',
    going: 40, soloFriendly: true, source: 'Sac State Events', open: ['s6', 's10', 's1'], here: [],
  },
  {
    id: 'e12', title: 'Taco Tuesday Mixer', host: 'Transfer Student Center', interest: 'food', emoji: '🌮',
    day: 5, start: '11:30', end: '13:00', place: 'Lassen Hall Courtyard', cost: 0,
    parking: 'Walk-up',
    desc: 'Free tacos and a low-key way to meet other transfer students. Come alone, leave with friends.',
    going: 33, soloFriendly: true, source: 'Club post', open: ['s1', 's4', 's7', 's10'], here: [],
  },
  {
    id: 'e13', title: 'Jazz Ensemble Concert', host: 'School of Music', interest: 'music', emoji: '🎷',
    day: 6, start: '19:30', end: '21:00', place: 'Capistrano Concert Hall', cost: 10,
    parking: 'Structure 2. $3 evening permit',
    desc: 'The Sac State Jazz Ensemble plays big band classics and new student work.',
    going: 58, soloFriendly: false, source: 'Sac State Events', open: ['s1', 's3'], here: [],
  },
]

// Sample busy times for onboarding (0 = Sunday ... 6 = Saturday).
export const SAMPLE_BUSY = [
  { id: 'b1', label: 'Classes', days: [1, 3], start: '10:00', end: '16:15' },
  { id: 'b2', label: 'Work', days: [2, 4], start: '14:00', end: '18:00' },
]

export const MEET_SPOTS = [
  'University Union main entrance',
  'Library Quad fountain',
  'The WELL front desk',
  'Outside the event door',
]
