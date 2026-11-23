// The day an event's start or end names, as written in its file: "2026-12-09T18:00:00-08:00" is 9 December. Returned
// as a Date at midnight UTC, so the pages' `timeZone: 'UTC'` formatting prints that day. `new Date(start)` is the
// instant, which in UTC is already 10 December for an evening event in the Americas (footgun 16). Use the instant,
// not this, to decide upcoming or past. @nuxt/content keeps start and end as the text in the file; anything else (a Date)
// would print "Invalid Date" rather than a wrong day
export function eventDay(d: string) {
  return new Date(`${String(d).slice(0, 10)}T00:00:00Z`)
}
