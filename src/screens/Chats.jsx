// Chats: one-on-one chats and solo group chats.
// DEMO: the other people are sample students and their replies are automatic (see demo.js).
import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, MapPin, Clock, Check, Ban, Users } from 'lucide-react'
import { studentById } from '../demo'
import { Avatar, Confirm, DemoTag, Empty, TopBar } from '../components'
import { useNav } from '../nav'
import { useGate } from '../hooks'
import { useStore } from '../store'
import { icebreakers, GROUP_STARTERS } from '../starters'
import { KeepInTouchButton } from './StayInTouch'

export function ChatList() {
  const nav = useNav()
  const gate = useGate()
  const { state } = useStore()
  if (!state.user) return (
    <div className="screen">
      <h1 className="page-title">Chats</h1>
      <Empty icon="💬" title="Chat with people going to the same things">
        Sign in to message students who opted in to meet people.
      </Empty>
      <button className="btn btn-primary btn-lg" onClick={() => gate('student')}>Sign in as a student</button>
    </div>
  )
  const chats = Object.values(state.chats)
    .filter((c) => c.type !== 'dm' || !state.blocked.includes(c.studentId))
    .sort((a, b) => (b.messages.at(-1)?.ts || 0) - (a.messages.at(-1)?.ts || 0))

  return (
    <div className="screen">
      <h1 className="page-title">Chats <DemoTag /></h1>
      {chats.length === 0 && <Empty icon="💬" title="No chats yet">Say hi to someone going to the same event as you.</Empty>}
      <div className="stack-sm">
        {chats.map((c) => {
          const person = c.type === 'dm' ? studentById[c.studentId] : null
          return (
            <button key={c.id} className="card chat-row" onClick={() => nav.push('chat', { id: c.id })}>
              {person ? <Avatar person={person} size={46} /> : <span className="group-icon"><Users size={22} /></span>}
              <div className="chat-row-body">
                <strong>{c.title}</strong>
                <span className="muted">{preview(c.messages.at(-1))}</span>
              </div>
              {c.unread > 0 && <span className="badge">{c.unread}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function preview(m) {
  if (!m) return ''
  if (m.kind === 'invite') return '📍 You sent an invite'
  return (m.from === 'me' ? 'You: ' : '') + m.text
}

export function Chat({ id, eventId }) {
  const nav = useNav()
  const { state, dispatch, sendText, eventById, setActiveChat, showToast } = useStore()
  const [text, setText] = useState('')
  const [blockOpen, setBlockOpen] = useState(false)
  const endRef = useRef(null)
  const chat = state.chats[id]
  const person = chat?.type === 'dm' ? studentById[chat.studentId] : null
  const ev = eventById[eventId || chat?.eventId]

  useEffect(() => {
    setActiveChat(id)
    return () => setActiveChat(null)
  }, [id, setActiveChat])
  useEffect(() => {
    dispatch({ type: 'READ', chatId: id })
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages.length, id, dispatch])

  if (!chat) return (
    <div className="screen">
      <TopBar title="Chat" />
      <Empty icon="💬" title="This chat isn't here anymore">You may have left it.</Empty>
      <button className="btn btn-outline btn-lg" onClick={() => nav.tab('chats')}>Back to chats</button>
    </div>
  )

  const iSent = chat.messages.some((m) => m.from === 'me')
  const theyReplied = person && chat.messages.some((m) => m.from === person.id && m.kind === 'text')
  const ideas = iSent ? [] : person ? icebreakers(person, state.user, ev) : GROUP_STARTERS
  const send = (t) => {
    if (!t.trim()) return
    sendText(id, t.trim())
    setText('')
  }
  const block = () => {
    nav.pop()
    dispatch({ type: 'BLOCK', studentId: person.id })
    showToast(`${person.name} blocked`, { label: 'Undo', onClick: () => dispatch({ type: 'UNBLOCK', studentId: person.id }) })
  }
  const leave = () => {
    nav.pop()
    dispatch({ type: 'LEAVE_CHAT', chatId: id })
    showToast('You left the group', { label: 'Undo', onClick: () => dispatch({ type: 'RESTORE_CHAT', chat }) })
  }

  return (
    <div className="screen screen-chat">
      <TopBar
        title={chat.title}
        right={person
          ? <button className="icon-btn" onClick={() => setBlockOpen(true)} aria-label={`Block ${person.name}`} title="Block"><Ban size={18} /></button>
          : <button className="link" onClick={leave}>Leave</button>}
      />
      <p className="chat-sub muted">
        {person && <>{person.year} · {person.major}<br /></>}
        <DemoTag>Demo chat</DemoTag> {person ? `${person.name} is a sample student. Replies are automatic.` : 'Sample students. Replies are automatic.'}
      </p>
      {theyReplied && iSent && <div className="chat-touch"><KeepInTouchButton studentId={person.id} /></div>}

      <div className="messages">
        {chat.messages.map((m) => {
          if (m.from === 'system') return <div key={m.id} className="sys">{m.text}</div>
          if (m.kind === 'invite') return <InviteCard key={m.id} invite={m.invite} event={eventById[m.invite.eventId]} />
          const mine = m.from === 'me'
          const who = studentById[m.from]
          return (
            <div key={m.id} className={`bubble-row ${mine ? 'mine' : ''}`}>
              {!mine && chat.type === 'group' && who && <Avatar person={who} size={28} />}
              <div className={`bubble ${mine ? 'bubble-me' : ''}`}>
                {!mine && chat.type === 'group' && who && <span className="bubble-name">{who.name}</span>}
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {ideas.length > 0 && (
        <div className="ideas">
          <span className="ideas-label"><Sparkles size={14} /> Conversation starters</span>
          {ideas.map((t) => <button key={t} className="idea" onClick={() => send(t)}>{t}</button>)}
        </div>
      )}

      {person && (
        <Confirm open={blockOpen} onClose={() => setBlockOpen(false)} title={`Block ${person.name}?`} yes="Block" danger onYes={block}>
          This chat is hidden and {person.name} won't show up for you at events. You can unblock anyone later in your Profile. (Demo: reports aren't sent to anyone yet.)
        </Confirm>
      )}

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" aria-label="Message" />
        <button className="send" disabled={!text.trim()} aria-label="Send"><Send size={18} /></button>
      </form>
    </div>
  )
}

// A meet-up invite you sent
function InviteCard({ invite, event }) {
  return (
    <div className="invite mine">
      <span className="invite-label">📍 You sent a meet-up invite</span>
      <strong>{event?.title}</strong>
      <span className="meta"><Clock size={14} /> Meet at {invite.time}</span>
      <span className="meta"><MapPin size={14} /> {invite.spot}</span>
      {invite.status === 'accepted'
        ? <span className="status ok"><Check size={14} /> Plan set: {invite.time} · {invite.spot}</span>
        : <span className="status">Waiting for a reply…</span>}
    </div>
  )
}
