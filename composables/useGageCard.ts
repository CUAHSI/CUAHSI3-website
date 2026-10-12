// The home page gage card: which USGS gage to show, and its recent readings from the USGS Water Data API
// (https://api.waterdata.usgs.gov/ogcapi/v1, the current version; v0 still answers but is not the one USGS documents; the older waterservices.usgs.gov is being retired).
// Everything here runs in the visitor's browser, after the page loads; each step fails quietly and the next one takes over. USGS is asked
// through /api/gage (netlify/edge-functions/gage.ts), which holds the site's API key and caches; see usgsGet.
// Where the visitor is: 1. /api/geo (a Netlify edge function) gives a rough position; if it names a country outside the US the
// visitor gets a famous gage (one of ICONIC_GAGES, at random) instead of a far-off "nearby" one; if there is no answer, or no country,
// 2. the browser's time zone gives a rough position; if that does not map to a US region, 3. there is no position.
// Which gage: A. a gage in flood now (NWS category minor or worse, from /flooding-gages.json, written by scripts/flooding-gages.mjs):
// the most severe one within 500 km of the visitor, else the most severe one in the country; its reading must agree with the NWS
// stage (within 1 ft) or the next candidate is tried; B. otherwise a gage from the hand-picked list near the visitor; C. the default gage.
// A visitor can set their own gage (a USGS number, kept in this browser's localStorage); it replaces everything above until cleared, or until USGS has had no
// reading for it for 5 days (it is probably decommissioned), when the card goes back to the automatic pick.
// If the USGS call itself fails, the card says the reading is unavailable and still links to the gage's USGS page.

export type Gage = { id: string; name: string; state: string; lat: number; lon: number }

// A short, hand-picked list, one or two per region. USGS ids are the monitoring-location numbers (checked 6 Oct 2026: each returned
// a current discharge reading). The first entry is the default.
export const GAGES: Gage[] = [
  { id: '06752260', name: 'Cache la Poudre River at Fort Collins', state: 'CO', lat: 40.59, lon: -105.07 },
  { id: '07010000', name: 'Mississippi River at St. Louis', state: 'MO', lat: 38.63, lon: -90.18 },
  { id: '09380000', name: 'Colorado River at Lees Ferry', state: 'AZ', lat: 36.86, lon: -111.59 },
  { id: '01646500', name: 'Potomac River near Washington (Little Falls)', state: 'DC', lat: 38.95, lon: -77.13 },
  { id: '01358000', name: 'Hudson River at Green Island', state: 'NY', lat: 42.75, lon: -73.69 },
  { id: '14105700', name: 'Columbia River at The Dalles', state: 'OR', lat: 45.61, lon: -121.19 },
  { id: '11447650', name: 'Sacramento River at Freeport', state: 'CA', lat: 38.46, lon: -121.5 },
  { id: '08330000', name: 'Rio Grande at Albuquerque', state: 'NM', lat: 35.09, lon: -106.68 },
  { id: '08096500', name: 'Brazos River at Waco', state: 'TX', lat: 31.54, lon: -97.07 },
  { id: '02336000', name: 'Chattahoochee River at Atlanta', state: 'GA', lat: 33.86, lon: -84.45 },
  { id: '13037500', name: 'Snake River near Heise', state: 'ID', lat: 43.61, lon: -111.66 },
  { id: '05464500', name: 'Cedar River at Cedar Rapids', state: 'IA', lat: 41.97, lon: -91.67 },
  { id: '06892350', name: 'Kansas River at DeSoto', state: 'KS', lat: 38.98, lon: -94.96 },
  { id: '01034500', name: 'Penobscot River at West Enfield', state: 'ME', lat: 45.24, lon: -68.65 },
  { id: '05288500', name: 'Mississippi River at Brooklyn Park', state: 'MN', lat: 45.13, lon: -93.3 },
  { id: '05407000', name: 'Wisconsin River at Muscoda', state: 'WI', lat: 43.2, lon: -90.44 },
  { id: '02323500', name: 'Suwannee River near Wilcox', state: 'FL', lat: 29.59, lon: -82.94 },
  { id: '01463500', name: 'Delaware River at Trenton', state: 'NJ', lat: 40.22, lon: -74.78 },
  { id: '06191500', name: 'Yellowstone River at Corwin Springs', state: 'MT', lat: 45.11, lon: -110.79 },
]
export const DEFAULT_GAGE = GAGES[0]

