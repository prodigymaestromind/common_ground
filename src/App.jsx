import { useEffect, useRef, useState } from 'react'
import { Home as HomeIcon, Compass, Plus, CalendarCheck, MessageCircle } from 'lucide-react'
import { NavCtx } from './components'
import { StoreProvider, useStore } from './store'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Explore from './screens/Explore'
import EventDetail from './screens/EventDetail'
import WhoIsHere from './screens/WhoIsHere'
import { ChatList, Chat } from './screens/Chats'
import Plans from './screens/Plans'
import Post from './screens/Post'
import Profile from './screens/Profile'

const SCREENS = {
  home: Home, explore: Explore, post: Post, plans: Plans, chats: ChatList,
  event: EventDetail, here: WhoIsHere, chat: Chat, profile: Profile,
}

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'explore', label: 'Explore', Icon: Compass },
  { id: 'post', label: 'Post', Icon: Plus, center: true },
  { id: 'plans', label: 'Plans', Icon: CalendarCheck },
  { id: 'chats', label: 'Chats', Icon: MessageCircle },
]

function Shell() {
  const { state, toast } = useStore()
  const [stack, setStack] = useState([{ name: 'home', params: {} }])
  const scroller = useRef(null)
  const top = stack[stack.length - 1]

  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [stack.length, top.name])

  const nav = {
    push: (name, params = {}) => setStack((s) => [...s, { name, params }]),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    tab: (name) => setStack([{ name, params: {} }]),
  }

  if (!state.user) return <div className="phone"><Onboarding /></div>

  const Screen = SCREENS[top.name] || Home
  const rootTab = stack[0].name
  const showTabs = stack.length === 1
  const unread = Object.values(state.chats).reduce((n, c) => n + (c.unread || 0), 0)

  return (
    <NavCtx.Provider value={nav}>
      <div className="phone">
        <main ref={scroller} className={`scroll ${showTabs ? 'with-tabs' : ''}`}>
          <Screen key={stack.length + top.name + JSON.stringify(top.params)} {...top.params} />
        </main>
        {showTabs && (
          <nav className="tabbar" aria-label="Main">
            {TABS.map(({ id, label, Icon, center }) => (
              <button key={id} className={`tab ${rootTab === id ? 'on' : ''} ${center ? 'tab-center' : ''}`} onClick={() => nav.tab(id)} aria-label={label}>
                <span className="tab-icon"><Icon size={center ? 26 : 22} />{id === 'chats' && unread > 0 && <span className="dot">{unread}</span>}</span>
                {!center && <span>{label}</span>}
              </button>
            ))}
          </nav>
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </NavCtx.Provider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
