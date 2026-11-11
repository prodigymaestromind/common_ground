// How it works: a short guide to the app, always one tap away.
import { MessageSquareHeart, RotateCcw } from 'lucide-react'
import { TopBar } from '../components'
import { useNav } from '../nav'
import { useStore } from '../store'
import { TIPS } from '../tips'
import { EVENTS_UPDATED } from '../realEvents'
import { APP_VERSION, CREDIT } from '../version'
import { fullDate } from '../utils'

const BASICS = [
  { icon: '🏠', title: 'Home', text: 'What\'s on right now, today and this week. Signed in? Turn on “For you” to only see events that match your interests.' },
  { icon: '🧭', title: 'Explore', text: 'Every upcoming event. Search, filter (free, fits my day, welcomes solo) or switch to the campus map.' },
  { icon: '🔖', title: 'Save or “I\'m going”', text: 'Tap the bookmark to save an event for later, or “I\'m going” to plan on it. Both show up in Plans.' },
  { icon: '✓', title: 'Fits my day', text: 'Add your class and work times in your profile, and each event shows whether it fits. Your times are never shown to anyone.' },
  { icon: '📣', title: 'Post an event', text: 'For clubs, ASI and departments. Sign in as an organizer, then add a photo or flyer and the details.' },
]

export default function Help() {
  const nav = useNav()
  const { dispatch, showToast } = useStore()
  return (
    <div className="screen help">
      <TopBar title="How it works" />
      <p className="muted">Common Ground puts Sac State events in one place and helps you find someone to go with.</p>

      <h2 className="section-title">The basics</h2>
      <div className="stack-sm">
        {BASICS.map((b) => (
          <div key={b.title} className="card help-row"><span className="help-icon">{b.icon}</span><div><strong>{b.title}</strong><p>{b.text}</p></div></div>
        ))}
      </div>

      <h2 className="section-title">Meeting people</h2>
      <div className="stack-sm">
        {Object.entries(TIPS).map(([key, t]) => (
          <div key={key} className="card help-row"><span className="help-icon">{t.icon}</span><div><strong>{t.title}</strong>{t.lines.map((l) => <p key={l}>{l}</p>)}</div></div>
        ))}
      </div>

      <h2 className="section-title">What's real and what's a demo</h2>
      <ul className="privacy">
        <li><b>Real:</b> the events. They come from the Sac State events calendar, last updated {fullDate(`${EVENTS_UPDATED}T12:00:00`)}.</li>
        <li><b>Demo:</b> the people, “going” counts and chat replies are samples, marked with a Demo tag.</li>
        <li>Everything you do stays on this device. Nothing is sent anywhere yet.</li>
      </ul>

      <button className="btn btn-outline" onClick={() => { dispatch({ type: 'TIPS_RESET' }); showToast('Tips are back on. They show the first time you use each feature.') }}><RotateCcw size={16} /> Show the tips again</button>
      <button className="btn btn-outline" onClick={nav.feedback}><MessageSquareHeart size={16} /> Give feedback</button>
      <p className="version-tag">Common Ground v{APP_VERSION} · {CREDIT}</p>
    </div>
  )
}