// A rough centre for the US time zones, used only when the edge function gave no position. Time zones outside this list
// (other countries, Alaska, Hawaii) get the default gage: the list has no gage near them.
const TZ_CENTRES: Record<string, [number, number]> = {
  'America/New_York': [40.7, -74.0], 'America/Detroit': [42.3, -83.0], 'America/Indiana/Indianapolis': [39.8, -86.2],
  'America/Kentucky/Louisville': [38.3, -85.8], 'America/Chicago': [41.9, -87.6], 'America/Indiana/Knox': [41.3, -86.6],
  'America/Menominee': [45.1, -87.6], 'America/Denver': [39.7, -105.0], 'America/Boise': [43.6, -116.2],
  'America/Phoenix': [33.4, -112.1], 'America/Los_Angeles': [34.1, -118.2], 'America/Anchorage': [61.2, -149.9],
  'America/Juneau': [58.3, -134.4], 'Pacific/Honolulu': [21.3, -157.9],
  // older names some browsers still report
  'America/Indianapolis': [39.8, -86.2], 'America/Louisville': [38.3, -85.8], 'US/Eastern': [40.7, -74.0], 'US/Central': [41.9, -87.6],
  'US/Mountain': [39.7, -105.0], 'US/Pacific': [34.1, -118.2], 'US/Arizona': [33.4, -112.1],
}
const NO_GAGE_NEARBY = new Set(['America/Anchorage', 'America/Juneau', 'Pacific/Honolulu'])

function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = (d: number) => d * Math.PI / 180
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLon - aLon) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function nearestGages(lat: number, lon: number, count: number): { gage: Gage; km: number }[] {
  return GAGES.map(g => ({ gage: g, km: distanceKm(lat, lon, g.lat, g.lon) })).sort((a, b) => a.km - b.km).slice(0, count)
}

// A position farther than this from every gage in the list (Alaska, Hawaii, US territories) gets the default gage.
const MAX_KM = 1500

// 1. the edge function. Resolves to null on any failure (no function in local dev, offline, slow, not the US).
// The answer is kept in sessionStorage for 3 hours, then asked for again: a tab left open on another network (home, then a hotel)
// would otherwise keep showing the first position for as long as the tab lives. An entry without a time (an older format) is stale.
const GEO_TTL_MS = 3 * 3600 * 1000
// `abroad` is true when the edge function named a country that is not the US (a gage "near" that visitor would be thousands of km away)
type Place = { lat: number; lon: number } | null
type Where = { place: Place; abroad: boolean }
function saveGeo(w: Where) {
  try { sessionStorage.setItem('gage-geo', JSON.stringify({ t: Date.now(), place: w.place, abroad: w.abroad })) } catch { /* ignore */ }
}
async function lookUpPlace(): Promise<Where> {
  try {
    const c = JSON.parse(sessionStorage.getItem('gage-geo') ?? 'null')
    const age = c && typeof c.t === 'number' ? Date.now() - c.t : -1
    if (age >= 0 && age < GEO_TTL_MS && (c.place === null || (Number.isFinite(c.place?.lat) && Number.isFinite(c.place?.lon)))) return { place: c.place, abroad: c.abroad === true }
  } catch { /* storage may be blocked */ }
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 2500)
    const res = await fetch('/api/geo', { signal: ctl.signal, headers: { accept: 'application/json' } })
    clearTimeout(timer)
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) { saveGeo({ place: null, abroad: false }); return { place: null, abroad: false } }
    const g = await res.json()
    const country = typeof g?.country === 'string' ? g.country.toUpperCase() : ''
    const place = country === 'US' && typeof g.latitude === 'number' && typeof g.longitude === 'number' ? { lat: g.latitude, lon: g.longitude } : null
    const abroad = country !== '' && country !== 'US'
    saveGeo({ place, abroad })
    return { place, abroad }
  } catch { return { place: null, abroad: false } }
}

