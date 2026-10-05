#!/usr/bin/env node
// Parity analysis, stage 1: a polite, resumable crawl of www.cuahsi.org (agent/parity.md, P2; terms in
// agent/reports/261005_parity-stage0.md, "Decisions" and "Where the decisions change earlier sections").
//
//   node scripts/parity/fetch.mjs --date 261005
//
// Rules enforced in code. Against the real host the tuning flags do not exist: spacing, cap and time limit are constants.
//   - one request at a time, across everything on the machine: the lock and the stop marker live in raw/legacy-site/, not in
//     one snapshot folder, so a second run with another --date cannot run in parallel or skip the wait. The next request
//     starts at least 1.5 s after the previous response finished, also across restarts.
//   - same host only (https://www.cuahsi.org); fragments and every query string dropped, except ?page=N under the four
//     listing roots (events, community/news, cyberseminars, job-board); pager pages are fetched after all other pages
//   - a cap of 1,500 requests per snapshot: page GETs plus HEAD requests for linked files (the two stage 0 requests do not
//     count). Against the real host a new snapshot may only be started for today's date.
//   - no retries: a failed URL is logged and not requested again, even if the process is killed mid-request (the request in
//     flight is recorded first and logged as LOST on the next start). 5 consecutive failures (429, 403, 5xx, network error
//     or timeout; page and HEAD counted together) write a stop marker and end the run with exit code 3. The next run refuses
//     to start. --clear-stop "<the stop reason>" removes the marker: it is Jordan's decision, never the script's, and the
//     decision is written to the log. A Retry-After (seconds or an HTTP date) is waited out before the next request.
//   - after the first 50 requests of the snapshot it writes rate-report.txt; it stops (exit code 4) if the cap would take
//     over 3 hours at that rate, or if the snapshot's total active crawl time passes 3 hours
//   - HEAD requests are sent only for linked files, never for pages; response bodies over 5 MB are not read
//   - everything is written under raw/legacy-site/ (gitignored)
// These limits stop accidents. They cannot stop someone with a shell who edits the state files or the log on purpose.
// Output (per snapshot, raw/legacy-site/<date>/): pages/<path>.html, fetch-log.csv, files.json, state.json, rate-report.txt.
// The parse step (parse.mjs) reads only this snapshot, never the live site.
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
const today = (() => { const d = new Date(); return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') })()
const DATE = String(argv.date || today)
if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(DATE)) die(2, '--date must be letters, digits and hyphens only')

const UA = 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)'
const ROOT = path.join('raw', 'legacy-site')
const DIR = path.join(ROOT, DATE)
const PAGES = path.join(DIR, 'pages')
const LOG = path.join(DIR, 'fetch-log.csv')
const FILES_JSON = path.join(DIR, 'files.json')
const STATE = path.join(DIR, 'state.json')                       // per snapshot: active time, checkpoint, request in flight
const GLOBAL_DIR = REAL ? ROOT : DIR                              // tests keep everything in their own folder
const LOCK = path.join(GLOBAL_DIR, '.crawl.lock')                 // one process on the machine
const GSTATE = path.join(GLOBAL_DIR, '.crawl-state.json')         // machine-wide: last response time, failures, stop marker
const LISTING_ROOTS = ['/events', '/community/news', '/cyberseminars', '/job-board']
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|gz|csv|txt|rtf|odt|ods|odp|kml|kmz|shp|mp3|mp4|mov|png|jpe?g|gif|svg|tiff?)$/i
const MAX_CONSECUTIVE_FAILURES = 5
const CHECKPOINT_AT = 50
const MAX_BODY = 5 * 1024 * 1024
if (REAL && !/^\d{6}$/.test(DATE)) die(2, 'against the real host --date must be YYMMDD')
if (REAL && DATE !== today && !fs.existsSync(LOG)) die(2, 'against the real host a new snapshot may only be started for today (' + today + '); an existing one may be resumed')
// --print-config comes after every guard, so a test of a guard can never reach the network even if the guard is broken
if (argv['print-config']) { console.log(JSON.stringify({ ORIGIN, REAL, SPACING, CAP, MAX_MINUTES, DATE })); process.exit(0) }
fs.mkdirSync(PAGES, { recursive: true })

// ---- one process at a time ---------------------------------------------------------------------------------------
const takeLock = () => {
  try { fs.writeFileSync(LOCK, String(process.pid), { flag: 'wx' }); return true } catch { return false }
}
if (!takeLock()) {
  let pid = 0; try { pid = Number(fs.readFileSync(LOCK, 'utf8')) } catch { /* gone */ }
  let alive = false; try { process.kill(pid, 0); alive = pid > 0 } catch { alive = false }
  if (alive) die(6, 'another crawl (pid ' + pid + ') holds ' + LOCK)
  try { fs.unlinkSync(LOCK) } catch { /* someone else took it */ }
  if (!takeLock()) die(6, 'another crawl took the lock first')
}
const unlock = () => { try { if (fs.readFileSync(LOCK, 'utf8') === String(process.pid)) fs.unlinkSync(LOCK) } catch { /* already gone */ } }
process.on('exit', unlock); process.on('SIGINT', () => process.exit(130)); process.on('SIGTERM', () => process.exit(143))

