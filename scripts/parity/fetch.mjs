#!/usr/bin/env node
// Parity analysis, stage 1: a polite, resumable crawl of www.cuahsi.org (agent/parity.md, P2; terms in
// agent/reports/261005_parity-stage0.md, "Decisions" and "Where the decisions change earlier sections").
//
//   node scripts/parity/fetch.mjs --date 261005
//
// Rules enforced in code. Against the real host the tuning flags do not exist: spacing, cap and time limit are constants.
//   - one request at a time (a lock file stops a second process); the next request starts at least 1.5 s after the previous
//     response finished, also across restarts (the time of the last response is kept in state.json)
//   - same host only (https://www.cuahsi.org); fragments and every query string dropped, except ?page=N under the four
//     listing roots (events, community/news, cyberseminars, job-board); pager pages are fetched after all other pages
//   - a cap of 1,500 requests in all: page GETs plus HEAD requests for linked files (the two stage 0 requests do not count)
//   - no retries: a failed URL is logged and not requested again. 5 consecutive failures (429, 403, 5xx, network error or
//     timeout; page and HEAD counted together) write a stop marker in state.json and end the run with exit code 3; the
//     next run refuses to start until Jordan has decided (--clear-stop). A Retry-After (seconds or an HTTP date) is waited
//     out before the next request.
//   - after the first 50 requests it writes rate-report.txt; it stops (exit code 4) if the cap would take over 3 hours at
//     that rate, or if the total active crawl time passes 3 hours
//   - HEAD requests are sent only for linked files, never for pages; response bodies over 5 MB are not read
//   - everything is written under raw/legacy-site/<date>/ (gitignored)
// Output: pages/<path>.html, fetch-log.csv, files.json (linked files and the pages linking them), state.json,
// rate-report.txt. The parse step (parse.mjs) reads only this snapshot, never the live site.
// Exit codes: 0 done or cap reached, 2 bad arguments, 3 consecutive failures, 4 rate or time limit, 5 stop marker present,
// 6 another process holds the lock.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const die = (code, msg) => { console.error(msg); process.exit(code) }

const REAL_ORIGIN = 'https://www.cuahsi.org'
const origin = (argv.origin || REAL_ORIGIN).replace(/\/$/, '')
const REAL = origin === REAL_ORIGIN
if (!REAL && !/^http:\/\/localhost:\d+$/.test(origin)) die(2, '--origin must be ' + REAL_ORIGIN + ' or http://localhost:<port> (tests)')
const ORIGIN = origin
const HOST = new URL(ORIGIN).host

// Tuning flags exist only for the local tests. Against the real host they are ignored, whatever is typed.
const num = (name, dflt, ok) => { const v = argv[name] === undefined ? dflt : Number(argv[name]); if (!Number.isFinite(v) || !ok(v)) die(2, '--' + name + ' is not valid'); return v }
let SPACING = 1500, CAP = 1500, MAX_MINUTES = 180
if (REAL) {
  if (['spacing', 'cap', 'max-minutes', 'sitemap'].some(k => argv[k] !== undefined)) console.log('note: --spacing, --cap, --max-minutes and --sitemap are ignored against the real host')
} else {
  SPACING = num('spacing', 1500, v => v >= 0)
  CAP = num('cap', 1500, v => Number.isInteger(v) && v > 0 && v <= 1500)
  MAX_MINUTES = num('max-minutes', 180, v => v > 0 && v <= 180)
}
const DATE = String(argv.date || new Date().toISOString().slice(2, 10).replace(/-/g, ''))
if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(DATE)) die(2, '--date must be letters, digits and hyphens only')
if (argv['print-config']) { console.log(JSON.stringify({ ORIGIN, REAL, SPACING, CAP, MAX_MINUTES, DATE })); process.exit(0) }

const UA = 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)'
const DIR = path.join('raw', 'legacy-site', DATE)
const PAGES = path.join(DIR, 'pages')
const LOG = path.join(DIR, 'fetch-log.csv')
const FILES_JSON = path.join(DIR, 'files.json')
const STATE = path.join(DIR, 'state.json')
const LOCK = path.join(DIR, 'crawl.lock')
const LISTING_ROOTS = ['/events', '/community/news', '/cyberseminars', '/job-board']
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|gz|csv|txt|rtf|odt|ods|odp|kml|kmz|shp|mp3|mp4|mov|png|jpe?g|gif|svg|tiff?)$/i
const MAX_CONSECUTIVE_FAILURES = 5
const CHECKPOINT_AT = 50
const MAX_BODY = 5 * 1024 * 1024
fs.mkdirSync(PAGES, { recursive: true })