// where the visitor is, roughly: the edge function, else the time zone, else nobody knows
async function locate(): Promise<{ lat: number; lon: number; how: 'location' | 'timezone' } | { abroad: true } | null> {
  const { place, abroad } = await lookUpPlace()
  if (place) return { ...place, how: 'location' }
  if (abroad) return { abroad: true } // outside the US: no time-zone guess either
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const c = TZ_CENTRES[tz]
    if (c && !NO_GAGE_NEARBY.has(tz)) return { lat: c[0], lon: c[1], how: 'timezone' }
  } catch { /* no Intl */ }
  return null
}

export type FloodGage = { usgsId: string; lid: string; name: string; state: string | null; lat: number; lon: number; category: 'minor' | 'moderate' | 'major'; stage: number; stageUnit: string; time: string; minorStage?: number | null }
const SEVERITY = { minor: 1, moderate: 2, major: 3 } as const
const SNAPSHOT_MAX_AGE_MS = 12 * 3600 * 1000

// the NWS flood snapshot; null if the file is missing, unreadable or more than 12 hours old (then the card shows a normal gage)
async function fetchFlooding(): Promise<FloodGage[]> {
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 4000)
    const res = await fetch('/flooding-gages.json', { signal: ctl.signal })
    clearTimeout(timer)
    // no content-type check: GitHub serves .json files as text/plain, and Netlify passes that through on a rewrite
    if (!res.ok) return []
    const body = await res.json()
    if (!Array.isArray(body?.gages) || !(Date.now() - Date.parse(body.generated) <= SNAPSHOT_MAX_AGE_MS)) return []
    return body.gages.filter((g: any) => g && g.usgsId && Object.hasOwn(SEVERITY, g.category) && /^\d{8,15}$/.test(String(g.usgsId)) && Number.isFinite(g.stage) && Number.isFinite(g.lat) && Number.isFinite(g.lon))
  } catch { return [] }
}

export type Pick = {
  gage: { id: string; name: string; state: string }
  how: 'location' | 'timezone' | 'default'
  km: number | null
  reading: Reading | null
  byActivity: boolean // chosen because it moved more than a nearer gage
  flood: { category: FloodGage['category']; time: string; where: 'near' | 'national' } | null
  preferred?: boolean // the visitor's own gage
  iconic?: boolean // a famous gage, shown to a visitor outside the US
}

// The visitor's own gage. Stored in localStorage (this browser only, no expiry) as { id, name, state }.
export type Preferred = { id: string; name: string; state: string }
const PREFERRED_KEY = 'preferred-gage'
export function getPreferred(): Preferred | null {
  try {
    const p = JSON.parse(localStorage.getItem(PREFERRED_KEY) ?? 'null')
    if (p && /^\d{8,15}$/.test(String(p.id)) && typeof p.name === 'string' && typeof p.state === 'string') return { id: String(p.id), name: p.name, state: p.state }
  } catch { /* storage may be blocked */ }
  return null
}
// false when the browser would not keep it (private mode, blocked or full storage)
export function setPreferred(p: Preferred): boolean {
  try { localStorage.setItem(PREFERRED_KEY, JSON.stringify(p)); return getPreferred()?.id === p.id } catch { return false }
}
export function clearPreferred() { try { localStorage.removeItem(PREFERRED_KEY) } catch { /* ignore */ } }