// ---- persisted state (written atomically) -----------------------------------------------------------------------
const writeAtomic = (file, text) => { const tmp = file + '.tmp'; fs.writeFileSync(tmp, text); fs.renameSync(tmp, file) }
const readJson = (file, dflt) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : dflt
const g = { lastEnd: 0, consecutiveFailures: 0, stopped: null, ...readJson(GSTATE, {}) }
const state = { activeMs: 0, checkpointDone: false, inflight: null, ...readJson(STATE, {}) }
const saveG = () => writeAtomic(GSTATE, JSON.stringify(g, null, 1))
const saveState = () => writeAtomic(STATE, JSON.stringify(state, null, 1))

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
else if (!fs.readFileSync(LOG, 'utf8').endsWith('\n')) fs.appendFileSync(LOG, '\n')      // a torn last row from a crash
const logRow = (seq, method, url, status, location, ctype, bytes, seconds, saved, note) =>
  fs.appendFileSync(LOG, [seq, new Date().toISOString(), method, url, status, location, ctype, bytes, seconds, saved, note].map(csvCell).join(',') + '\n')

// ---- the stop marker: only Jordan's decision removes it ----------------------------------------------------------------
if (argv['clear-stop'] !== undefined) {
  if (argv['clear-stop'] !== g.stopped) die(5, '--clear-stop needs the exact stop reason as its value: "' + g.stopped + '"')
  logRow(Math.max(0, ...fs.readFileSync(LOG, 'utf8').split('\n').slice(1).filter(Boolean).map(l => Number(parseCsvLine(l)[0]) || 0)), 'NOTE', '', '', '', '', '', '', '', 'stop marker cleared by decision: ' + g.stopped)
  g.stopped = null; g.consecutiveFailures = 0; saveG(); console.log('stop marker cleared (it is Jordan\'s decision)')
}
if (g.stopped) die(5, 'a stop marker is set (' + g.stopped + '). Tell Jordan. Do not restart until he decides.')

// ---- state rebuilt from disk (resume) ---------------------------------------------------------------------------
const done = new Set()          // 'GET url' / 'HEAD url' already requested
let requests = 0
const rows = fs.readFileSync(LOG, 'utf8').split('\n').slice(1).filter(Boolean).map(parseCsvLine)
for (const f of rows) { requests = Math.max(requests, Number(f[0]) || 0); if (f[2] === 'GET' || f[2] === 'HEAD') done.add(f[2] + ' ' + f[3]) }
if (state.inflight) {           // killed between sending a request and logging it: count it, never repeat it
  const [m, ...u] = state.inflight.split(' '); requests++; done.add(state.inflight)
  logRow(requests, m, u.join(' '), 'LOST', '', '', '', '', '', 'in flight when the previous run ended: counted, not repeated')
  state.inflight = null; saveState()
}
const files = readJson(FILES_JSON, {})   // url -> { pages: [...] }
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