// ---- one process at a time ---------------------------------------------------------------------------------------
try { fs.writeFileSync(LOCK, String(process.pid), { flag: 'wx' }) } catch {
  let pid = 0; try { pid = Number(fs.readFileSync(LOCK, 'utf8')) } catch { /* gone */ }
  let alive = false; try { process.kill(pid, 0); alive = pid > 0 } catch { alive = false }
  if (alive) die(6, 'another crawl (pid ' + pid + ') holds ' + LOCK)
  fs.writeFileSync(LOCK, String(process.pid))
}
const unlock = () => { try { fs.unlinkSync(LOCK) } catch { /* already gone */ } }
process.on('exit', unlock); process.on('SIGINT', () => process.exit(130)); process.on('SIGTERM', () => process.exit(143))

// ---- persisted state: last response time, failure count, stop marker, active time -------------------------------------
const state = { lastEnd: 0, consecutiveFailures: 0, stopped: null, activeMs: 0, ...(fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {}) }
const saveState = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 1))
if (argv['clear-stop']) { state.stopped = null; state.consecutiveFailures = 0; saveState(); console.log('stop marker cleared (only after Jordan has decided)') }
if (state.stopped) die(5, 'a stop marker is set (' + state.stopped + '). Tell Jordan. Do not restart until he decides; then use --clear-stop.')

const sleep = ms => new Promise(r => setTimeout(r, ms))
const csvCell = v => { const s = String(v ?? '').replace(/[\r\n]+/g, ' '); return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const parseCsvLine = line => {
  const out = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ } else if (ch === '"') q = false; else cur += ch }
    else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = '' } else cur += ch
  }
  return [...out, cur]
}
if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, 'seq,time,method,url,status,location,content_type,bytes,seconds,saved,note\n')

// ---- state rebuilt from disk (resume) ---------------------------------------------------------------------------
const done = new Set()          // 'GET url' / 'HEAD url' already requested
let requests = 0
const rows = fs.readFileSync(LOG, 'utf8').split('\n').slice(1).filter(Boolean).map(parseCsvLine)
for (const f of rows) { requests = Math.max(requests, Number(f[0])); done.add(f[2] + ' ' + f[3]) }
const files = fs.existsSync(FILES_JSON) ? JSON.parse(fs.readFileSync(FILES_JSON, 'utf8')) : {}   // url -> { pages: [...] }
const queue = []                // ordinary pages
const pagerQueue = []           // listing pagination: only after every ordinary page
const queued = new Set()

