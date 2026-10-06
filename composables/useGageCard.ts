// The home page gage card: which USGS gage to show, and its recent readings from the USGS Water Data API
// (https://api.waterdata.usgs.gov/ogcapi/v0, the newer service; the older waterservices.usgs.gov is being retired).
// Everything here runs in the visitor's browser, after the page loads; each step fails quietly and the next one takes over.
// Where the visitor is: 1. /api/geo (a Netlify edge function) gives a rough position; if there is no answer, or it is not the US,
// 2. the browser's time zone gives a rough position; if that does not map to a US region, 3. there is no position.
// Which gage: A. a gage in flood now (NWS category minor or worse, from /flooding-gages.json, written by scripts/flooding-gages.mjs):
// the most severe one within 500 km of the visitor, else the most severe one in the country; its reading must agree with the NWS
// stage (within 1 ft) or the next candidate is tried; B. otherwise a gage from the hand-picked list near the visitor; C. the default gage.
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
async function lookUpPlace(): Promise<{ lat: number; lon: number } | null> {
  try {
    const cached = sessionStorage.getItem('gage-geo')
    if (cached) return JSON.parse(cached)
  } catch { /* storage may be blocked */ }
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 2500)
    const res = await fetch('/api/geo', { signal: ctl.signal, headers: { accept: 'application/json' } })
    clearTimeout(timer)
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) { try { sessionStorage.setItem('gage-geo', 'null') } catch { /* ignore */ } return null }
    const g = await res.json()
    const place = g?.country === 'US' && typeof g.latitude === 'number' && typeof g.longitude === 'number' ? { lat: g.latitude, lon: g.longitude } : null
    try { sessionStorage.setItem('gage-geo', JSON.stringify(place)) } catch { /* ignore */ }
    return place
  } catch { return null }
}

// where the visitor is, roughly: the edge function, else the time zone, else nobody knows
async function locate(): Promise<{ lat: number; lon: number; how: 'location' | 'timezone' } | null> {
  const place = await lookUpPlace()
  if (place) return { ...place, how: 'location' }
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
}

export async function pickCard(): Promise<Pick> {
  const [place, flooding] = await Promise.all([locate(), fetchFlooding()])
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
  // B and C. a normal gage. With a position: the three nearest gages on the list are read at once and the one that moved most over the
  // last 48 hours is shown (a steady river makes a flat, dull plot); on a tie, the nearest. Without one: the default gage.
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
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 7000)
    const url = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/continuous/items?f=json&parameter_code=${param}&time=PT${WINDOW_HOURS}H&limit=1000&sortby=-time&skipGeometry=true`
      + `&properties=time,value,qualifier,unit_of_measure,approval_status&monitoring_location_id=USGS-${id}`
    const res = await fetch(url, { signal: ctl.signal })
    clearTimeout(timer)
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
