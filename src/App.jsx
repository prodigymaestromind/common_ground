import { useEffect, useRef, useState } from 'react'
import { Home as HomeIcon, Compass, Plus, CalendarCheck, MessageCircle, MessageSquareHeart, CircleHelp } from 'lucide-react'
import { Logo } from './components'
import { NavCtx } from './nav'
import { APP_VERSION, CREDIT } from './version'
import { StoreProvider, useStore } from './store'
import SignIn, { Welcome } from './screens/Onboarding'
import Home from './screens/Home'
import PlaceMap from './screens/PlaceMap'
import Posted from './screens/Posted'
import { FeedbackNudge, FeedbackSheet } from './screens/Feedback'
import Explore from './screens/Explore'
import EventDetail from './screens/EventDetail'
import WhoIsHere from './screens/WhoIsHere'
import { ChatList, Chat } from './screens/Chats'
import Plans from './screens/Plans'
import Post from './screens/Post'
import Profile from './screens/Profile'
import Help from './screens/Help'

const SCREENS = {
  home: Home, explore: Explore, post: Post, plans: Plans, chats: ChatList,
  event: EventDetail, here: WhoIsHere, chat: Chat, profile: Profile, signin: SignIn, posted: Posted, place: PlaceMap, help: Help,
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
  const Screen = SCREENS[item.name] || Home
  const { then, ...shown } = item.params
  return <Screen {...shown} then={then} />
}

function Shell() {
  const { state, toast, hideToast } = useStore()
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

  // ----- Browser Back button -----
  // Each screen you open adds a step to the browser's history, so the browser's
  // Back button (or the Android back gesture) goes back one screen instead of leaving the app.
  const stackRef = useRef(stack) // same as "stack", but readable right away inside the handlers below
  const depth = useRef(0) // how many screens deep we are (0 = a main tab)
  const moving = useRef(0) // history moves we started ourselves and are still waiting on
  const waiting = useRef(0) // screens opened while a move was still in flight
  const change = (fn) => { stackRef.current = fn(stackRef.current); setStack(stackRef.current) }

  useEffect(() => {
    window.history.replaceState({ depth: 0 }, '')
    const onPop = (e) => {
      if (moving.current > 0) {
        moving.current -= 1
        if (moving.current === 0) {
          for (let i = waiting.current - 1; i >= 0; i--) window.history.pushState({ depth: depth.current - i }, '')
          waiting.current = 0
        }
        return
      }
      const d = e.state?.depth ?? 0
      if (d < depth.current) {
        depth.current = d
        change((s) => s.slice(0, d + 1))
      } else if (d > depth.current) {
        // browser Forward: that screen is gone, so stay where we are
        moving.current += 1
        window.history.go(depth.current - d)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const nav = {
    push: (name, params = {}) => {
      const s = stackRef.current
      // desktop: opening another event replaces the one in the side panel
      const swap = wide && name === 'event' && s.length > 1 && s[s.length - 1].name === 'event'
      if (!swap) {
        depth.current += 1
        if (moving.current > 0) waiting.current += 1
        else window.history.pushState({ depth: depth.current }, '')
      }
      change((x) => (swap ? [...x.slice(0, -1), entry(name, params)] : [...x, entry(name, params)]))
    },
    pop: () => {
      if (stackRef.current.length < 2) return
      if (waiting.current > 0) waiting.current -= 1
      else { moving.current += 1; window.history.back() }
      depth.current -= 1
      change((s) => s.slice(0, -1))
    },
    tab: (name) => {
      const back = depth.current - waiting.current
      waiting.current = 0
      if (back > 0) { moving.current += 1; window.history.go(-back) }
      depth.current = 0
      change(() => [entry(name)])
    },
    feedback: () => setFbOpen(true),
  }

  // Laptop: Esc closes the event side panel (unless a pop-up is open, which Esc closes first)
  useEffect(() => {
    if (!panel) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.querySelector('.sheet-wrap, .spot')) nav.pop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const rootTab = stack[0].name
  const showTabs = wide || stack.length === 1
  const atRoot = stack.length === 1 || (panel && stack.length === 2)
  const unread = Object.values(state.chats).reduce((n, c) => n + (c.unread || 0), 0)

  return (
    <NavCtx.Provider value={nav}>
      <div className={`phone ${wide ? 'is-wide' : ''} ${panel ? 'has-panel' : ''}`}>
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
                <div className="side-links">
                  <button onClick={() => nav.push('help')}><CircleHelp size={18} /> How it works</button>
                  <button onClick={nav.feedback}><MessageSquareHeart size={18} /> Give feedback</button>
                </div>
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
            {atRoot && <FeedbackNudge onOpen={nav.feedback} />}
          </>
        )}
        <FeedbackSheet open={fbOpen} onClose={() => setFbOpen(false)} />
        {toast && (
          <div className="toast" role="status">
            <span>{toast.text}</span>
            {toast.action && <button onClick={() => { toast.action.onClick(); hideToast() }}>{toast.action.label}</button>}
          </div>
        )}
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
