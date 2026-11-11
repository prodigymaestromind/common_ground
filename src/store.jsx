// App state: one reducer, saved in the browser (localStorage) so it survives a refresh.
// There is no server yet, so everything here stays on this device.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { EVENTS } from './data'
import { studentById, withDemoPeople, demoReply, demoGroupReply, FIRST_JOINER } from './demo'
import { withTimes, uid } from './utils'

const KEY = 'common-ground-v2'

// Real events with the demo people/counts attached (see demo.js).
const BASE_EVENTS = withDemoPeople(EVENTS)

const empty = {
  welcomed: false,
  tips: {}, // one-time pop-ups and notes already seen
  feedback: { actions: 0, submitted: false, dismissed: false },
  user: null, // { name, email, role: 'student' | 'organizer', org, interests: [], busy: [], contacts: {} }
  rsvp: {}, // eventId -> 'going' | 'saved'
  company: {}, // eventId -> true (I'm open to company at this event)
  chats: {}, // chatId -> { id, type: 'dm' | 'group', studentId?, eventId?, title, messages: [], unread }
  posted: [], // events created in the app
  keepInTouch: {}, // studentId -> { status: 'asked' | 'connected', shared: [] }
  blocked: [],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const st = raw ? { ...empty, ...JSON.parse(raw) } : { ...empty }
    st.feedback = { ...empty.feedback, ...st.feedback }
    st.tips = st.tips || {}
    st.chats = dropPlantedInvites(st.chats)
    return st
  } catch {
    return { ...empty }
  }
}

// Before v1.5.1 every new account got a planted invite. Remove it from saved data.
function dropPlantedInvites(chats = {}) {
  const out = {}
  for (const [id, chat] of Object.entries(chats)) {
    const planted = chat.messages?.some((m) => m.kind === 'invite' && !m.invite?.fromMe)
    if (!planted) { out[id] = chat; continue }
    if (!chat.messages.some((m) => m.from === 'me')) continue // never used: drop the whole chat
    out[id] = { ...chat, unread: 0, messages: chat.messages.filter((m) => !(m.kind === 'invite' && !m.invite?.fromMe)) }
  }
  return out
}

const msg = (from, text, extra = {}) => ({ id: uid(), from, text, ts: Date.now(), kind: 'text', ...extra })

function upsertChat(state, chat) {
  return { ...state, chats: { ...state.chats, [chat.id]: { messages: [], unread: 0, ...state.chats[chat.id], ...chat } } }
}

// Counts things people do, so the feedback nudge shows after they've tried the app.
const bump = (state, n) => ({ ...state.feedback, actions: (state.feedback?.actions || 0) + n })