// canonical form: https, this host, no fragment, no trailing slash, no double slash, no query (except ?page=N under a listing root)
const canon = (href, base) => {
  let u
  try { u = new URL(href, base) } catch { return null }
  if (!/^https?:$/.test(u.protocol)) return null
  if (u.host !== HOST) return { external: true }
  const p = u.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  const onListing = LISTING_ROOTS.some(r => p === r || p.startsWith(r + '/'))
  let q = ''
  if (onListing && /^\d+$/.test(u.searchParams.get('page') || '')) q = '?page=' + Number(u.searchParams.get('page'))
  const pager = !!q || (onListing && /\/p\d+$/.test(p))
  return { url: ORIGIN + (p === '/' ? '' : p) + q, file: FILE_EXT.test(p) || p.startsWith('/uploads/'), pager }
}
const pathFor = url => {
  const u = new URL(url)
  const p = (u.pathname.replace(/\/+$/, '') || '/index') + (u.search ? '__' + u.search.slice(1).replace(/[^a-z0-9=]/gi, '_') : '')
  return path.join(PAGES, p.replace(/^\//, '').replace(/\.\.+/g, '_') + '.html')
}
const enqueue = (c, why) => {
  if (!c || queued.has(c.url) || done.has('GET ' + c.url)) return
  queued.add(c.url); (c.pager ? pagerQueue : queue).push({ url: c.url, why })
}
const noteFile = (url, from) => { (files[url] ||= { pages: [] }); if (!files[url].pages.includes(from)) files[url].pages.push(from) }

// links found on a page, resolved against the URL it was requested at (or its <base href>)
function harvest($, pageUrl) {
  let base = pageUrl
  const b = $('base[href]').attr('href'); if (b) { try { base = new URL(b, pageUrl).href } catch { /* keep pageUrl */ } }
  $('a[href], link[rel=next][href]').each((_, el) => {
    const c = canon($(el).attr('href'), base)
    if (!c || c.external) return
    if (c.file) noteFile(c.url, pageUrl); else enqueue(c, 'link')
  })
}
for (const f of rows) {                    // rebuild the queues from the saved pages (no network)
  if (f[2] === 'GET' && f[4] === '200' && f[9] && fs.existsSync(f[9])) harvest(cheerio.load(fs.readFileSync(f[9], 'utf8')), f[3])
  if (f[2] === 'GET' && /^3\d\d$/.test(f[4]) && f[5]) { const c = canon(f[5], f[3]); if (c && !c.external && !c.file) enqueue(c, 'redirect') }
}

// seeds: the home page, then the sitemap (saved in stage 0)
if (!queued.has(ORIGIN) && !done.has('GET ' + ORIGIN)) enqueue({ url: ORIGIN }, 'seed')
const smPath = REAL ? path.join(DIR, 'sitemap.xml') : argv.sitemap
if (smPath && fs.existsSync(smPath)) {
  for (const m of fs.readFileSync(smPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) {
    const c = canon(m[1], ORIGIN)
    if (!c || c.external) continue
    if (c.file) noteFile(c.url, 'sitemap'); else enqueue(c, 'sitemap')
  }
}

// ---- the one request function -----------------------------------------------------------------------------------
const runStart = Date.now(), activeAtStart = state.activeMs, startRequests = requests
const parseRetryAfter = h => { if (!h) return 0; if (/^\d+$/.test(h.trim())) return Number(h); const t = Date.parse(h); return Number.isFinite(t) ? Math.max(0, (t - Date.now()) / 1000) : 0 }
async function readLimited(res) {
  if (Number(res.headers.get('content-length') || 0) > MAX_BODY) { await res.body?.cancel?.(); return null }
  const reader = res.body.getReader(); const chunks = []; let n = 0
  for (;;) { const { done: d, value } = await reader.read(); if (d) break; n += value.length; if (n > MAX_BODY) { await reader.cancel(); return null } chunks.push(value) }
  return Buffer.concat(chunks).toString('utf8')
}
async function request(method, url, why) {
  if (requests >= CAP) { console.log('CAP reached: ' + CAP + ' requests'); return 'cap' }
  state.activeMs = activeAtStart + (Date.now() - runStart)
  if (state.activeMs > MAX_MINUTES * 60000) { state.stopped = 'time limit'; saveState(); console.log('STOP: total active crawl time passed ' + MAX_MINUTES + ' minutes. Tell Jordan.'); return 'rate' }
  const wait = state.lastEnd + SPACING - Date.now()
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
      const body = await readLimited(res)
      if (body === null) note = (note + ' body over 5 MB, not saved').trim()
      else {
        bytes = String(Buffer.byteLength(body))
        saved = pathFor(url); fs.mkdirSync(path.dirname(saved), { recursive: true }); fs.writeFileSync(saved, body)
        harvest(cheerio.load(body), url)
      }
    } else if (method === 'GET') { await res.body?.cancel?.() }
    if (status === 429 || status === 403 || status >= 500) { failed = true; retryAfter = parseRetryAfter(res.headers.get('retry-after')) }
    if (status >= 300 && status < 400 && location) {
      const c = canon(location, url)
      if (c && !c.external && !c.file) {
        // a redirect that only adds or removes a trailing slash: fetch that exact URL once (never the same URL twice)
        const exact = new URL(location); exact.hash = ''; exact.search = ''
        if (c.url === url && exact.href !== url && !done.has('GET ' + exact.href) && !queued.has(exact.href)) { queued.add(exact.href); queue.unshift({ url: exact.href, why: 'redirect-slash' }) }
        else enqueue(c, 'redirect')
      }
    }
  } catch (e) { failed = true; note = (note + ' ' + (e.name || 'error') + ': ' + (e.cause?.code || e.message)).trim() }
  const seconds = ((Date.now() - started) / 1000).toFixed(2)
  fs.appendFileSync(LOG, [requests, new Date().toISOString(), method, url, status, location, ctype, bytes, seconds, saved, note].map(csvCell).join(',') + '\n')
  done.add(method + ' ' + url)
  state.lastEnd = Date.now()
  state.consecutiveFailures = failed ? state.consecutiveFailures + 1 : 0
  state.activeMs = activeAtStart + (Date.now() - runStart)
  saveState()
  if (retryAfter) {
    if (retryAfter > 300) { state.stopped = 'Retry-After ' + retryAfter + ' s'; saveState(); console.log('STOP: Retry-After ' + retryAfter + ' s is over 300 s. Tell Jordan.'); return 'stop' }
    await sleep(retryAfter * 1000); state.lastEnd = Date.now(); saveState()
  }
  if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    state.stopped = state.consecutiveFailures + ' consecutive failures'; saveState()
    console.log('STOP: ' + state.consecutiveFailures + ' consecutive 429/403/5xx/network failures. Not retrying. Tell Jordan.'); return 'stop'
  }
  if (requests - startRequests === CHECKPOINT_AT) {
    const per = (Date.now() - runStart) / 1000 / (requests - startRequests)
    const known = requests + queue.length + pagerQueue.length + Object.keys(files).length
    const text = [
      'CHECKPOINT after ' + CHECKPOINT_AT + ' requests (' + new Date().toISOString() + ')',
      'measured: ' + per.toFixed(2) + ' s per request including the ' + (SPACING / 1000) + ' s spacing',
      'known so far: ' + requests + ' made, ' + queue.length + ' pages queued, ' + pagerQueue.length + ' pager pages queued, ' + Object.keys(files).length + ' files seen = ' + known + ' requests: ' + (known * per / 60).toFixed(0) + ' minutes at this rate',
      'worst case at the ' + CAP + '-request cap: ' + (CAP * per / 60).toFixed(0) + ' minutes (the limit is ' + MAX_MINUTES + ')'
    ].join('\n')
    fs.writeFileSync(path.join(DIR, 'rate-report.txt'), text + '\n'); console.log(text)
    if (CAP * per / 60 > MAX_MINUTES) { state.stopped = 'rate'; saveState(); console.log('STOP: the cap would take over ' + MAX_MINUTES + ' minutes at this rate. Tell Jordan.'); return 'rate' }
  }
  return status
}