// Every USGS request goes through usgsGet: our own /api/gage first (netlify/edge-functions/gage.ts: it adds the site's API key on the
// server and the CDN caches the answer), then USGS itself, with no key, when that function is not there (local development), cannot
// be reached or fails with a 5xx. A 400 or 404 from the function is a real answer (an unknown gage) and is returned as it is. The
// function fixes the 48-hour window; the direct address below must ask for the same one (WINDOW_HOURS).
const USGS = 'https://api.waterdata.usgs.gov/ogcapi/v1'
type Ask = { kind: 'readings'; id: string; param: '00060' | '00065' } | { kind: 'name'; id: string } | { kind: 'recent'; id: string; param: '00060' | '00065'; days: number }
function directUrl(a: Ask): string {
  const loc = `monitoring_location_id=USGS-${a.id}`
  if (a.kind === 'name') return `${USGS}/collections/monitoring-locations/items/USGS-${a.id}?f=json&properties=monitoring_location_name`
  const base = `${USGS}/collections/continuous/items?f=json&parameter_code=${a.param}&sortby=-time&skipGeometry=true`
  if (a.kind === 'recent') return `${base}&time=P${a.days}D&limit=1&properties=time&${loc}`
  return `${base}&time=PT${WINDOW_HOURS}H&limit=1000&properties=time,value,qualifier,unit_of_measure,approval_status&${loc}`
}
async function usgsGet(a: Ask, ms = 7000): Promise<Response> {
  // the gage and the question are in the path (see gage.ts: the CDN ignores a query string)
  const path = [a.kind, a.id, ...('param' in a ? [a.param] : []), ...('days' in a ? [String(a.days)] : [])].join('/')
  try {
    const res = await fetch(`/api/gage/${path}`, { signal: timeoutSignal(Math.min(ms, 6000)) })
    if (res.headers.get('x-gage-proxy') && res.status < 500) return res
  } catch { /* no function here, or too slow: ask USGS directly */ }
  return fetch(directUrl(a), { signal: timeoutSignal(ms) })
}
// (AbortSignal.timeout is newer than some browsers still in use)
function timeoutSignal(ms: number): AbortSignal {
  const ctl = new AbortController()
  setTimeout(() => ctl.abort(), ms)
  return ctl.signal
}

// the reading for a chosen gage: discharge, else gage height (some gages report only one)
const readingFor = async (id: string) => (await fetchReading(id, '00060')) ?? (await fetchReading(id, '00065'))

// Has USGS had any flow or stage reading for this gage in the last `days` days? null when USGS could not be asked (then nothing is decided).
const DECOMMISSIONED_AFTER_DAYS = 5
async function hasDataWithin(id: string, days: number): Promise<boolean | null> {
  try {
    const asks = await Promise.all((['00060', '00065'] as const).map(async param => {
      const res = await usgsGet({ kind: 'recent', id, param, days })
      if (!res.ok) throw new Error('no answer')
      return ((await res.json()).features ?? []).length > 0
    }))
    return asks.some(Boolean)
  } catch { return null }
}

// USGS names are in capitals ("WISCONSIN RIVER AT MUSCODA, WI"); the state is the last two letters after a comma
const SMALL = new Set(['at', 'near', 'below', 'above', 'of', 'the', 'and', 'in', 'on', 'to', 'from', 'nr', 'bl', 'ab'])
function tidyName(raw: string): { name: string; state: string } {
  const m = raw.match(/,\s*([A-Z]{2})$/)
  const base = (m ? raw.slice(0, m.index) : raw).toLowerCase().split(' ').map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ').replace(/, ([A-Z][a-z])\b/g, (_, st) => `, ${st.toUpperCase()}`)
  return { name: base, state: m ? m[1] : '' }
}

// Checks a number the visitor typed: the gage must exist at USGS and have a recent reading. Resolves to the gage and its
// reading, or a sentence for the visitor.
export async function lookUpGage(id: string): Promise<{ gage: Preferred; reading: Reading } | string> {
  let raw: string | null = null
  try {
    const res = await usgsGet({ kind: 'name', id })
    if (res.ok) raw = (await res.json())?.properties?.monitoring_location_name ?? null
    else if (res.status !== 404) return 'USGS did not answer. Try again in a moment.'
  } catch { return 'USGS did not answer. Try again in a moment.' }
  if (!raw) return `USGS has no gage with the number ${id}.`
  const reading = await readingFor(id)
  if (!reading) return 'No recent flow or stage reading came back for that gage. If the number is right, try again in a moment.'
  return { gage: { id, ...tidyName(raw) }, reading }
}

// Shown to a visitor outside the US: a gage near them would be a long way off, so the card shows a famous river instead, one picked
// at random on each page load. All are on the list above (each had a current discharge reading on 11 Oct 2026).
const ICONIC_IDS = ['07010000', '09380000', '14105700', '01646500', '01358000', '08330000', '13037500', '06191500', '11447650']
// Mississippi at St. Louis, Colorado at Lees Ferry, Columbia at The Dalles, Potomac at Little Falls, Hudson at Green Island,
// Rio Grande at Albuquerque, Snake near Heise, Yellowstone at Corwin Springs, Sacramento at Freeport
export const ICONIC_GAGES = GAGES.filter(g => ICONIC_IDS.includes(g.id))

