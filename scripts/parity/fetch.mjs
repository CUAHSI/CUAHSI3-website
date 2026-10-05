#!/usr/bin/env node
// Parity analysis, stage 1: a polite, resumable crawl of www.cuahsi.org (agent/parity.md, P2; terms in
// agent/reports/261005_parity-stage0.md, "Decisions" and "Where the decisions change earlier sections").
//
//   node scripts/parity/fetch.mjs --date 261005
//
// Rules enforced here:
//   - one request at a time; the next request starts at least 1.5 s after the previous response finished
//     (the script refuses a spacing under 1000 ms against the real host)
//   - same host only (www.cuahsi.org); fragments and every query string dropped, except the pager query on the four
//     listing roots (events, community/news, cyberseminars, job-board)
//   - a cap of 1,500 requests in all: page GETs plus HEAD requests for linked files (the two stage 0 requests do not count)
//   - no retries: a failed URL is logged and not requested again. 5 consecutive 429/5xx/network failures (page or HEAD)
//     stop the run with exit code 3. A Retry-After is waited out once before the next request.
//   - after the first 50 requests it writes rate-report.txt; it stops (exit code 4) if the cap would take over 3 hours
//   - everything is saved under raw/legacy-site/<date>/ (gitignored); the run is resumable (it rebuilds its queue from the
//     saved pages and fetch-log.csv, with no network)
// Output: pages/<path>.html, fetch-log.csv, files.json (linked files and the pages linking them), rate-report.txt.
// The parse step (parse.mjs) reads only this snapshot, never the live site.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = argv.date || new Date().toISOString().slice(2, 10).replace(/-/g, '')
const ORIGIN = (argv.origin || 'https://www.cuahsi.org').replace(/\/$/, '')
const HOST = new URL(ORIGIN).host
const REAL = HOST === 'www.cuahsi.org'
const SPACING = Number(argv.spacing ?? 1500)
const CAP = Number(argv.cap ?? 1500)
const UA = 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)'
const DIR = path.join('raw', 'legacy-site', DATE)
const PAGES = path.join(DIR, 'pages')
const LOG = path.join(DIR, 'fetch-log.csv')
const FILES_JSON = path.join(DIR, 'files.json')
const LISTING_ROOTS = ['/events', '/community/news', '/cyberseminars', '/job-board']
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|gz|csv|txt|rtf|odt|ods|odp|kml|kmz|shp|mp3|mp4|mov|png|jpe?g|gif|svg|tiff?)$/i
const MAX_CONSECUTIVE_FAILURES = 5
const CHECKPOINT_AT = 50
const MAX_MINUTES = Math.min(180, Number(argv['max-minutes'] ?? 180))   // the flag can only lower the limit (for tests)

if (REAL && SPACING < 1000) { console.error('refusing a spacing under 1000 ms against the real host'); process.exit(2) }
if (!REAL && !/^localhost(:\d+)?$/.test(HOST)) { console.error('--origin must be www.cuahsi.org or localhost'); process.exit(2) }
fs.mkdirSync(PAGES, { recursive: true })

const sleep = ms => new Promise(r => setTimeout(r, ms))
const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, 'seq,time,method,url,status,location,content_type,bytes,seconds,saved,note\n')

// ---- state rebuilt from disk (resume) ---------------------------------------------------------------------------
const done = new Set()          // URLs already requested (any method)
const failedUrls = new Set()
let requests = 0
const logRows = fs.readFileSync(LOG, 'utf8').split('\n').slice(1).filter(Boolean)
for (const l of logRows) {
  const m = l.match(/^(\d+),([^,]*),(GET|HEAD),([^,]*),(\d+|ERR)/)
  if (m) { requests = Math.max(requests, Number(m[1])); done.add(m[3] + ' ' + m[4]); if (m[5] === 'ERR' || Number(m[5]) === 429 || Number(m[5]) >= 500) failedUrls.add(m[3] + ' ' + m[4]) }
}

const files = fs.existsSync(FILES_JSON) ? JSON.parse(fs.readFileSync(FILES_JSON, 'utf8')) : {}   // url -> { pages: [...] }
const queue = []
const queued = new Set()

