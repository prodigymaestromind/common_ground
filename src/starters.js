// Suggested first messages, so nobody has to think of an opener.
import { interestById } from './data'

// One-on-one: based on the event and what you have in common.
export function icebreakers(person, user, event) {
  const shared = person.interests.filter((i) => user?.interests?.includes(i)).map((i) => interestById[i].label.toLowerCase())
  const lines = []
  if (event) lines.push(`Hey ${person.name}! First time going to ${event.title}?`)
  if (shared[0]) lines.push(`I saw you're into ${shared[0]} too. What got you into it?`)
  lines.push('Want to meet up before and walk in together?')
  if (person.year === 'Transfer') lines.push('Are you a transfer too? Still figuring out campus lol')
  return lines.slice(0, 3)
}

// Solo group chat.
export const GROUP_STARTERS = [
  'Hey! I came solo too 👋',
  "I'm near the entrance, anyone close?",
  'Want to grab seats together?',
]
