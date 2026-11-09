# Common Ground

**Campus events. People to go with.** Built for Capital Hacks 5.0 at Sacramento State.

Live demo: https://prodigymaestromind.github.io/common_ground/ (works best on a phone)

## The problem
Our interviews with Sac State students turned up three things:
1. **Event info is scattered** across Instagram, emails, posters, and friends.
2. **Finding an event isn't the same as going.** Class, work, commuting, cost, and parking get in the way.
3. **Walking in alone is the hardest part.** Everyone else seems to arrive in groups.

## What Common Ground does
- **Real Sac State events:** pulled from the public Sac State Events calendar (events.csus.edu), each linked to its official page. Today's events stay listed until midnight, even after they end.
- **Happening now first:** if nothing is live, the Now tab is simply empty.
- **Fits my day:** add your class/work blocks once, and every event shows ✓ fits or ⚠ conflicts.
- **Map, directions, calendar:** tap an event's location to see it on the campus map, open Apple/Google Maps, or add it to your calendar.
- **Go with someone:** turn on "open to company" at an event to see others who did too, then say hi or send a meet-up invite.
- **Solo group chat:** at a live event, join a chat of people who also came alone.
- **Stay in touch:** swap Instagram/Discord/Snapchat, shared only if both people say yes.
- **Scan a flyer:** organizers can snap a poster and OCR fills in the event form.
- **Built to put the phone down:** the feed ends. No likes, followers, or infinite scroll.

## What's real vs. preview (honest status)
- ✅ Events, times, places and links are real (snapshot of the Sac State calendar, Nov 2026).
- 🧪 There's no backend yet. Accounts, RSVPs, chats and posts are saved only in your browser.
- 🧪 The students you can meet are **sample students**, and their chat replies, invite answers and "stay in touch" answers are automatic.
- 🧪 Sign-in only checks that the email ends in @csus.edu (no email verification yet). To try it: your first name + **test@csus.edu**.
- Next step: Supabase for real accounts, chat and invites.

## Run locally
```
npm install
npm run dev
```

## Data
Events come from the public **Sac State Events** calendar (events.csus.edu, Trumba iCalendar export, Nov 2026), and each one links back to its official page. The students shown are sample data.
