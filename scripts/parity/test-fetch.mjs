#!/usr/bin/env node
// Tests for scripts/parity/fetch.mjs. Local servers only: this never contacts the legacy site.
//   node scripts/parity/test-fetch.mjs
// Each check can fail: it asserts something the server or the log would show if the rule were broken.
import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

fs.mkdirSync('.agent', { recursive: true })
const results = []
const check = (name, ok, detail = '') => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !detail ? '' : '  <- ' + String(detail).slice(0, 300))) }
const dirOf = d => path.join('raw', 'legacy-site', d)
const clean = d => fs.rmSync(dirOf(d), { recursive: true, force: true })
const run = (args, opts = {}) => spawnSync(process.execPath, ['scripts/parity/fetch.mjs', ...args], { encoding: 'utf8', ...opts })
const csv = line => { const o = []; let c = '', q = false; for (let i = 0; i < line.length; i++) { const h = line[i]; if (q) { if (h === '"' && line[i + 1] === '"') { c += '"'; i++ } else if (h === '"') q = false; else c += h } else if (h === '"') q = true; else if (h === ',') { o.push(c); c = '' } else c += h } return [...o, c] }
const rowsOf = d => fs.existsSync(path.join(dirOf(d), 'fetch-log.csv')) ? fs.readFileSync(path.join(dirOf(d), 'fetch-log.csv'), 'utf8').split('\n').slice(1).filter(Boolean).map(csv) : []
const jsonOf = f => JSON.parse(fs.readFileSync(f, 'utf8'))