// ---- main loop: ordinary pages, then pager pages, then HEAD requests for the linked files -----------------------------
const halting = r => r === 'cap' || r === 'stop' || r === 'rate'
async function main() {
  let stop = null
  for (let again = true; again && !stop;) {          // pager pages are only taken when no ordinary page is waiting
    again = false
    while (!stop && (queue.length || pagerQueue.length)) {
      const item = queue.length ? queue.shift() : pagerQueue.shift()
      if (done.has('GET ' + item.url)) continue
      const r = await request('GET', item.url, item.why)
      if (halting(r)) stop = r
      if (requests % 25 === 0) console.log(`[${new Date().toISOString().slice(11, 19)}] ${requests} requests, ${queue.length} queued, ${pagerQueue.length} pager, ${Object.keys(files).length} files seen`)
    }
  }
  fs.writeFileSync(FILES_JSON, JSON.stringify(files, null, 1))
  if (!stop) {
    const todo = Object.keys(files).filter(u => !done.has('HEAD ' + u))
    console.log('pages done; ' + todo.length + ' linked files to size with HEAD (' + (CAP - requests) + ' requests left under the cap)')
    for (const u of todo) { const r = await request('HEAD', u, 'file'); if (halting(r)) { stop = r; break } }
  }
  fs.writeFileSync(FILES_JSON, JSON.stringify(files, null, 1))
  const heads = fs.readFileSync(LOG, 'utf8').split('\n').filter(l => /^\d+,[^,]*,HEAD,/.test(l)).length
  console.log(JSON.stringify({ requests, stopped: stop || 'complete', queueLeft: queue.length + pagerQueue.length, files: Object.keys(files).length, headRequests: heads }))
  process.exit(stop === 'stop' ? 3 : stop === 'rate' ? 4 : 0)
}
main()
