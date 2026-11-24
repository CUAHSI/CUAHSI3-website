// "Eastern Time" for America/New_York; an abbreviation such as ET is shown as written
export function eventZone(start: string, timezone: string) {
  if (!timezone.includes('/')) return timezone
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longGeneric' })
    .formatToParts(new Date(start)).find(p => p.type === 'timeZoneName')?.value ?? timezone
}

// The event's time, in its own time zone: "12:00 – 1:30 pm Eastern Time". Only for a start with a time, a timezone in the
// America/New_York form (an abbreviation names no zone to convert to) and an end on the same day, or none (an end with
// no time shows the start time alone). Built from the parts, not format() or formatRange(): Node and the browser put
// different spaces around "PM" and the dash, and the page then fails to hydrate
export function eventTime(start: unknown, end: unknown, timezone: string | null | undefined) {
  if (!timezone?.includes('/') || typeof start !== 'string' || !start.includes('T')) return null
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  const parts = (d: string) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(d)).map(x => [x.type, x.value]))
    return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, period: (p.dayPeriod ?? '').toLowerCase() }
  }
  const s = parts(start)
  const zone = eventZone(start, timezone)
  if (typeof end !== 'string' || !end.includes('T')) return `${s.time} ${s.period} ${zone}`
  const e = parts(end)
  if (s.day !== e.day) return null
  return `${s.time}${s.period === e.period ? '' : ` ${s.period}`} – ${e.time} ${e.period} ${zone}`
}
