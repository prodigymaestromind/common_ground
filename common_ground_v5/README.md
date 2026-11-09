# Common Ground

**Campus events. People to go with.** Built for Capital Hacks 5.0 at Sacramento State.

Live demo: https://prodigymaestromind.github.io/common_ground/ (works best on a phone)

## The problem
Our interviews with Sac State students turned up three things:
1. **Event info is scattered** across Instagram, emails, posters, and friends.
2. **Finding an event isn't the same as going.** Class, work, commuting, cost, and parking get in the way.
3. **Walking in alone is the hardest part.** Everyone else seems to arrive in groups.

## What Common Ground does
- **Happening now first:** the home screen opens on what's live and later today.
- **Fits my day:** add your class/work blocks once, and every event shows ✓ fits or ⚠ conflicts.
- **Go with someone:** at any event, turn on "open to company" and see others who did too. Say hi with suggested conversation starters, or send a meet-up invite (time + public spot).
- **Solo crew:** at a live event, join a group chat of people who also came alone.
- **Scan a flyer:** snap a campus poster and OCR fills in the event form.
- **Stay in touch:** contact is only shared if *both* people say yes.
- **Built to put the phone down:** the feed ends ("You're all caught up"). No likes, followers, or infinite scroll.

## Privacy by design
First names + interests only. "Open to company" is off by default and works both ways. Location is never shared. Block & report from any chat. Verified @csus.edu emails only.

## Tech
React + Vite, deployed to GitHub Pages with GitHub Actions. Flyer OCR runs in the browser with Tesseract.js. Demo data is stored locally in the browser. Event sources are modeled on the public Sac State Events (Trumba) calendar.

## Run locally
```
npm install
npm run dev
```
