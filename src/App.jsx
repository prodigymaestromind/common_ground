import { useEffect, useRef, useState } from 'react'
import { Home as HomeIcon, Compass, Plus, CalendarCheck, MessageCircle } from 'lucide-react'
import { NavCtx, Logo } from './components'
import { APP_VERSION, CREDIT } from './version'
import { StoreProvider, useStore } from './store'
import SignIn, { Welcome } from './screens/Onboarding'
import HomeBoard from './screens/HomeBoard'
import PlaceMap from './screens/PlaceMap'
import Posted from './screens/Posted'
import { FeedbackButton, FeedbackNudge, FeedbackSheet } from './screens/Feedback'
import Explore from './screens/Explore'
import EventDetail from './screens/EventDetail'
import WhoIsHere from './screens/WhoIsHere'
import { ChatList, Chat } from './screens/Chats'
import Plans from './screens/Plans'
import Post from './screens/Post'
import Profile from './screens/Profile'

const SCREENS = {
  home: HomeBoard, explore: Explore, post: Post, plans: Plans, chats: ChatList,
  event: EventDetail, here: WhoIsHere, chat: Chat, profile: Profile, signin: SignIn, posted: Posted, place: PlaceMap,
}

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'explore', label: 'Explore', Icon: Compass },
  { id: 'post', label: 'Post', Icon: Plus, center: true },
  { id: 'plans', label: 'Plans', Icon: CalendarCheck },
  { id: 'chats', label: 'Chats', Icon: MessageCircle },
]

// true on laptops/desktops (sidebar + side panel layout)
function useWide(min = 1024) {
  const q = `(min-width: ${min}px)`
  const [wide, setWide] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [q])
  return wide
}

let nextId = 1
const entry = (name, params = {}) => ({ id: nextId++, name, params })

function ScreenFor({ item }) {
  const Screen = SCREENS[item.name] || HomeBoard
  const { then, ...shown } = item.params
  return <Screen {...shown} then={then} />
}

function Shell() {
  const { state, toast } = useStore()
  const [stack, setStack] = useState(() => [entry('home')])
  const [fbOpen, setFbOpen] = useState(false)
  const scroller = useRef(null)
  const wide = useWide()
  const top = stack[stack.length - 1]

  // Desktop: an event opens in a side panel next to the screen you came from
  const panel = wide && stack.length > 1 && top.name === 'event' ? top : null
  const mainItem = panel ? stack[stack.length - 2] : top

  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [mainItem.id])

  const nav = {
    push: (name, params = {}) => setStack((s) => {
      // desktop: opening another event replaces the one in the side panel
      if (wide && name === 'event' && s.length > 1 && s[s.length - 1].name === 'event') return [...s.slice(0, -1), entry(name, params)]
      return [...s, entry(name, params)]
    }),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    tab: (name) => setStack([entry(name)]),
  }

  const rootTab = stack[0].name
  const showTabs = wide || stack.length === 1
  const atRoot = stack.length === 1 || (panel && stack.length === 2)
  const unread = Object.values(state.chats).reduce((n, c) => n + (c.unread || 0), 0)

  return (
    <NavCtx.Provider value={nav}>
      <div className={`phone style-board ${wide ? 'is-wide' : ''} ${panel ? 'has-panel' : ''}`}>
        {!state.welcomed ? <Welcome /> : (
          <>
            {showTabs && (
              <nav className="tabbar" aria-label="Main">
                <div className="side-logo"><Logo /></div>
                {TABS.map(({ id, label, Icon, center }) => (
                  <button key={id} className={`tab ${rootTab === id ? 'on' : ''} ${center ? 'tab-center' : ''}`} onClick={() => nav.tab(id)} aria-label={label}>
                    <span className="tab-icon"><Icon size={center ? 26 : 22} />{id === 'chats' && unread > 0 && <span className="dot">{unread}</span>}</span>
                    <span className="tab-label">{center ? 'Post an event' : label}</span>
                  </button>
                ))}
                <div className="side-foot">
                  <span>Common Ground v{APP_VERSION}</span>
                  <span>{CREDIT}</span>
                </div>
              </nav>
            )}
            <main ref={scroller} className={`scroll ${showTabs ? 'with-tabs' : ''}`}>
              <ScreenFor key={mainItem.id} item={mainItem} />
            </main>
            {panel && (
              <aside className="side-panel" aria-label="Event details">
                <ScreenFor key={panel.id} item={panel} />
              </aside>
            )}
            {atRoot && <FeedbackButton onOpen={() => setFbOpen(true)} />}
            {atRoot && <FeedbackNudge onOpen={() => setFbOpen(true)} />}
          </>
        )}
        <FeedbackSheet open={fbOpen} onClose={() => setFbOpen(false)} />
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
