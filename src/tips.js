// One-time "how this works" pop-ups. Each shows the first time you use the feature.
const DEMO_PEOPLE = 'Demo: the people here are sample students and their replies are automatic for now.'

export const TIPS = {
  count: {
    icon: '👥', title: 'How many are going',
    lines: [
      'This number counts students who tapped “I\'m going” on Common Ground.',
      'Small numbers can make an event look empty, so under 10 going it shows “New event” instead. Clubs can also hide the number completely.',
    ],
    demo: 'Demo: the numbers are sample counts for now.',
  },
  company: {
    icon: '👋', title: 'Open to company',
    lines: [
      'Turn this on and other people going to this event can see your first name and interests, and you see theirs.',
      'It only applies to this one event, and you can turn it off anytime.',
    ],
    demo: DEMO_PEOPLE,
  },
  chat: {
    icon: '💬', title: 'Say hi / Invite',
    lines: [
      'Send a quick message or an invite to meet up at a public spot before the event, so you can walk in together.',
      'Only people who also turned on “open to company” show up here.',
    ],
    demo: DEMO_PEOPLE,
  },
  group: {
    icon: '🫂', title: 'Solo group chat',
    lines: [
      'Everyone in this chat came to the event alone and wants to meet people. If you\'re the first one, others who come solo will see your message.',
      'Use it to find each other (“I\'m by the entrance”) and hang out together. Only first names + interests are shared, never your location.',
    ],
    demo: DEMO_PEOPLE,
  },
  stay: {
    icon: '🤝', title: 'Stay in touch',
    lines: [
      'Pick what to share, like your Instagram. The other person gets a request.',
      'You only see each other\'s info if you BOTH say yes. Otherwise nothing is shared.',
    ],
    demo: 'Demo: the sample student always says yes, and their handle is a placeholder.',
  },
}