function reducer(state, a) {
  switch (a.type) {
    case 'FEEDBACK':
      return { ...state, feedback: { ...state.feedback, ...a.patch } }
    case 'ORG_COUNTS': // organizer setting: show/hide going counts on all their events
      return { ...state, user: { ...state.user, showCounts: a.value }, posted: state.posted.map((e) => ({ ...e, hideCount: !a.value })) }
    case 'TIP_SEEN':
      return { ...state, tips: { ...state.tips, [a.key]: true } }
    case 'TIPS_RESET': // "Show the tips again" on the How it works page
      return { ...state, tips: {} }
    case 'WELCOMED':
      return { ...state, welcomed: true }
    case 'SIGN_UP':
      return { ...state, user: a.user }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...a.patch } }
    case 'RSVP': {
      const rsvp = { ...state.rsvp }
      if (a.value) rsvp[a.eventId] = a.value
      else delete rsvp[a.eventId]
      const company = { ...state.company }
      if (a.value !== 'going') delete company[a.eventId]
      return { ...state, rsvp, company, feedback: bump(state, a.value ? 1 : 0) }
    }
    case 'COMPANY':
      return { ...state, company: { ...state.company, [a.eventId]: a.value } }
    case 'OPEN_CHAT':
      return upsertChat(state, a.chat)
    case 'ADD_MSG': {
      const chat = state.chats[a.chatId]
      if (!chat) return state
      const unread = a.message.from === 'me' || a.active ? chat.unread : (chat.unread || 0) + 1
      return { ...state, feedback: bump(state, a.message.from === 'me' ? 1 : 0), chats: { ...state.chats, [a.chatId]: { ...chat, unread, messages: [...chat.messages, a.message] } } }
    }
    case 'INVITE_ACCEPTED': {
      const chat = state.chats[a.chatId]
      if (!chat) return state
      const messages = chat.messages.map((m) => (m.id === a.msgId ? { ...m, invite: { ...m.invite, status: 'accepted' } } : m))
      return { ...state, chats: { ...state.chats, [a.chatId]: { ...chat, messages } } }
    }
    case 'READ': {
      const chat = state.chats[a.chatId]
      if (!chat || !chat.unread) return state
      return { ...state, chats: { ...state.chats, [a.chatId]: { ...chat, unread: 0 } } }
    }
    case 'POST_EVENT':
      return { ...state, posted: [a.event, ...state.posted], feedback: bump(state, 1) }
    case 'RESTORE_POST': // Undo after deleting
      return a.event && !state.posted.some((e) => e.id === a.event.id) ? { ...state, posted: [a.event, ...state.posted] } : state
    case 'DELETE_POST':
      return { ...state, posted: state.posted.filter((e) => e.id !== a.eventId) }
    case 'KEEP_IN_TOUCH':
      return { ...state, keepInTouch: { ...state.keepInTouch, [a.studentId]: a.value } }
    case 'BLOCK':
      return { ...state, blocked: [...new Set([...state.blocked, a.studentId])] }
    case 'UNBLOCK':
      return { ...state, blocked: state.blocked.filter((id) => id !== a.studentId) }
    case 'RESTORE_CHAT': // Undo after leaving a group
      return a.chat ? { ...state, chats: { ...state.chats, [a.chat.id]: a.chat } } : state
    case 'LEAVE_CHAT': {
      const chats = { ...state.chats }
      delete chats[a.chatId]
      return { ...state, chats }
    }
    case 'SIGN_OUT':
      return { ...empty, tips: state.tips, welcomed: true }
    case 'RESET':
      return { ...empty }
    default:
      return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toast, setToast] = useState(null)
  // Explore remembers List/Map + the week tab while the app is open
  const [explore, setExplore] = useState({ view: 'list', range: 'This week' })
  // Home's "For you" switch (only events matching your interests)
  const [forYou, setForYou] = useState(false)
  // changes at midnight, so multi-day events move on to the next day's hours
  const [today, setToday] = useState(() => new Date().toDateString())
  const activeChat = useRef(null)
  const timers = useRef([])
  const toastTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // storage full or turned off (private browsing): the app still works, it just won't remember
      setTimeout(() => setToast({ text: 'Couldn\'t save on this device. Your changes may be gone after a refresh.' }), 0)
    }
  }, [state])
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(toastTimer.current) }, [])
  useEffect(() => {
    const t = setInterval(() => setToday(new Date().toDateString()), 60000)
    return () => clearInterval(t)
  }, [])

  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms))
  const add = useCallback((chatId, message) => dispatch({ type: 'ADD_MSG', chatId, message, active: activeChat.current === chatId }), [])

  // Real Sac State events + anything posted in the app on this device.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- "today" is there on purpose, to redo this at midnight
  const events = useMemo(() => withTimes([...state.posted, ...BASE_EVENTS]), [state.posted, today])
  const eventById = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e])), [events])

  // showToast('Saved') or showToast('Maya blocked', { label: 'Undo', onClick: () => ... })
  const showToast = useCallback((text, action) => {
    setToast({ text, action })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 2400)
  }, [])
  const hideToast = useCallback(() => { clearTimeout(toastTimer.current); setToast(null) }, [])

  const openDM = useCallback((studentId) => {
    dispatch({ type: 'OPEN_CHAT', chat: { id: `dm-${studentId}`, type: 'dm', studentId, title: studentById[studentId].name } })
    return `dm-${studentId}`
  }, [])

  // ----- DEMO: the "other people" below are sample students with automatic replies (see demo.js) -----
  const sendText = useCallback((chatId, text) => {
    add(chatId, msg('me', text))
    const chat = state.chats[chatId]
    if (!chat) return
    if (chat.type === 'dm') {
      const s = studentById[chat.studentId]
      const repliesSoFar = chat.messages.filter((m) => m.from === chat.studentId).length
      later(1400 + Math.random() * 800, () => add(chatId, msg(s.id, demoReply(s, state.user, repliesSoFar))))
      return
    }
    const people = chat.members?.length ? chat.members : eventById[chat.eventId]?.here || []
    if (people.length) {
      later(1600, () => add(chatId, msg(people[Math.floor(Math.random() * people.length)], demoGroupReply())))
    } else {
      // first one in the group: a sample student joins after your message
      dispatch({ type: 'OPEN_CHAT', chat: { id: chatId, members: [FIRST_JOINER] } })
      later(1800, () => add(chatId, msg('system', `${studentById[FIRST_JOINER].name} joined the solo group`)))
      later(3000, () => add(chatId, msg(FIRST_JOINER, 'Hey! Just got here too 🙌 Where are you at?')))
    }
  }, [add, state.chats, state.user, eventById])

  const sendInvite = useCallback((studentId, invite) => {
    const chatId = openDM(studentId)
    const m = msg('me', '', { kind: 'invite', invite: { ...invite, status: 'pending' } })
    add(chatId, m)
    later(2200, () => {
      dispatch({ type: 'INVITE_ACCEPTED', chatId, msgId: m.id })
      add(chatId, msg(studentId, `Yes! See you at the ${invite.spot} at ${invite.time} for ${eventById[invite.eventId]?.title || 'the event'} 🙌`))
    })
    return chatId
  }, [add, openDM, eventById])

  const joinGroup = useCallback((eventId) => {
    const ev = eventById[eventId]
    const id = `grp-${eventId}`
    if (!state.chats[id]) {
      const [a, b] = ev.here
      dispatch({
        type: 'OPEN_CHAT',
        chat: {
          id, type: 'group', eventId, title: `Solo group · ${ev.title}`,
          messages: [
            msg('system', `Welcome to the solo group for ${ev.title} 👋 Everyone here came alone and wants to meet people. Only first names + interests are shared. Your location is never shown.`),
            ...(a ? [msg(a, `Hey all! I'm by the ${ev.place.split(',')[0].replace(/^the /i, '')} entrance`)] : [msg('system', 'You\'re the first one here. Say hi, and anyone else who comes solo will see it.')]),
            ...(b ? [msg(b, 'Same, just got here. Anyone want to grab seats together?')] : []),
          ],
        },
      })
    }
    return id
  }, [eventById, state.chats])

  const value = {
    state, dispatch, events, eventById, toast, showToast, hideToast,
    explore, setExplore, forYou, setForYou,
    openDM, sendText, sendInvite, joinGroup,
    setActiveChat: (id) => { activeChat.current = id },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(Ctx)