const canon = (href, base) => {
  let u
  try { u = new URL(href, base) } catch { return null }
  if (!/^https?:$/.test(u.protocol)) return null
  if (u.host !== HOST) return { external: true, url: u.href }
  let p = u.pathname.replace(/\/+$/, '') || '/'
  let q = ''
  const onListing = LISTING_ROOTS.some(r => p === r || p.startsWith(r + '/'))
  // the pager query (?page=N) is followed only under the four listing roots; the Craft-style /pN is an ordinary path
  if (onListing && u.searchParams.has('page') && /^\d+$/.test(u.searchParams.get('page'))) q = '?page=' + u.searchParams.get('page')
  return { url: ORIGIN + (p === '/' ? '' : p) + q, file: FILE_EXT.test(p) || p.startsWith('/uploads/') }
}
const pathFor = url => {
  const u = new URL(url)
  let p = (u.pathname.replace(/\/+$/, '') || '/index') + (u.search ? '__' + u.search.slice(1).replace(/[^a-z0-9=]/gi, '_') : '')
  return path.join(PAGES, p.replace(/^\//, '') + '.html')
}
const enqueue = (url, why) => {
  if (queued.has(url) || done.has('GET ' + url) || failedUrls.has('GET ' + url)) return
  queued.add(url); queue.push({ url, why })
}
const noteFile = (url, from) => { (files[url] ||= { pages: [] }); if (!files[url].pages.includes(from)) files[url].pages.push(from) }

function harvest($, pageUrl) {
  const found = []
  $('a[href], link[rel=next][href]').each((_, el) => {
    const c = canon($(el).attr('href'), pageUrl)
    if (!c) return
    if (c.external) return
    if (c.file) { noteFile(c.url, pageUrl); return }
    found.push(c.url)
  })
  return found
}

// rebuild the queue from saved pages (no network)
function rebuild() {
  for (const l of logRows) {
    const f = l.split(',')
    if (f[2] === 'GET' && f[4] === '200' && f[9] && fs.existsSync(f[9])) {
      const $ = cheerio.load(fs.readFileSync(f[9], 'utf8'))
      for (const u of harvest($, f[3])) enqueue(u, 'link')
    }
  }
}

// seeds: the home page, then the sitemap (saved in stage 0), then whatever the pages reveal
if (REAL) {
  enqueue(ORIGIN, 'seed')
  const sm = path.join(DIR, 'sitemap.xml')
  if (fs.existsSync(sm)) for (const m of fs.readFileSync(sm, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) { const c = canon(m[1], ORIGIN); if (c && !c.external) enqueue(c.url, 'sitemap') }
} else enqueue(ORIGIN, 'seed')
rebuild()

// ---- the one request function -----------------------------------------------------------------------------------
let lastEnd = 0
let consecutiveFailures = 0
const t0 = Date.now()
const startRequests = requests
async function request(method, url, why) {
  if (requests >= CAP) { console.log('CAP reached: ' + CAP + ' requests'); return 'cap' }
  const wait = lastEnd + SPACING - Date.now()
  if (wait > 0) await sleep(wait)
  requests++
  const started = Date.now()
  let status = 'ERR', location = '', ctype = '', bytes = '', saved = '', note = why || '', failed = false, retryAfter = 0
  try {
    const res = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': UA, Accept: method === 'GET' ? 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' : '*/*' }, signal: AbortSignal.timeout(30000) })
    status = res.status
    location = res.headers.get('location') ? new URL(res.headers.get('location'), url).href : ''
    ctype = (res.headers.get('content-type') || '').split(';')[0]
    bytes = res.headers.get('content-length') || ''
    if (method === 'HEAD') note = [note, 'last-modified=' + (res.headers.get('last-modified') || '')].filter(Boolean).join(' ')
    if (method === 'GET' && status === 200 && /html/.test(ctype)) {
      const body = await res.text()
      bytes = String(Buffer.byteLength(body))
      saved = pathFor(url); fs.mkdirSync(path.dirname(saved), { recursive: true }); fs.writeFileSync(saved, body)
      for (const u of harvest(cheerio.load(body), url)) enqueue(u, 'link')
    } else if (method === 'GET') { await res.body?.cancel?.() }
    if (status === 429 || status >= 500) { failed = true; retryAfter = Number(res.headers.get('retry-after')) || 0 }
    if (status >= 300 && status < 400 && location) { const c = canon(location, url); if (c && !c.external && !c.file) enqueue(c.url, 'redirect') }
  } catch (e) { failed = true; note = (note + ' ' + (e.name || 'error') + ': ' + (e.cause?.code || e.message)).trim() }
  const seconds = ((Date.now() - started) / 1000).toFixed(2)
  fs.appendFileSync(LOG, [requests, new Date().toISOString(), method, url, status, location, ctype, bytes, seconds, saved, note].map(csvCell).join(',') + '\n')
  done.add(method + ' ' + url); if (failed) failedUrls.add(method + ' ' + url)
  lastEnd = Date.now()
  consecutiveFailures = failed ? consecutiveFailures + 1 : 0
  if (retryAfter) { if (retryAfter > 300) { console.log('STOP: Retry-After ' + retryAfter + ' s is over 300 s'); return 'stop' } await sleep(retryAfter * 1000); lastEnd = Date.now() }
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) { console.log('STOP: ' + consecutiveFailures + ' consecutive 429/5xx/network failures. Not retrying. Tell Jordan.'); return 'stop' }
  if (requests - startRequests === CHECKPOINT_AT || (requests === CHECKPOINT_AT && startRequests === 0)) {
    const mine = (Date.now() - t0) / 1000
    const per = mine / (requests - startRequests)
    const known = requests + queue.length + Object.keys(files).length
    const text = [
      'CHECKPOINT after ' + (requests - startRequests) + ' requests (' + new Date().toISOString() + ')',
      'measured: ' + per.toFixed(2) + ' s per request including the ' + (SPACING / 1000) + ' s spacing',
      'known so far: ' + requests + ' made, ' + queue.length + ' pages queued, ' + Object.keys(files).length + ' files seen = ' + known + ' requests: ' + (known * per / 60).toFixed(0) + ' minutes at this rate',
      'worst case at the ' + CAP + '-request cap: ' + (CAP * per / 60).toFixed(0) + ' minutes (the limit is ' + MAX_MINUTES + ')'
    ].join('\n')
    fs.writeFileSync(path.join(DIR, 'rate-report.txt'), text + '\n'); console.log(text)
    if (CAP * per / 60 > MAX_MINUTES) { console.log('STOP: the cap would take over ' + MAX_MINUTES + ' minutes at this rate. Tell Jordan.'); return 'rate' }
  }
  return status
}