// a redirect: a same-host target is queued; one that only adds or removes a trailing slash is fetched once at that exact URL
// (the ?page=N of a pager URL is kept); the same URL is never requested twice, so a loop ends
function followRedirect(url, location) {
  let target; try { target = new URL(location, url) } catch { return }
  const c = canon(target.href, url)
  if (!c || c.external || c.file) return
  if (c.url === url) {
    const exact = new URL(target.href); exact.hash = ''; if (!c.pager) exact.search = ''
    if (exact.href !== url && !done.has('GET ' + exact.href) && !queued.has(exact.href)) { queued.add(exact.href); (c.pager ? pagerQueue : queue).unshift({ url: exact.href, why: 'redirect-slash' }) }
  } else enqueue(c, 'redirect')
}

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
for (const f of rows) {                    // rebuild the queues from the saved pages and redirects (no network)
  if (f[2] === 'GET' && f[4] === '200' && f[9] && fs.existsSync(f[9])) harvest(cheerio.load(fs.readFileSync(f[9], 'utf8')), f[3])
  if (f[2] === 'GET' && /^3\d\d$/.test(f[4]) && f[5]) followRedirect(f[3], f[5])
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
const runStart = Date.now(), activeAtStart = state.activeMs
const parseRetryAfter = h => { if (!h) return 0; if (/^\d+$/.test(h.trim())) return Number(h); const t = Date.parse(h); return Number.isFinite(t) ? Math.max(0, (t - Date.now()) / 1000) : 0 }
async function readLimited(res) {
  if (Number(res.headers.get('content-length') || 0) > MAX_BODY) { await res.body?.cancel?.(); return null }
  const reader = res.body.getReader(); const chunks = []; let n = 0
  for (;;) { const { done: d, value } = await reader.read(); if (d) break; n += value.length; if (n > MAX_BODY) { await reader.cancel(); return null } chunks.push(value) }
  return Buffer.concat(chunks).toString('utf8')
}
const stopWith = (reason, msg) => { g.stopped = reason; saveG(); console.log('STOP: ' + msg + ' Tell Jordan.') }
async function request(method, url, why) {
  if (requests >= CAP) { console.log('CAP reached: ' + CAP + ' requests'); return 'cap' }
  state.activeMs = activeAtStart + (Date.now() - runStart)
  if (state.activeMs > MAX_MINUTES * 60000) { stopWith('time limit', 'the snapshot\'s active crawl time passed ' + MAX_MINUTES + ' minutes.'); return 'rate' }
  const wait = g.lastEnd + SPACING - Date.now()
  if (wait > 0) await sleep(wait)
  requests++
  state.inflight = method + ' ' + url; saveState()                      // recorded before sending, so a kill cannot cause a repeat
  const started = Date.now()
  let status = 'ERR', location = '', ctype = '', bytes = '', saved = '', note = why || '', failed = false, retryAfter = 0
  try {
    const res = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': UA, Accept: method === 'GET' ? 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' : '*/*' }, signal: AbortSignal.timeout(30000) })
    status = res.status
    location = res.headers.get('location') || ''
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
    if (status >= 300 && status < 400 && location) followRedirect(url, location)
  } catch (e) { failed = true; note = (note + ' ' + (e.name || 'error') + ': ' + (e.cause?.code || e.message)).trim() }
  const seconds = ((Date.now() - started) / 1000).toFixed(2)
  logRow(requests, method, url, status, location, ctype, bytes, seconds, saved, note)
  done.add(method + ' ' + url)
  state.inflight = null
  g.lastEnd = Date.now()
  g.consecutiveFailures = failed ? g.consecutiveFailures + 1 : 0
  state.activeMs = activeAtStart + (Date.now() - runStart)
  saveState(); saveG()
  if (retryAfter) {
    if (retryAfter > 300) { stopWith('Retry-After ' + retryAfter + ' s', 'Retry-After ' + retryAfter + ' s is over 300 s.'); return 'stop' }
    await sleep(retryAfter * 1000); g.lastEnd = Date.now(); saveG()
  }
  if (g.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) { stopWith(g.consecutiveFailures + ' consecutive failures', g.consecutiveFailures + ' consecutive 429/403/5xx/network failures. Not retrying.'); return 'stop' }
  if (!state.checkpointDone && requests >= CHECKPOINT_AT) {
    state.checkpointDone = true; saveState()
    const per = state.activeMs / 1000 / requests
    const known = requests + queue.length + pagerQueue.length + Object.keys(files).length
    const text = [
      'CHECKPOINT after ' + requests + ' requests of this snapshot (' + new Date().toISOString() + ')',
      'measured: ' + per.toFixed(2) + ' s per request including the ' + (SPACING / 1000) + ' s spacing (active time only)',
      'known so far: ' + requests + ' made, ' + queue.length + ' pages queued, ' + pagerQueue.length + ' pager pages queued, ' + Object.keys(files).length + ' files seen = ' + known + ' requests: ' + (known * per / 60).toFixed(0) + ' minutes at this rate',
      'worst case at the ' + CAP + '-request cap: ' + (CAP * per / 60).toFixed(0) + ' minutes (the limit is ' + MAX_MINUTES + ')'
    ].join('\n')
    fs.writeFileSync(path.join(DIR, 'rate-report.txt'), text + '\n'); console.log(text)
    if (CAP * per / 60 > MAX_MINUTES) { stopWith('rate', 'the cap would take over ' + MAX_MINUTES + ' minutes at this rate.'); return 'rate' }
  }
  return status
}

// ---- main loop: ordinary pages, then pager pages, then HEAD requests for the linked files -----------------------------
const halting = r => r === 'cap' || r === 'stop' || r === 'rate'
async function main() {
  let stop = null
  while (!stop && (queue.length || pagerQueue.length)) {          // pager pages are only taken when no ordinary page is waiting
    const item = queue.length ? queue.shift() : pagerQueue.shift()
    if (done.has('GET ' + item.url)) continue
    const r = await request('GET', item.url, item.why)
    if (halting(r)) stop = r
    if (requests % 25 === 0) console.log(`[${new Date().toISOString().slice(11, 19)}] ${requests} requests, ${queue.length} queued, ${pagerQueue.length} pager, ${Object.keys(files).length} files seen`)
  }
  writeAtomic(FILES_JSON, JSON.stringify(files, null, 1))
  if (!stop) {
    const todo = Object.keys(files).filter(u => !done.has('HEAD ' + u))
    console.log('pages done; ' + todo.length + ' linked files to size with HEAD (' + (CAP - requests) + ' requests left under the cap)')
    for (const u of todo) { const r = await request('HEAD', u, 'file'); if (halting(r)) { stop = r; break } }
  }
  writeAtomic(FILES_JSON, JSON.stringify(files, null, 1))
  const heads = fs.readFileSync(LOG, 'utf8').split('\n').filter(l => /^\d+,[^,]*,HEAD,/.test(l)).length
  console.log(JSON.stringify({ requests, stopped: stop || 'complete', queueLeft: queue.length + pagerQueue.length, files: Object.keys(files).length, headRequests: heads }))
  process.exit(stop === 'stop' ? 3 : stop === 'rate' ? 4 : 0)
}
main()
