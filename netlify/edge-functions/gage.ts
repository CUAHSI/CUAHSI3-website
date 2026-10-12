// Asks the USGS Water Data API for the home page gage card (composables/useGageCard.ts) with the site's API key, and lets Netlify's
// CDN cache the answers, so a busy home page costs USGS a few requests instead of one to three per visitor. The key is the Netlify
// environment variable USGS_API_KEY: it is added here, on the server, and never reaches the browser or the repository. Without it
// the function still works, keyless and with USGS's lower limit.
//
// It answers three fixed questions and nothing else (it is not an open proxy):
//   /api/gage/readings/05407000/00060   the last 48 hours of discharge (00060) or gage height (00065)
//   /api/gage/name/05407000             the gage's name
//   /api/gage/recent/05407000/00060/5   the latest reading within 5 days (1 to 14), to tell a gage that went quiet from one that was
//                                       decommissioned
// What is asked is in the PATH, never in a query string, and any query string is refused. Netlify's CDN keyed these replies on the path
// alone and ignored the query: on a deploy preview a gage's readings were served for another gage's name, and the card showed the wrong
// river (12 October 2026). A path is part of every cache key.
// The answer is USGS's own JSON, with only the fields the card reads. Every reply carries `x-gage-proxy: 1`, so the page can tell this
// function's answer (a real 404 for an unknown gage) from a static host that has no such route (local development).
// Cache: readings 15 minutes (USGS updates about every 15), names a day, the recent check an hour; when USGS says fewer than 100
// requests are left this hour, everything is kept at least an hour. A USGS failure (including its rate limit) is answered 503 and
// never cached; the CDN may serve an older copy meanwhile (stale-if-error). An empty list of readings is kept only 5 minutes.
// Only the exact paths above are answered (anything else is a 400), so a visitor cannot make cache misses at will; a flood of
// different gage numbers could still use up the key's hourly allowance (the CDN cannot tell those from real ones).
// `durable` (in the CDN header) asks Netlify to keep a reply in its shared cache. On a deploy preview, nine repeat requests in a row were
// all misses (12 October 2026); my guess is that each edge node kept its own copy, which is not established. Whether `durable` fixes it
// is to be seen on a preview.
const BASE = 'https://api.waterdata.usgs.gov/ogcapi/v1'
const PARAMS = new Set(['00060', '00065'])
const LOW_REMAINING = 100

const secret = (name: string): string | undefined => {
  const g = globalThis as any
  return g.Netlify?.env?.get?.(name) ?? g.Deno?.env?.get?.(name) ?? undefined
}

// `x-gage-key: yes|no` says whether the function can see a key (never the key), so the Netlify setting can be checked with curl -i.
const reply = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'x-gage-proxy': '1', 'x-gage-key': secret('USGS_API_KEY') ? 'yes' : 'no', ...extra },
  })
const noStore = { 'cache-control': 'no-store' }

export default async (request: Request) => {
  const url = new URL(request.url)
  if (url.search || !url.pathname.startsWith('/api/gage/')) return reply(400, { error: 'unexpected address' }, noStore)
  const parts = url.pathname.slice('/api/gage/'.length).split('/')
  const [kind, id = '', param = '', days = ''] = parts
  if (!/^\d{8,15}$/.test(id)) return reply(400, { error: 'id must be 8 to 15 digits' }, noStore)

  let path: string
  let ttl: number
  if (kind === 'readings' && parts.length === 3 && PARAMS.has(param)) {
    path = `/collections/continuous/items?f=json&parameter_code=${param}&time=PT48H&limit=1000&sortby=-time&skipGeometry=true`
      + `&properties=time,value,qualifier,unit_of_measure,approval_status&monitoring_location_id=USGS-${id}`
    ttl = 900
  } else if (kind === 'name' && parts.length === 2) {
    path = `/collections/monitoring-locations/items/USGS-${id}?f=json&properties=monitoring_location_name`
    ttl = 86400
  } else if (kind === 'recent' && parts.length === 4 && PARAMS.has(param) && /^(?:[1-9]|1[0-4])$/.test(days)) {
    path = `/collections/continuous/items?f=json&parameter_code=${param}&time=P${days}D&limit=1&sortby=-time&skipGeometry=true`
      + `&properties=time&monitoring_location_id=USGS-${id}`
    ttl = 3600
  } else {
    return reply(400, { error: 'unknown request' }, noStore)
  }

  const key = secret('USGS_API_KEY')
  let res: Response
  try {
    res = await fetch(BASE + path, { headers: { accept: 'application/json', ...(key ? { 'x-api-key': key } : {}) }, signal: AbortSignal.timeout(4000) })
  } catch {
    return reply(503, { error: 'USGS did not answer' }, { ...noStore, 'retry-after': '60' })
  }

  const remaining = Number(res.headers.get('x-ratelimit-remaining'))
  const cacheFor = Number.isFinite(remaining) && res.headers.has('x-ratelimit-remaining') && remaining < LOW_REMAINING ? Math.max(ttl, 3600) : ttl
  const cacheHeaders = {
    'cache-control': 'public, max-age=60', // the browser
    'netlify-cdn-cache-control': `public, s-maxage=${cacheFor}, stale-while-revalidate=300, stale-if-error=86400, durable`,
  }
  if (res.status === 404) return reply(404, { error: 'not found' }, { ...cacheHeaders, 'netlify-cdn-cache-control': 'public, s-maxage=3600, durable' })
  if (!res.ok) return reply(503, { error: `USGS answered ${res.status}` }, { ...noStore, 'retry-after': '60' })
  const text = await res.text()
  // an empty list of readings may be a glitch, and the card forgets a saved gage on it ("recent"): keep an empty answer only 5 minutes
  let empty = false
  if (kind !== 'name') { try { empty = (JSON.parse(text).features ?? []).length === 0 } catch { empty = false } }
  if (empty) return reply(200, text, { ...cacheHeaders, 'netlify-cdn-cache-control': 'public, s-maxage=300, durable' })
  return reply(200, text, cacheHeaders)
}

export const config = { path: '/api/gage/*', cache: 'manual' }
