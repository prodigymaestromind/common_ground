// App state: one reducer, saved to localStorage so the demo survives a refresh.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { EVENTS, CREWS, studentById, interestById } from './data'
import { withTimes, uid } from './utils'

const KEY = 'common-ground-v1'

export const STYLES = [
  { id: 'classic', name: 'Classic', desc: 'Calm list. What\'s happening now, first.', emoji: '📋' },
  { id: 'board', name: 'Board', desc: 'Photo grid like Pinterest/Poppin. Save to boards.', emoji: '🖼️' },
  { id: 'crews', name: 'Crews', desc: 'Join a small crew and go to things together.', emoji: '🧭' },
]

function styleFromUrl() {
  try {
    const s = new URLSearchParams(window.location.search).get('style')
    return STYLES.some((x) => x.id === s) ? s : null
  } catch {
    return null
  }
}

const empty = {
  style: 'classic',
  welcomed: false,
  boards: {}, // eventId -> board name (Board style saves)
  crews: [], // crew ids I joined
  stamps: {}, // stamp id -> timestamp
  user: null, // { name, email, role: 'student' | 'organizer', org, interests: [], busy: [] }
  rsvp: {}, // eventId -> 'going' | 'saved'
  company: {}, // eventId -> true  (I'm open to company at this event)
  chats: {}, // chatId -> { id, type, studentId?, eventId?, title, messages: [], unread }
  posted: [], // events created in the app
  keepInTouch: {}, // studentId -> 'asked' | 'connected'
  blocked: [],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const st = raw ? { ...empty, ...JSON.parse(raw) } : empty
    const urlStyle = styleFromUrl()
    return urlStyle ? { ...st, style: urlStyle } : st
  } catch {
    return empty
  }
}

const msg = (from, text, extra = {}) => ({ id: uid(), from, text, ts: Date.now(), kind: 'text', ...extra })

function upsertChat(state, chat) {
  return { ...state, chats: { ...state.chats, [chat.id]: { messages: [], unread: 0, ...state.chats[chat.id], ...chat } } }
}

const stamp = (state, id) => (state.stamps[id] ? state : { ...state, stamps: { ...state.stamps, [id]: Date.now() } })

function reducer(state, a) {
  switch (a.type) {
    case 'STYLE':
      return { ...state, style: a.style }
    case 'WELCOMED':
      return { ...state, welcomed: true }
    case 'BOARD': {
      const boards = { ...state.boards }
      const rsvp = { ...state.rsvp }
      if (a.board) { boards[a.eventId] = a.board; if (rsvp[a.eventId] !== 'going') rsvp[a.eventId] = 'saved' }
      else { delete boards[a.eventId]; if (rsvp[a.eventId] === 'saved') delete rsvp[a.eventId] }
      return { ...state, boards, rsvp }
    }
    case 'JOIN_CREW':
      return stamp({ ...state, crews: [...new Set([...state.crews, a.crewId])] }, 'crew')
    case 'LEAVE_CREW':
      return { ...state, crews: state.crews.filter((c) => c !== a.crewId) }
    case 'STAMP':
      return stamp(state, a.id)
    case 'SIGN_UP': {
      // Seed one incoming invite so the Accept/Decline flow is visible right away.
      const priya = studentById.s4
      const seeded = upsertChat({ ...state, user: a.user }, {
        id: 'dm-s4', type: 'dm', studentId: 's4', title: priya.name, unread: 1,
        messages: [
          msg('s4', `Hi ${a.user.name}! Saw you're into tech too. Want to go to Hack Night together?`),
          msg('s4', '', { kind: 'invite', invite: { eventId: 'e9', time: '5:15pm', spot: 'Outside the event door', status: 'pending', fromMe: false } }),
        ],
      })
      return seeded
    }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...a.patch } }
    case 'RSVP': {
      const rsvp = { ...state.rsvp }
      if (a.value) rsvp[a.eventId] = a.value
      else delete rsvp[a.eventId]
      const company = { ...state.company }
      if (a.value !== 'going') delete company[a.eventId]
      let next = { ...state, rsvp, company }
      if (a.value === 'going') {
        next = stamp(next, 'first-event')
        if (a.interest && state.user && !state.user.interests.includes(a.interest)) next = stamp(next, 'new-thing')
      }
      return next
    }
    case 'COMPANY':
      return { ...state, company: { ...state.company, [a.eventId]: a.value } }
    case 'OPEN_CHAT':
      return upsertChat(state, a.chat)
    case 'ADD_MSG': {
      const chat = state.chats[a.chatId]
      if (!chat) return state
      const unread = a.message.from === 'me' || a.active ? chat.unread : (chat.unread || 0) + 1
      const next = { ...state, chats: { ...state.chats, [a.chatId]: { ...chat, unread, messages: [...chat.messages, a.message] } } }
      return a.message.from === 'me' && chat.type === 'dm' ? stamp(next, 'said-hi') : next
    }
    case 'INVITE_STATUS': {
      const chat = state.chats[a.chatId]
      const messages = chat.messages.map((m) => (m.id === a.msgId ? { ...m, invite: { ...m.invite, status: a.status } } : m))
      const next = { ...state, chats: { ...state.chats, [a.chatId]: { ...chat, messages } } }
      return a.status === 'accepted' ? stamp(next, 'meetup') : next
    }
    case 'READ': {
      const chat = state.chats[a.chatId]
      if (!chat || !chat.unread) return state
      return { ...state, chats: { ...state.chats, [a.chatId]: { ...chat, unread: 0 } } }
    }
    case 'POST_EVENT':
      return { ...state, posted: [a.event, ...state.posted] }
    case 'KEEP_IN_TOUCH':
      return { ...state, keepInTouch: { ...state.keepInTouch, [a.studentId]: a.value } }
    case 'BLOCK':
      return { ...state, blocked: [...new Set([...state.blocked, a.studentId])] }
    case 'SIGN_OUT':
      return { ...empty, style: state.style, welcomed: true }
    case 'RESET':
      return { ...empty, style: state.style }
    default:
      return state
  }
}