export async function pickCard(): Promise<Pick> {
  const mine = getPreferred()
  if (mine) {
    const reading = await readingFor(mine.id)
    // no reading: the card says "Reading unavailable" and keeps the gage, unless USGS has had nothing for it in 5 days
    // (probably decommissioned): then it is forgotten and the automatic pick below is used
    if (reading || (await hasDataWithin(mine.id, DECOMMISSIONED_AFTER_DAYS)) !== false) return { gage: mine, how: 'default', km: null, reading, byActivity: false, flood: null, preferred: true }
    if (getPreferred()?.id === mine.id) clearPreferred() // not a gage the visitor saved meanwhile
  }
  const [located, flooding] = await Promise.all([locate(), fetchFlooding()])
  const abroad = !!located && 'abroad' in located
  const place = located && !('abroad' in located) ? located : null
  // A. a gage in flood. Near the visitor (within 500 km) any category counts; a gage far away only if it is a moderate or major flood,
  // so a small flood on the other side of the country does not push the near-you gage off the card.
  if (flooding.length) {
    const near = place ? flooding.filter(g => distanceKm(place.lat, place.lon, g.lat, g.lon) <= 500) : []
    const pool = near.length ? near : flooding.filter(g => g.category !== 'minor')
    const dist = (g: FloodGage) => (place ? distanceKm(place.lat, place.lon, g.lat, g.lon) : 0)
    const ordered = [...pool].sort((a, b) => SEVERITY[b.category] - SEVERITY[a.category] || dist(a) - dist(b)).slice(0, 3)
    // check the top three against USGS at once (one wait, not three): USGS's own stage must agree with NWS's (a different datum or a stale
    // value would not), and must still be at or above flood stage (the category can be hours old); the first in order that passes wins
    const readings = await Promise.all(ordered.map(g => fetchReading(g.usgsId, '00065')))
    for (let k = 0; k < ordered.length; k++) {
      const g = ordered[k], r = readings[k]
      const stillFlooding = !Number.isFinite(g.minorStage) || !g.minorStage || (r !== null && r.value >= g.minorStage - 0.1)
      if (r && /^ft/i.test(r.unit) && Math.abs(r.value - g.stage) <= 1 && stillFlooding) {
        const km = place ? distanceKm(place.lat, place.lon, g.lat, g.lon) : null
        return { gage: { id: g.usgsId, name: g.name, state: g.state ?? '' }, how: place ? place.how : 'default', km, reading: r, byActivity: false, flood: { category: g.category, time: g.time, where: near.includes(g) ? 'near' : 'national' } }
      }
    }
  }
  // B and C. a normal gage (a visitor outside the US gets the famous one). With a position: the three nearest gages on the list are read at once and the one that moved most over the
  // last 48 hours is shown (a steady river makes a flat, dull plot); on a tie, the nearest. Without one: the default gage.
  if (abroad) {
    const gage = ICONIC_GAGES[Math.floor(Math.random() * ICONIC_GAGES.length)]
    return { gage, how: 'default', km: null, reading: await fetchReading(gage.id, '00060'), byActivity: false, flood: null, iconic: true }
  }
  const cands = place ? nearestGages(place.lat, place.lon, 3).filter(c => c.km <= ACTIVE_RADIUS_KM) : []
  if (!cands.length) return { gage: DEFAULT_GAGE, how: 'default', km: null, reading: await fetchReading(DEFAULT_GAGE.id, '00060'), byActivity: false, flood: null }
  const reads = await Promise.all(cands.map(c => fetchReading(c.gage.id, '00060')))
  // the nearest gage unless a farther one moved clearly more; among the farther ones the most active wins
  let best = 0
  for (let k = 1; k < cands.length; k++) {
    const bar = best === 0 ? (reads[0]?.spread ?? -1) + ACTIVE_MARGIN : (reads[best]?.spread ?? -1)
    if ((reads[k]?.spread ?? -1) > bar) best = k
  }
  return { gage: cands[best].gage, how: place!.how, km: cands[best].km, reading: reads[best], byActivity: best > 0, flood: null }
}

