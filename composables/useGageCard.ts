// The home page gage card: which USGS gage to show, and its recent readings from the USGS Water Data API
// (https://api.waterdata.usgs.gov/ogcapi/v0, the newer service; the older waterservices.usgs.gov is being retired).
// Everything here runs in the visitor's browser, after the page loads; each step fails quietly and the next one takes over:
//   1. /api/geo (a Netlify edge function) says roughly where the visitor is; if there is no answer, or it is not the US,
//   2. the browser's time zone gives a rough position; if that does not map to a US region,
//   3. the default gage is shown.
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

export function nearestGage(lat: number, lon: number): { gage: Gage; km: number } {
  let best = { gage: DEFAULT_GAGE, km: Infinity }
  for (const g of GAGES) {
    const km = distanceKm(lat, lon, g.lat, g.lon)
    if (km < best.km) best = { gage: g, km }
  }
  return best
}

export type Pick = { gage: Gage; how: 'location' | 'timezone' | 'default'; km: number | null }
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

export async function pickGage(): Promise<Pick> {
  const place = await lookUpPlace()
  if (place) { const n = nearestGage(place.lat, place.lon); if (n.km <= MAX_KM) return { gage: n.gage, how: 'location', km: n.km } }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const c = TZ_CENTRES[tz]
    if (c && !NO_GAGE_NEARBY.has(tz)) { const n = nearestGage(c[0], c[1]); return { gage: n.gage, how: 'timezone', km: n.km } }
  } catch { /* no Intl */ }
  return { gage: DEFAULT_GAGE, how: 'default', km: null }
}

export type Reading = {
  value: number; unit: string; time: Date; bars: number[]; low: number; high: number; provisional: boolean
}
export const monitoringUrl = (id: string) => `https://waterdata.usgs.gov/monitoring-location/USGS-${id}/`

// 2. the last 24 hours of discharge (parameter 00060) from the USGS Water Data API. Readings with a qualifier (ice, equipment
// malfunction, and so on), missing values and negative values are dropped. The bars are the mean of each 2-hour block, newest last.
export async function fetchReading(id: string): Promise<Reading | null> {
  const key = `gage-${id}`
  try {
    const c = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (c && Date.now() - c.t < 10 * 60 * 1000) return { ...c.r, time: new Date(c.r.time) }
  } catch { /* ignore */ }
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 7000)
    const url = 'https://api.waterdata.usgs.gov/ogcapi/v0/collections/continuous/items?f=json&parameter_code=00060&time=PT24H&limit=500&skipGeometry=true'
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
    const blocks = Array.from({ length: 12 }, () => [] as number[])
    for (const p of pts) {
      const ago = end - p.t
      const i = 11 - Math.min(11, Math.floor(ago / (2 * 3600 * 1000)))
      blocks[i].push(p.v)
    }
    const means = blocks.map(b => (b.length ? b.reduce((s, x) => s + x, 0) / b.length : null))
    const present = means.filter((m): m is number => m !== null)
    const lo = Math.min(...present), hi = Math.max(...present)
    // bar heights 18% to 100% of the range. A series that varies by less than 2% shows level bars (so a steady river does not look
    // like a swing); a block with no readings shows a thin stub.
    const flat = hi === 0 || (hi - lo) / hi < 0.02
    const bars = means.map(m => (m === null ? 6 : flat ? 55 : 18 + 82 * (m - lo) / (hi - lo)))
    const r: Reading = { value: last.v, unit: last.unit, time: new Date(last.t), bars, low: Math.min(...pts.map((p: any) => p.v)), high: Math.max(...pts.map((p: any) => p.v)), provisional: last.prov }
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
export const unitLabel = (u?: string) => (!u ? 'cfs' : /ft\^?3\/s/i.test(u) ? 'cfs' : u)
