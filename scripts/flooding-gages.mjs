// Writes public/flooding-gages.json: the gages that NOAA's National Weather Service (National Water Prediction Service, NWPS) says are at
// minor, moderate or major flood right now, each with its USGS station number, so the home page's gage card can show one. Run
// before a build (and on a schedule, so the file stays fresh): node scripts/flooding-gages.mjs [--out path]
// Why a script and not the browser: the NWPS service sends no cross-origin permission and its national list is 12 MB (and its national
// request times out, so the lower 48 are read as 24 smaller tiles, three at a time, each retried, with a longer wait if it says 429).
// Only observed categories are used (not forecasts), only readings less than 6 hours old, and only gages that have a USGS station
// number (the card reads its numbers from USGS). If NWPS cannot be reached the script warns and writes nothing, so a build never fails
// because of it; the card then shows its normal gage. The file is generated, never committed (.gitignore).
import fs from 'node:fs'
const API = 'https://api.water.noaa.gov/nwps/v1'
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'public/flooding-gages.json'
const FLOOD = new Set(['minor', 'moderate', 'major'])
const MAX_AGE_MS = 6 * 3600 * 1000
const UA = { 'user-agent': 'CUAHSI-website-flood-snapshot (https://cuahsi.org)', accept: 'application/json' }

async function getJson(url, ms) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    let wait = 1500 * attempt
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms)
      const res = await fetch(url, { headers: UA, signal: ctl.signal }); clearTimeout(t)
      if (res.ok) return await res.json()
      if (res.status === 429) wait = Math.max(Number(res.headers.get('retry-after')) * 1000 || 0, 20000 * attempt) // asked to slow down
      else if (res.status < 500) return null
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, wait))
  }
  return null
}

const tiles = []
for (let x = -125; x < -65; x += 10) for (const [y0, y1] of [[24, 30], [30, 36], [36, 42], [42, 50]]) tiles.push([x, y0, x + 10, y1])
const byLid = new Map()
let failedTiles = 0, nextTile = 0
await Promise.all(Array.from({ length: 3 }, async () => {
  while (nextTile < tiles.length) {
    const [x0, y0, x1, y1] = tiles[nextTile++]
    const t = await getJson(`${API}/gauges?bbox.xmin=${x0}&bbox.ymin=${y0}&bbox.xmax=${x1}&bbox.ymax=${y1}&srid=EPSG_4326`, 100000)
    if (!t?.gauges) { failedTiles++; continue }
    for (const g of t.gauges) byLid.set(g.lid, g)
  }
}))
// a partial national picture would hide floods in the missing tiles while looking complete, so any failed tile means no new file
if (failedTiles) { console.warn(`flooding-gages: ${failedTiles} of ${tiles.length} NWPS requests failed; no file written`); process.exit(0) }
const list = { gauges: [...byLid.values()] }
const lakes = []
const now = Date.now()
// a lake or reservoir gage (Devils Lake in North Dakota has been in major flood for years): a slow, long-term story, not a river to
// feature. A gage counts as a lake when its name has the word Lake and no word for flowing water, so "Moses Lake at Moses Lake" is
// left out and "Crab Creek near Moses Lake" and "Gauley River below Summersville Lake" are kept.
const isLake = name => /\bLake\b/i.test(name) && !/\b(River|Rv|Creek|Brook|Fork|Run|Bayou|Branch|Canal|Slough|Wash|Stream|Outlet)\b/i.test(name)
const flooding = list.gauges.filter(g => {
  const o = g.status?.observed
  if (!(o && FLOOD.has(o.floodCategory) && now - Date.parse(o.validTime) <= MAX_AGE_MS && Number.isFinite(o.primary) && o.primary > -900)) return false
  if (isLake(g.name ?? '')) { lakes.push(g.name); return false }
  return true
})
const out = []
let next = 0, failedDetails = 0
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < flooding.length) {
    const g = flooding[next++]
    const d = await getJson(`${API}/gauges/${encodeURIComponent(g.lid)}`, 30000)
    if (!d) { failedDetails++; continue } // a detail call that fails is counted: too many means the snapshot is not trusted
    if (d.inService === false || !/^\d{8,15}$/.test(String(d.usgsId ?? ''))) continue
    const o = g.status.observed
    out.push({
      usgsId: String(d.usgsId), lid: g.lid, name: d.name ?? g.name, state: g.state?.abbreviation ?? null,
      lat: g.latitude, lon: g.longitude, category: o.floodCategory, stage: o.primary, stageUnit: o.primaryUnit, time: o.validTime,
      minorStage: d.flood?.categories?.minor?.stage ?? null,
    })
  }
}))
if (flooding.length && failedDetails > Math.max(1, flooding.length * 0.2)) { console.warn(`flooding-gages: ${failedDetails} of ${flooding.length} detail requests failed; no file written`); process.exit(0) }
const rank = { major: 3, moderate: 2, minor: 1 }
out.sort((a, b) => rank[b.category] - rank[a.category] || a.lid.localeCompare(b.lid))
fs.mkdirSync(OUT.replace(/\/[^/]*$/, '') || '.', { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), source: 'NOAA National Weather Service, National Water Prediction Service', gages: out }) + '\n')
const counts = out.reduce((c, g) => ((c[g.category] = (c[g.category] ?? 0) + 1), c), {})
if (lakes.length) console.log('flooding-gages: left out as lakes:', lakes.join('; '))
console.log(`flooding-gages: ${out.length} of ${flooding.length} gages in flood have a USGS number`, JSON.stringify(counts), '->', OUT)