export type Reading = {
  value: number; unit: string; time: Date; bars: number[]; low: number; high: number; provisional: boolean; spread: number
}
export const monitoringUrl = (id: string) => `https://waterdata.usgs.gov/monitoring-location/USGS-${id}/`

// 2. the last 48 hours of discharge (parameter 00060, or gage height 00065) from the USGS Water Data API (about 6 KB a gage). Readings
// with a qualifier (ice, equipment malfunction, and so on), missing values and negative values are dropped. The bars are the mean of
// each 2-hour block, 24 of them, newest last. `spread` says how much the series moved (its highest block mean less its lowest, as a share
// of the highest), so the card can prefer a gage that is doing something over one that is flat. The request is sorted newest first, so
// if a gage reports so often that the 1000-reading limit is hit, it is the oldest readings that are cut, never the latest.
const ACTIVE_RADIUS_KM = 800 // the "most active" choice looks only this far
const ACTIVE_MARGIN = 0.1 // and a farther gage must be this much more active (share of its own highest value) than the nearest
export const WINDOW_HOURS = 48
const BARS = 24
export async function fetchReading(id: string, param: '00060' | '00065' = '00060'): Promise<Reading | null> {
  const key = `gage48-${id}-${param}`
  try {
    const c = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (c && Date.now() - c.t < 10 * 60 * 1000) return { ...c.r, time: new Date(c.r.time) }
  } catch { /* ignore */ }
  try {
    const res = await usgsGet({ kind: 'readings', id, param })
    if (!res.ok) return null
    const body = await res.json()
    const pts = (body.features ?? [])
      .map((f: any) => f.properties)
      .filter((p: any) => p && !(Array.isArray(p.qualifier) ? p.qualifier.length : p.qualifier) && p.value !== null && p.value !== '' && Number.isFinite(Number(p.value)) && Number(p.value) >= 0)
      .map((p: any) => ({ t: new Date(p.time).getTime(), v: Number(p.value), unit: p.unit_of_measure as string, prov: /provisional/i.test(p.approval_status ?? '') }))
      .filter((p: any) => Number.isFinite(p.t))
      .sort((a: any, b: any) => a.t - b.t)
    if (!pts.length) return null
    const last = pts[pts.length - 1]
    const end = last.t
    const blocks = Array.from({ length: BARS }, () => [] as number[])
    for (const p of pts) {
      const ago = end - p.t
      const i = BARS - 1 - Math.min(BARS - 1, Math.floor(ago / (2 * 3600 * 1000)))
      blocks[i].push(p.v)
    }
    const means = blocks.map(b => (b.length ? b.reduce((s, x) => s + x, 0) / b.length : null))
    const present = means.filter((m): m is number => m !== null)
    const lo = Math.min(...present), hi = Math.max(...present)
    // bar heights 18% to 100% of the range. A series that varies by less than 2% (0.15 ft for a stage) shows level bars (so a steady river does not look
    // like a swing); a block with no readings shows a thin stub.
    const flat = param === '00065' ? hi - lo < 0.15 : hi === 0 || (hi - lo) / hi < 0.02
    const bars = means.map(m => (m === null ? 6 : flat ? 55 : 18 + 82 * (m - lo) / (hi - lo)))
    const r: Reading = { value: last.v, unit: last.unit, time: new Date(last.t), bars, low: Math.min(...pts.map((p: any) => p.v)), high: Math.max(...pts.map((p: any) => p.v)), provisional: last.prov, spread: hi > 0 ? (hi - lo) / hi : 0 }
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), r })) } catch { /* ignore */ }
    return r
  } catch { return null }
}

export function formatFlow(v: number) {
  if (v > 0 && v < 0.05) return '<0.1'
  const tenth = Math.round(v * 10) / 10
  if (tenth < 10) return tenth.toFixed(1)
  return Math.round(v).toLocaleString('en-US')
}
// a river stage is shown to a tenth of a foot; a flow keeps formatFlow's rounding
export const formatReading = (v: number, unit?: string) => (unit && /^ft$/i.test(unit) ? v.toFixed(1) : formatFlow(v))
export const unitLabel = (u?: string) => (!u ? 'cfs' : /ft\^?3\/s/i.test(u) ? 'cfs' : u)