// ---- main loop: pages first, then HEAD requests for the linked files ---------------------------------------------------
async function main() {
  let stop = null
  while (queue.length && !stop) {
    const { url, why } = queue.shift()
    if (done.has('GET ' + url) || failedUrls.has('GET ' + url)) continue
    const r = await request('GET', url, why)
    if (r === 'cap' || r === 'stop' || r === 'rate') stop = r
    if (requests % 25 === 0) console.log(`[${new Date().toISOString().slice(11, 19)}] ${requests} requests, ${queue.length} queued, ${Object.keys(files).length} files seen`)
  }
  fs.writeFileSync(FILES_JSON, JSON.stringify(files, null, 1))
  if (!stop) {
    const todo = Object.keys(files).filter(u => !done.has('HEAD ' + u) && !failedUrls.has('HEAD ' + u))
    console.log('pages done; ' + todo.length + ' linked files to size with HEAD (' + (CAP - requests) + ' requests left under the cap)')
    for (const u of todo) { const r = await request('HEAD', u, 'file'); if (r === 'cap' || r === 'stop' || r === 'rate') { stop = r; break } }
  }
  fs.writeFileSync(FILES_JSON, JSON.stringify(files, null, 1))
  const heads = fs.readFileSync(LOG, 'utf8').split('\n').filter(l => /^\d+,[^,]*,HEAD,/.test(l)).length
  console.log(JSON.stringify({ requests, stopped: stop || 'complete', queueLeft: queue.length, files: Object.keys(files).length, headRequests: heads }))
  process.exit(stop === 'stop' ? 3 : stop === 'rate' ? 4 : 0)
}
main()