// ---- two local servers, each its own process (spawnSync blocks this one) -----------------------------------------------
const MODE = '.agent/t-mode', HITS = '.agent/t-hits.log', EXT_HITS = '.agent/t-ext-hits.log', EXT_PORT = '.agent/t-ext-port'
const setMode = m => fs.writeFileSync(MODE, m)
const getHits = () => fs.existsSync(HITS) ? fs.readFileSync(HITS, 'utf8').split('\n').filter(Boolean) : []
const resetHits = () => fs.writeFileSync(HITS, '')
const startServer = env => new Promise(resolve => {
  const p = spawn(process.execPath, ['scripts/parity/test-server.mjs'], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'] })
  p.stdout.on('data', d => { const m = String(d).match(/PORT (\d+)/); if (m) resolve({ proc: p, port: Number(m[1]) }) })
})
setMode('rich'); resetHits(); fs.writeFileSync(EXT_HITS, '')
const ext = await startServer({ MODE_FILE: MODE, HITS_FILE: EXT_HITS })      // a second host (another port) that must never be contacted
fs.writeFileSync(EXT_PORT, String(ext.port))
const main = await startServer({ MODE_FILE: MODE, HITS_FILE: HITS, EXT_PORT_FILE: EXT_PORT })
const ORIGIN = 'http://localhost:' + main.port
const common = d => ['--date', d, '--origin', ORIGIN, '--spacing', '0']

// 1 configuration: the real host ignores the tuning flags; bad local values are refused; real-host date rules
let r = run(['--print-config', '--spacing', 'abc', '--cap', '5000', '--max-minutes', '9999', '--spacing', '10'])
const cfg = JSON.parse(r.stdout.split('\n').filter(l => l.startsWith('{'))[0] || '{}')
check('real host: spacing, cap and max-minutes are fixed whatever is typed', cfg.SPACING === 1500 && cfg.CAP === 1500 && cfg.MAX_MINUTES === 180 && cfg.REAL === true, r.stdout)
check('real host: a new snapshot for another day is refused (exit 2)', run(['--print-config', '--date', '990101']).status === 2)
check('real host: a --date that is not YYMMDD is refused (exit 2)', run(['--print-config', '--date', 'abcdef']).status === 2)
check('local: --spacing abc is refused', run(['--print-config', '--origin', ORIGIN, '--spacing', 'abc']).status === 2)
check('local: --cap abc is refused', run(['--print-config', '--origin', ORIGIN, '--cap', 'abc']).status === 2)
check('local: --cap 5000 is refused', run(['--print-config', '--origin', ORIGIN, '--cap', '5000']).status === 2)
check('local: --max-minutes abc is refused', run(['--print-config', '--origin', ORIGIN, '--max-minutes', 'abc']).status === 2)
check('another host is refused', run(['--print-config', '--origin', 'https://example.com']).status === 2)
check('--date with a path is refused', run(['--print-config', '--date', '../x']).status === 2)

// 2 a rich site: normalisation, files, redirects, pager, relative links, no duplicates, other hosts never contacted
clean('t-rich'); setMode('rich'); resetHits(); fs.writeFileSync(EXT_HITS, '')
fs.writeFileSync('.agent/t-sitemap.xml', `<urlset><url><loc>${ORIGIN}/doc.pdf</loc></url><url><loc>${ORIGIN}/sitemap-only</loc></url><url><loc>https://other.example/x</loc></url></urlset>`)
r = run([...common('t-rich'), '--sitemap', '.agent/t-sitemap.xml'])
let hits = getHits()
check('run completes', r.status === 0, r.stdout + r.stderr)
check('no GET for a file (sitemap or link); HEAD only', !hits.some(h => h.startsWith('GET /doc.pdf') || h.startsWith('GET /uploads')) && hits.includes('HEAD /doc.pdf') && hits.includes('HEAD /uploads/x'), hits.join(' | '))
check('every logged request is to this origin', rowsOf('t-rich').every(f => !f[3] || f[3].startsWith(ORIGIN)), rowsOf('t-rich').map(f => f[3]).join(' '))
check('another host (a second local server on another port) is never contacted', fs.readFileSync(EXT_HITS, 'utf8') === '', fs.readFileSync(EXT_HITS, 'utf8'))
check('links to other hosts are not mapped onto this host (http://example.com/x must not become GET /x)', !hits.includes('GET /x') && !hits.includes('GET /ext') && !hits.includes('GET /y'), hits.join(' | '))
check('the home page really links to that other host (so the check above could fail)', fs.readFileSync(path.join(dirOf('t-rich'), 'pages', 'index.html'), 'utf8').includes('localhost:' + ext.port))
check('query strings dropped except the pager under /events', !hits.some(h => h.includes('utm') || h.includes('foo=2')) && hits.includes('GET /events?page=2') && hits.includes('GET /events?page=3'), hits.join(' | '))
check('the same page linked twice, with and without a fragment, is requested once', hits.filter(h => h === 'GET /about').length === 1, hits.join(' | '))
check('double slash collapsed', hits.includes('GET /dup/path') && !hits.some(h => h.includes('//')))
check('trailing-slash redirect: the exact URL is fetched once and a relative link resolves against it', hits.includes('GET /slash/') && hits.includes('GET /slash/child') && hits.includes('GET /rel/c'), hits.join(' | '))
check('a redirect loop (/loopa to /loopa/ to /loopa) ends: each URL once', hits.filter(h => h === 'GET /loopa').length <= 1 && hits.filter(h => h === 'GET /loopa/').length <= 1)
check('a URL with a comma is fetched', hits.includes('GET /a,b'))
check('no URL requested twice', new Set(hits).size === hits.length, hits.filter((h, i) => hits.indexOf(h) !== i).join(' | '))
check('pager pages wait: every ordinary page already known is fetched before the first pager page', (() => { const urls = rowsOf('t-rich').map(f => f[3].replace(ORIGIN, '')); const firstPager = urls.findIndex(u => u.includes('?page=')); const known = ['/events', '/slash', '/rel', '/a,b', '/about', '/Case', '/dup/path', '/events/e1', '/slash/child', '/rel/c', '/sitemap-only']; return firstPager > 0 && known.every(k => { const i = urls.indexOf(k); return i >= 0 && i < firstPager }) })())
const before = rowsOf('t-rich').length
resetHits(); run(common('t-rich'))
check('resume (with a comma URL in the log) makes no new request', getHits().length === 0 && rowsOf('t-rich').length === before, getHits().join(' | '))
check('files.json lists the 2 files with the pages that link them', (() => { const f = jsonOf(path.join(dirOf('t-rich'), 'files.json')); return Object.keys(f).length === 2 && f[ORIGIN + '/doc.pdf'].pages.includes('sitemap') })())
check('the lock is released after a normal run', !fs.existsSync(path.join(dirOf('t-rich'), '.crawl.lock')))

// 3 a redirect on a pager URL keeps its page number; a pending redirect survives a restart
clean('t-pager'); setMode('pagerredirect'); resetHits()
r = run([...common('t-pager'), '--cap', '3'])           // home, /events, then /events?page=2 (a 301): stops at the cap before the slash URL
const afterCap = getHits()
check('pager redirect: /events?page=2 is requested, then (after a resume) /events/?page=2 with its page number', afterCap.includes('GET /events?page=2') && !afterCap.includes('GET /events/?page=2'), afterCap.join(' | '))
resetHits(); run(common('t-pager'))
check('a redirect pending at a restart is not lost, and the query is kept', getHits().includes('GET /events/?page=2') && !getHits().includes('GET /events/'), getHits().join(' | '))

// 4 caps and limits
clean('t-cap'); setMode('rich'); resetHits()
r = run([...common('t-cap'), '--cap', '5']); check('cap: stops at 5 requests', rowsOf('t-cap').length === 5 && /CAP reached/.test(r.stdout), r.stdout)
resetHits(); r = run([...common('t-cap'), '--cap', '5']); check('cap: a rerun makes no request and exits 0', getHits().length === 0 && r.status === 0 && /"stopped":"cap"/.test(r.stdout), r.stdout)
clean('t-headcap'); resetHits(); r = run([...common('t-headcap'), '--cap', '12'])   // pages first, then HEAD: the cap counts both
check('cap: HEAD requests count toward it', rowsOf('t-headcap').length === 12 && rowsOf('t-headcap').some(f => f[2] === 'HEAD') === (getHits().some(h => h.startsWith('HEAD'))), rowsOf('t-headcap').length)
clean('t-slow'); setMode('endless')
r = run([...common('t-slow'), '--max-minutes', '1']); check('rate: checkpoint at 50 requests stops with exit 4 when the cap would take over the limit', r.status === 4 && /CHECKPOINT/.test(r.stdout) && rowsOf('t-slow').length === 50, r.stdout)
r = run(common('t-slow')); check('rate: the next run refuses to start (exit 5, no new request)', r.status === 5 && rowsOf('t-slow').length === 50, String(r.status))
clean('t-cp2'); setMode('endless')
run([...common('t-cp2'), '--cap', '30']); const noReport = !fs.existsSync(path.join(dirOf('t-cp2'), 'rate-report.txt'))
run([...common('t-cp2'), '--cap', '60']); const report1 = fs.existsSync(path.join(dirOf('t-cp2'), 'rate-report.txt')) && jsonOf(path.join(dirOf('t-cp2'), 'state.json')).checkpointDone === true
check('checkpoint counts the whole snapshot: no report after 30 requests, one after the second run reaches 50', noReport && report1 && rowsOf('t-cp2').length === 60)
clean('t-time'); setMode('endless'); r = run([...common('t-time'), '--max-minutes', '0.01']); check('time guard: total active time over the limit stops the run (exit 4)', r.status === 4 && /active crawl time/.test(r.stdout), r.stdout)

// 5 failures, no retries, the stop marker, spacing across a restart, Retry-After, response sizes
for (const m of ['fail', '403']) {
  clean('t-' + m); setMode(m); resetHits()
  r = run(common('t-' + m)); const rows = rowsOf('t-' + m)
  check(m + ': 5 consecutive failures stop the run (exit 3) after exactly 6 requests', r.status === 3 && rows.length === 6, r.status + ' ' + rows.length)
  check(m + ': no URL requested twice', new Set(getHits()).size === getHits().length)
  resetHits(); r = run(common('t-' + m)); check(m + ': the next run refuses to start (exit 5) and makes no request', r.status === 5 && getHits().length === 0, String(r.status))
}
clean('t-clear'); setMode('fail'); run(common('t-clear'))
const reason = jsonOf(path.join(dirOf('t-clear'), '.crawl-state.json')).stopped
setMode('rich'); resetHits()
r = run([...common('t-clear'), '--clear-stop', 'wrong reason']); check('--clear-stop with the wrong reason is refused (exit 5, no request)', r.status === 5 && getHits().length === 0, String(r.status))
r = run([...common('t-clear'), '--clear-stop', reason, '--cap', '8']); check('--clear-stop with the exact reason clears it, is logged, and the crawl goes on', r.status === 0 && rowsOf('t-clear').some(f => f[2] === 'NOTE' && /cleared by decision/.test(f[10])) && getHits().length > 0, r.stdout + r.stderr)
clean('t-restart'); setMode('fail')
run(['--date', 't-restart', '--origin', ORIGIN, '--spacing', '1500']); const lastLine = rowsOf('t-restart').at(-1)[1]
const reason2 = jsonOf(path.join(dirOf('t-restart'), '.crawl-state.json')).stopped
setMode('rich'); run(['--date', 't-restart', '--origin', ORIGIN, '--spacing', '1500', '--clear-stop', reason2, '--cap', '8'])
const second = rowsOf('t-restart').filter(f => f[2] === 'GET')[6][1]
check('spacing holds across a restart (the first request of the new process waits for the 1.5 s)', Date.parse(second) - Date.parse(lastLine) >= 1450, (Date.parse(second) - Date.parse(lastLine)) + ' ms')
clean('t-404'); setMode('404reset'); r = run(common('t-404')); check('a 404 resets the failure count (4 failures, a 404, 2 failures: no stop)', r.status === 0 && rowsOf('t-404').length === 8, r.status + ' ' + rowsOf('t-404').length)
clean('t-headfail'); setMode('headfail'); r = run(common('t-headfail')); check('HEAD failures count toward the 5 (exit 3 after the home page + 5 HEADs)', r.status === 3 && rowsOf('t-headfail').filter(f => f[2] === 'HEAD').length === 5, r.status + ' ' + r.stdout)
clean('t-date'); setMode('ratedate'); const t0 = Date.now(); run(common('t-date')); const elapsed = Date.now() - t0
check('Retry-After as an HTTP date is waited out (two 429s, each about 1 to 2 s)', elapsed >= 1800, elapsed + ' ms')
clean('t-ra'); setMode('raseconds'); const t1 = Date.now(); r = run(common('t-ra')); check('Retry-After in seconds is waited out', Date.now() - t1 >= 1000 && r.status === 0, (Date.now() - t1) + ' ms')
clean('t-ralong'); setMode('ralong'); r = run(common('t-ralong')); check('Retry-After over 300 s stops the run (exit 3, marker set)', r.status === 3 && /Retry-After 301/.test(jsonOf(path.join(dirOf('t-ralong'), '.crawl-state.json')).stopped), r.stdout)
clean('t-big'); setMode('big'); r = run(common('t-big')); check('a body over 5 MB is not read or saved', rowsOf('t-big').some(f => /body over 5 MB/.test(f[10])) && !fs.existsSync(path.join(dirOf('t-big'), 'pages', 'big.html')), JSON.stringify(rowsOf('t-big')))

// 6 a killed process: the request in flight is counted and never repeated; the stale lock is taken over; one process at a time
clean('t-kill'); setMode('hang'); resetHits()
const victim = spawn(process.execPath, ['scripts/parity/fetch.mjs', ...common('t-kill')], { stdio: 'ignore' })
await new Promise(r2 => setTimeout(r2, 1500)); victim.kill('SIGKILL'); await new Promise(r2 => setTimeout(r2, 300))
const staleLock = fs.existsSync(path.join(dirOf('t-kill'), '.crawl.lock'))
r = run(common('t-kill'))
check('after SIGKILL the lock is stale and the next run takes it over', staleLock && r.status === 0, 'stale=' + staleLock + ' exit=' + r.status)
check('after SIGKILL the request in flight is logged as LOST and not requested again', rowsOf('t-kill').some(f => f[4] === 'LOST' && f[3].endsWith('/p1')) && getHits().filter(h => h === 'GET /p1').length === 1, getHits().join(' | '))
clean('t-lock'); setMode('endless')
spawnSync('sh', ['-c', `node scripts/parity/fetch.mjs --date t-lock --origin ${ORIGIN} --spacing 300 --cap 10 & sleep 1; node scripts/parity/fetch.mjs --date t-lock --origin ${ORIGIN} --spacing 0 --cap 10 > .agent/t-second.out 2>&1; echo $? > .agent/t-second.code; wait`], { encoding: 'utf8' })
check('a second process on the same snapshot is refused (exit 6)', fs.readFileSync('.agent/t-second.code', 'utf8').trim() === '6', fs.readFileSync('.agent/t-second.out', 'utf8'))

for (const d of ['t-rich', 't-pager', 't-cap', 't-headcap', 't-slow', 't-cp2', 't-time', 't-fail', 't-403', 't-clear', 't-restart', 't-404', 't-headfail', 't-date', 't-ra', 't-ralong', 't-big', 't-kill', 't-lock']) clean(d)
for (const f of ['.agent/t-sitemap.xml', '.agent/t-second.out', '.agent/t-second.code', MODE, HITS, EXT_HITS, EXT_PORT]) fs.rmSync(f, { force: true })
main.proc.kill(); ext.proc.kill()
console.log(results.filter(Boolean).length + ' of ' + results.length + ' checks passed')
process.exit(results.every(Boolean) ? 0 : 1)
