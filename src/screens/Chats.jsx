import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, MapPin, Clock, Check, X, Ban, Users } from 'lucide-react'
import { studentById } from '../data'
import { Avatar, Empty, TopBar, useGate, useNav } from '../components'
import { useStore, icebreakers } from '../store'

export function ChatList() {
  const nav = useNav()
  const gate = useGate()
  const { state } = useStore()
  if (!state.user) return (
    <div className="screen">
      <h1 className="page-title">Chats</h1>
      <Empty icon="💬" title="Chat with people going to the same things">
        Sign in with your csus.edu email to message students who opted in to meet people.
      </Empty>
      <button className="btn btn-primary btn-lg" onClick={() => gate('student')}>Sign in as a student</button>
    </div>
  )
  const chats = Object.values(state.chats)
    .filter((c) => c.type !== 'dm' || !state.blocked.includes(c.studentId))
    .sort((a, b) => (b.messages.at(-1)?.ts || 0) - (a.messages.at(-1)?.ts || 0))

  return (
    <div className="screen">
      <h1 className="page-title">Chats</h1>
      {chats.length === 0 && <Empty icon="💬" title="No chats yet">Say hi to someone going to the same event as you.</Empty>}
      <div className="stack-sm">
        {chats.map((c) => {
          const last = c.messages.at(-1)
          const person = c.type === 'dm' ? studentById[c.studentId] : null
          return (
            <button key={c.id} className="card chat-row" onClick={() => nav.push('chat', { id: c.id })}>
              {person ? <Avatar person={person} size={46} /> : <span className="group-icon"><Users size={22} /></span>}
              <div className="chat-row-body">
                <strong>{c.title}</strong>
                <span className="muted">{preview(last)}</span>
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
  if (m.kind === 'invite') return m.invite.fromMe ? '📍 You sent an invite' : '📍 Invite to meet up'
  return (m.from === 'me' ? 'You: ' : '') + m.text
}

export function Chat({ id, eventId }) {
  const nav = useNav()
  const { state, dispatch, sendText, answerInvite, eventById, setActiveChat, showToast } = useStore()
  const [text, setText] = useState('')
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

  if (!chat) return <div className="screen"><TopBar title="Chat" /></div>

  const iSent = chat.messages.some((m) => m.from === 'me')
  const ideas = person && !iSent ? icebreakers(person, state.user, ev) : []
  const send = (t) => {
    if (!t.trim()) return
    sendText(id, t.trim())
    setText('')
  }
  const block = () => {
    dispatch({ type: 'BLOCK', studentId: person.id })
    showToast(`${person.name} blocked and reported`)
    nav.pop()
  }

  return (
    <div className="screen screen-chat">
      <TopBar
        title={chat.title}
        right={person
          ? <button className="icon-btn" onClick={block} aria-label="Block and report" title="Block & report"><Ban size={18} /></button>
          : <button className="link" onClick={() => { nav.pop(); showToast('You left the group') }}>Leave</button>}
      />
      {person && <p className="chat-sub muted">{person.year} · {person.major}</p>}

      <div className="messages">
        {chat.messages.map((m) => {
          if (m.from === 'system') return <div key={m.id} className="sys">{m.text}</div>
          const mine = m.from === 'me'
          const who = studentById[m.from]
          if (m.kind === 'invite') return <InviteCard key={m.id} m={m} mine={mine} ev={eventById[m.invite.eventId]} onAnswer={(s) => answerInvite(id, m, s)} />
          return (
            <div key={m.id} className={`bubble-row ${mine ? 'mine' : ''}`}>
              {!mine && chat.type === 'group' && <Avatar person={who} size={28} />}
              <div className={`bubble ${mine ? 'bubble-me' : ''}`}>
                {!mine && chat.type === 'group' && <span className="bubble-name">{who.name}</span>}
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

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" aria-label="Message" />
        <button className="send" disabled={!text.trim()} aria-label="Send"><Send size={18} /></button>
      </form>
    </div>
  )
}

function InviteCard({ m, mine, ev, onAnswer }) {
  const { status } = m.invite
  return (
    <div className={`invite ${mine ? 'mine' : ''}`}>
      <span className="invite-label">📍 {mine ? 'You sent a meet-up invite' : 'Meet-up invite'}</span>
      <strong>{ev?.title}</strong>
      <span className="meta"><Clock size={14} /> Meet at {m.invite.time}</span>
      <span className="meta"><MapPin size={14} /> {m.invite.spot}</span>
      {status === 'pending' && !mine && (
        <div className="invite-actions">
          <button className="btn btn-sm btn-outline" onClick={() => onAnswer('declined')}><X size={14} /> Decline</button>
          <button className="btn btn-sm btn-primary" onClick={() => onAnswer('accepted')}><Check size={14} /> Accept</button>
        </div>
      )}
      {status === 'pending' && mine && <span className="status">Waiting for a reply…</span>}
      {status === 'accepted' && <span className="status ok"><Check size={14} /> Plan set: {m.invite.time} · {m.invite.spot}</span>}
      {status === 'declined' && <span className="status">Declined. No worries, you can still go solo.</span>}
    </div>
  )
}
