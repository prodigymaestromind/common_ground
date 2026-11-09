// Small shared hooks.
import { useEffect, useState } from 'react'
import { useNav } from './nav'
import { useStore } from './store'
import { Spotlight } from './components'

// Sign in only when needed: gate(role, then, reason) runs `then` right away if signed in,
// otherwise opens the sign-in screen first.
export function useGate() {
  const nav = useNav()
  const { state } = useStore()
  return (role, then, reason) => {
    if (state.user) return then?.()
    nav.push('signin', { role, reason, then })
  }
}

// One-time explainer pop-ups (see tips.js).
// const [explain, popup] = useExplain()
// explain('group', () => doTheThing(), clickEvent)  -> shows the tip once, then runs the action.
// Render {popup} somewhere in the screen.
export function useExplain() {
  const { state } = useStore()
  const [open, setOpen] = useState(null) // { key, then, el }
  const explain = (key, then, target) => {
    if (state.tips?.[key]) return then?.()
    const el = target?.currentTarget || target?.target || target || null
    setOpen({ key, then, el: el instanceof Element ? el : null })
  }
  const popup = open ? <Spotlight tipKey={open.key} el={open.el} onDone={() => { const f = open.then; setOpen(null); f?.() }} /> : null
  return [explain, popup]
}

// The current time, refreshed every minute, so "Happening now" and "Ended"
// update on their own without a page refresh.
export function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])
  return now
}