// ----- Simple "smart" replies so the demo chats feel alive -----
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function sharedWith(student, user) {
  return student.interests.filter((i) => user?.interests?.includes(i)).map((i) => interestById[i].label.toLowerCase())
}
function replyText(student, user, count) {
  const shared = sharedWith(student, user)
  const topic = shared[0] || student.interests[0]
  if (count === 0)
    return pick([
      `Hey! Nice to meet you 😄 I'm big into ${topic} too.`,
      `Hi! Yeah I'm down to go. Kinda nervous going alone tbh lol`,
      `Heyy! I'm a ${student.year.toLowerCase()} in ${student.major}. You?`,
    ])
  return pick([
    'Sounds good to me!',
    'For sure, see you there 👋',
    `Haha same. What ${topic} stuff are you into?`,
    'Perfect. I\'ll text here when I get close.',
  ])
}

// Icebreakers based on shared interests (no API needed).
export function icebreakers(student, user, event) {
  const shared = sharedWith(student, user)
  const s = shared[0]
  const lines = []
  if (event) lines.push(`Hey ${student.name}! First time going to ${event.title}?`)
  if (s) lines.push(`I saw you're into ${s} too. What got you into it?`)
  lines.push(`Want to meet up before and walk in together?`)
  if (student.year === 'Transfer') lines.push(`Are you a transfer too? Still figuring out campus lol`)
  return lines.slice(0, 3)
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toast, setToast] = useState(null)
  const activeChat = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms))
  const add = useCallback((chatId, message) => dispatch({ type: 'ADD_MSG', chatId, message, active: activeChat.current === chatId }), [])

  const events = useMemo(() => withTimes([...state.posted, ...EVENTS]), [state.posted])
  const eventById = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e])), [events])

  const showToast = useCallback((text) => {
    setToast(text)
    later(2200, () => setToast(null))
  }, [])

  const openDM = useCallback((studentId) => {
    const s = studentById[studentId]
    dispatch({ type: 'OPEN_CHAT', chat: { id: `dm-${studentId}`, type: 'dm', studentId, title: s.name } })
    return `dm-${studentId}`
  }, [])

  const sendText = useCallback((chatId, text) => {
    add(chatId, msg('me', text))
    const chat = state.chats[chatId]
    if (!chat) return
    if (chat.type === 'dm') {
      const s = studentById[chat.studentId]
      const count = chat.messages.filter((m) => m.from === chat.studentId).length
      later(1400 + Math.random() * 800, () => add(chatId, msg(s.id, replyText(s, state.user, count))))
    } else if (chat.type === 'group') {
      const ev = eventById[chat.eventId]
      const pool = chat.members?.length ? chat.members : ev?.here?.length ? ev.here : ['s3']
      const who = studentById[pick(pool)]
      const lines = chat.crewId
        ? ['Haha love it', 'Down! 🙌', 'Same, see you there', 'Who\'s bringing snacks lol']
        : ['Omw! 2 min 🏃', 'Nice, see you there!', 'I\'m wearing a green hoodie lol', 'Yesss more people 🙌']
      later(1600, () => add(chatId, msg(who.id, pick(lines))))
    }
  }, [add, state.chats, state.user, eventById])

  const sendInvite = useCallback((studentId, invite) => {
    const chatId = openDM(studentId)
    const ev = eventById[invite.eventId]
    const m = msg('me', '', { kind: 'invite', invite: { ...invite, status: 'pending', fromMe: true } })
    add(chatId, m)
    const s = studentById[studentId]
    later(2200, () => {
      dispatch({ type: 'INVITE_STATUS', chatId, msgId: m.id, status: 'accepted' })
      add(chatId, msg(s.id, `Yes! See you at the ${invite.spot} at ${invite.time} for ${ev?.title || 'the event'} 🙌`))
    })
    return chatId
  }, [add, openDM, eventById])

  const answerInvite = useCallback((chatId, m, status) => {
    dispatch({ type: 'INVITE_STATUS', chatId, msgId: m.id, status })
    if (status === 'accepted') {
      dispatch({ type: 'RSVP', eventId: m.invite.eventId, value: 'going' })
      showToast('Plan set ✓ Added to your Plans')
    }
  }, [showToast])

  const joinGroup = useCallback((eventId) => {
    const ev = eventById[eventId]
    const id = `grp-${eventId}`
    if (!state.chats[id]) {
      const [a, b] = ev.here
      dispatch({
        type: 'OPEN_CHAT',
        chat: {
          id, type: 'group', eventId, title: `Solo crew · ${ev.title}`,
          messages: [
            msg('system', 'Everyone here came alone and wants to meet people. Only first names + interests are shared. Your location is never shown.'),
            ...(a ? [msg(a, `Hey all! I'm by the ${ev.place.split(',')[0]} entrance`)] : []),
            ...(b ? [msg(b, 'Same, just got here. Anyone want to grab seats together?')] : []),
          ],
        },
      })
    }
    dispatch({ type: 'STAMP', id: 'solo' })
    return id
  }, [eventById, state.chats])

  const crewChatId = (crewId) => `crew-${crewId}`
  const joinCrew = useCallback((crewId) => {
    const crew = CREWS.find((c) => c.id === crewId)
    const id = crewChatId(crewId)
    dispatch({ type: 'JOIN_CREW', crewId })
    if (!state.chats[id]) {
      const [a, b] = crew.members
      dispatch({
        type: 'OPEN_CHAT',
        chat: {
          id, type: 'group', crewId, members: crew.members, title: `${crew.emblem} ${crew.name}`,
          messages: [
            msg('system', `You joined ${crew.name}. Crews are small (6 max), with no ranks or points. Just people who go to things together.`),
            msg(a, `Welcome ${state.user?.name || ''}! 👋`),
            ...(b ? [msg(b, 'Glad you\'re here. We usually pick one thing a week.')] : []),
          ],
        },
      })
    }
    return id
  }, [state.chats, state.user])

  const rallyCrew = useCallback((crewId, eventId) => {
    const crew = CREWS.find((c) => c.id === crewId)
    const ev = eventById[eventId]
    const id = crewChatId(crewId)
    add(id, msg('me', `📣 Rally: who's down for ${ev.title} (${ev.place.split(',')[0]})?`))
    crew.members.slice(0, 3).forEach((m, i) =>
      later(1200 + i * 900, () => add(id, msg(m, pick(["I'm in! 🙌", 'Down', 'Yes, meet before?', 'Count me in', 'Maybe, I get off work at 6']))))
    )
    return id
  }, [add, eventById])

  const value = {
    state, dispatch, events, eventById, toast, showToast,
    openDM, sendText, sendInvite, answerInvite, joinGroup, joinCrew, rallyCrew,
    setActiveChat: (id) => { activeChat.current = id },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(Ctx)
