# events-feed

Put the downloaded Sac State calendar files (`.ics`) here, then run `npm run events`.

Each file holds at most 200 events (about two weeks), so download a few, one week apart.
Open these in a browser, changing the dates to today + 1, 2 and 3 weeks (format: YYYYMMDD):

```
https://www.trumba.com/calendars/sacramento-state-events.ics
https://www.trumba.com/calendars/sacramento-state-events.ics?startdate=20261123
https://www.trumba.com/calendars/sacramento-state-events.ics?startdate=20261130
https://www.trumba.com/calendars/sacramento-state-events.ics?startdate=20261207
```

The `.ics` files are not saved in git. The script turns them into `src/realEvents.js`, which is.
The rules for what is kept or left out are at the top of `scripts/update-events.mjs`.
