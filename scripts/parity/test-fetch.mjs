#!/usr/bin/env node
// Tests for scripts/parity/fetch.mjs. Local servers only: this never contacts the legacy site.
//   node scripts/parity/test-fetch.mjs
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

const results = []
const check = (name, ok, detail = '') => { results.push(ok); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !detail ? '' : '  <- ' + detail)) }
const dirOf = d => path.join('raw', 'legacy-site', d)
const clean = d => fs.rmSync(dirOf(d), { recursive: true, force: true })
const run = (args, opts = {}) => spawnSync(process.execPath, ['scripts/parity/fetch.mjs', ...args], { encoding: 'utf8', ...opts })
const csv = line => { const o = []; let c = '', q = false; for (let i = 0; i < line.length; i++) { const h = line[i]; if (q) { if (h === '"' && line[i + 1] === '"') { c += '"'; i++ } else if (h === '"') q = false; else c += h } else if (h === '"') q = true; else if (h === ',') { o.push(c); c = '' } else c += h } return [...o, c] }
const logRows = d => fs.existsSync(path.join(dirOf(d), 'fetch-log.csv')) ? fs.readFileSync(path.join(dirOf(d), 'fetch-log.csv'), 'utf8').split('\n').slice(1).filter(Boolean) : []

// ---- a local site that misbehaves on purpose: its own process, because spawnSync blocks this one -----------------------
const SERVER = '.agent/t-server.mjs', MODE = '.agent/t-mode', HITS = '.agent/t-hits.log'
fs.writeFileSync(SERVER, `
import http from 'node:http'
import fs from 'node:fs'
const page = body => '<html><body>' + body + '</body></html>'
const seven = '<a href="/p1">1</a><a href="/p2">2</a><a href="/p3">3</a><a href="/p4">4</a><a href="/p5">5</a><a href="/p6">6</a><a href="/p7">7</a>'
http.createServer(async (req, res) => {
  const mode = fs.readFileSync('${MODE}', 'utf8').trim()
  const u = new URL(req.url, 'http://localhost')
  fs.appendFileSync('${HITS}', req.method + ' ' + u.pathname + u.search + '\\n')
  const html = (b, code = 200, h = {}) => { res.writeHead(code, { 'content-type': 'text/html', ...h }); res.end(req.method === 'HEAD' ? '' : page(b)) }
  if (mode === 'fail') return u.pathname === '/' ? html(seven) : html('down', 503)
  if (mode === '403') return u.pathname === '/' ? html(seven) : html('blocked', 403)
  if (mode === 'ratedate') return u.pathname === '/' ? html('<a href="/p1">1</a><a href="/p2">2</a>') : html('slow down', 429, { 'retry-after': new Date(Date.now() + 2000).toUTCString() })
  if (mode === 'endless') { await new Promise(r => setTimeout(r, 120)); const n = Number((u.pathname.match(/page(\\d+)/) || [0, 0])[1]); return html(Array.from({ length: 40 }, (_, i) => '<a href="/page' + (n * 40 + i + 1) + '">p</a>').join('')) }
  if (u.pathname === '/') return html('<a href="/events">e</a><a href="/slash">s</a><a href="/rel">r</a><a href="/a,b">c</a><a href="/doc.pdf">d</a><a href="/uploads/x">u</a><a href="http://example.com/x">ext</a><a href="/events?utm=1&foo=2">q</a><a href="/about#frag">f</a><a href="//host.invalid/y">proto</a><a href="/Case">c</a><a href="/dup//path">dd</a>')
  if (u.pathname === '/events') { const p = Number(u.searchParams.get('page') || 1); return html((p < 4 ? '<a href="/events?page=' + (p + 1) + '">next</a>' : '') + '<a href="/events/e' + p + '">e</a>') }
  if (u.pathname === '/slash') { res.writeHead(301, { location: '/slash/' }); return res.end() }
  if (u.pathname === '/slash/') return html('<a href="child">child</a>')
  if (u.pathname === '/rel') { res.writeHead(301, { location: '/rel/' }); return res.end() }
  if (u.pathname === '/rel/') return html('<a href="c">c</a>')
  if (u.pathname === '/doc.pdf' || u.pathname === '/uploads/x') { res.writeHead(200, { 'content-type': 'application/pdf', 'content-length': '1234' }); return res.end() }
  return html('page ' + u.pathname)
}).listen(0, function () { console.log('PORT ' + this.address().port) })
`)

const setMode = m => fs.writeFileSync(MODE, m)
const getHits = () => fs.existsSync(HITS) ? fs.readFileSync(HITS, 'utf8').split('\n').filter(Boolean) : []
const resetHits = () => fs.writeFileSync(HITS, '')
setMode('rich'); resetHits()
const srv = spawn(process.execPath, [SERVER], { stdio: ['ignore', 'pipe', 'inherit'] })
const PORT = await new Promise(resolve => srv.stdout.on('data', d => { const m = String(d).match(/PORT (\d+)/); if (m) resolve(Number(m[1])) }))
const ORIGIN = 'http://localhost:' + PORT
const common = d => ['--date', d, '--origin', ORIGIN, '--spacing', '0']

// 1 configuration: the real host ignores the tuning flags; bad local values are refused
let r = run(['--print-config', '--spacing', 'abc', '--cap', '5000', '--max-minutes', '9999', '--spacing', '10'])
const cfg = JSON.parse(r.stdout.split('\n').filter(l => l.startsWith('{'))[0] || '{}')
check('real host: spacing, cap and max-minutes are fixed whatever is typed', cfg.SPACING === 1500 && cfg.CAP === 1500 && cfg.MAX_MINUTES === 180 && cfg.REAL === true, r.stdout)
check('local: --spacing abc is refused', run(['--print-config', '--origin', ORIGIN, '--spacing', 'abc']).status === 2)
check('local: --cap abc is refused', run(['--print-config', '--origin', ORIGIN, '--cap', 'abc']).status === 2)
check('local: --cap 5000 is refused', run(['--print-config', '--origin', ORIGIN, '--cap', '5000']).status === 2)
check('local: --max-minutes abc is refused', run(['--print-config', '--origin', ORIGIN, '--max-minutes', 'abc']).status === 2)
check('another host is refused', run(['--print-config', '--origin', 'https://example.com']).status === 2)
check('--date with a path is refused', run(['--print-config', '--date', '../x']).status === 2)

// 2 a rich site: normalisation, files, redirects, pager, relative links, no duplicates, resume with a comma URL
clean('t-rich'); setMode('rich'); resetHits()
fs.writeFileSync('.agent/t-sitemap.xml', `<urlset><url><loc>${ORIGIN}/doc.pdf</loc></url><url><loc>${ORIGIN}/sitemap-only</loc></url><url><loc>https://other.example/x</loc></url></urlset>`)
r = run([...common('t-rich'), '--sitemap', '.agent/t-sitemap.xml'])
const hits = getHits()
check('run completes', r.status === 0, r.stdout + r.stderr)
check('no GET for a file (sitemap or link); HEAD only', !hits.some(h => h.startsWith('GET /doc.pdf') || h.startsWith('GET /uploads')) && hits.includes('HEAD /doc.pdf') && hits.includes('HEAD /uploads/x'), hits.join(' | '))
check('no request to another host or scheme; sitemap URL on another host ignored', !hits.some(h => /example|invalid/.test(h)))
check('query strings dropped except the pager under /events', !hits.some(h => h.includes('utm') || h.includes('foo=2')) && hits.includes('GET /events?page=2') && hits.includes('GET /events?page=3'), hits.join(' | '))
check('fragments dropped (about requested without #)', hits.includes('GET /about') && !hits.some(h => h.includes('#')))
check('double slash collapsed', hits.includes('GET /dup/path') && !hits.some(h => h.includes('//')))
check('trailing-slash redirect: the exact URL is fetched once and a relative link resolves against it', hits.includes('GET /slash/') && hits.includes('GET /slash/child') && hits.includes('GET /rel/c'), hits.join(' | '))
check('a URL with a comma is fetched', hits.includes('GET /a,b'))
check('no URL requested twice', new Set(hits).size === hits.length, hits.filter((h, i) => hits.indexOf(h) !== i).join(' | '))
check('pager pages wait: every ordinary page already known is fetched before the first pager page', (() => { const urls = logRows('t-rich').map(l => csv(l)[3].replace(ORIGIN, '')); const firstPager = urls.findIndex(u => u.includes('?page=')); const known = ['/events', '/slash', '/rel', '/a,b', '/about', '/Case', '/dup/path', '/events/e1', '/slash/child', '/rel/c', '/sitemap-only']; return firstPager > 0 && known.every(k => { const i = urls.indexOf(k); return i >= 0 && i < firstPager }) })())
const before = logRows('t-rich').length
resetHits(); r = run(common('t-rich'))
check('resume (with a comma URL in the log) makes no new request', getHits().length === 0 && logRows('t-rich').length === before, getHits().join(' | '))
check('log files.json lists the 2 files with the pages that link them', (() => { const f = JSON.parse(fs.readFileSync(path.join(dirOf('t-rich'), 'files.json'), 'utf8')); return Object.keys(f).length === 2 && f[ORIGIN + '/doc.pdf'].pages.includes('sitemap') })())

// 3 caps and limits
clean('t-cap'); resetHits(); setMode('rich')
r = run([...common('t-cap'), '--cap', '5']); check('cap: stops at 5 requests', logRows('t-cap').length === 5 && /CAP reached/.test(r.stdout), r.stdout)
clean('t-slow'); setMode('endless')
r = run([...common('t-slow'), '--max-minutes', '1']); check('rate: checkpoint at 50 requests stops with exit 4 when the cap would take over the limit', r.status === 4 && /CHECKPOINT/.test(r.stdout) && logRows('t-slow').length === 50, r.stdout)
r = run(common('t-slow')); check('rate: the next run refuses to start (exit 5, no request)', r.status === 5 && logRows('t-slow').length === 50, String(r.status))
clean('t-time'); r = run([...common('t-time'), '--max-minutes', '0.01']); check('time guard: total active time over the limit stops the run (exit 4)', r.status === 4 && /active crawl time/.test(r.stdout), r.stdout)

// 4 failures, no retries, stop marker, spacing across a restart, lock
for (const m of ['fail', '403']) {
  clean('t-' + m); setMode(m); resetHits()
  r = run(common('t-' + m)); const rows = logRows('t-' + m)
  check(m + ': 5 consecutive failures stop the run (exit 3) after exactly 6 requests', r.status === 3 && rows.length === 6, r.status + ' ' + rows.length)
  check(m + ': no URL requested twice', new Set(getHits()).size === getHits().length)
  resetHits(); r = run(common('t-' + m)); check(m + ': the next run refuses to start (exit 5) and makes no request', r.status === 5 && getHits().length === 0, String(r.status))
}
clean('t-restart'); setMode('fail')
run(['--date', 't-restart', '--origin', ORIGIN, '--spacing', '1500']); const lastLine = logRows('t-restart').at(-1).split(',')[1]
setMode('rich'); run(['--date', 't-restart', '--origin', ORIGIN, '--spacing', '1500', '--clear-stop', '--cap', '8'])
const second = logRows('t-restart')[6].split(',')[1]
check('spacing holds across a restart (first request of the new process waits for the 1.5 s)', Date.parse(second) - Date.parse(lastLine) >= 1450, (Date.parse(second) - Date.parse(lastLine)) + ' ms')
clean('t-date'); setMode('ratedate'); const t0 = Date.now()
r = run(common('t-date')); const elapsed = Date.now() - t0
check('Retry-After as an HTTP date is waited out (2 requests x about 2 s)', elapsed >= 3000, elapsed + ' ms')
clean('t-lock'); setMode('endless')
const first = spawnSync('sh', ['-c', `node scripts/parity/fetch.mjs --date t-lock --origin ${ORIGIN} --spacing 300 --cap 10 & sleep 1; node scripts/parity/fetch.mjs --date t-lock --origin ${ORIGIN} --spacing 0 --cap 10 > .agent/t-second.out 2>&1; echo $? > .agent/t-second.code; wait`], { encoding: 'utf8' })
check('a second process on the same snapshot is refused (exit 6)', fs.readFileSync('.agent/t-second.code', 'utf8').trim() === '6', fs.readFileSync('.agent/t-second.out', 'utf8'))

for (const d of ['t-rich', 't-cap', 't-slow', 't-time', 't-fail', 't-403', 't-restart', 't-date', 't-lock']) clean(d)
for (const f of ['.agent/t-sitemap.xml', '.agent/t-second.out', '.agent/t-second.code']) fs.rmSync(f, { force: true })
srv.kill(); for (const f of [SERVER, MODE, HITS]) fs.rmSync(f, { force: true })
console.log(results.filter(Boolean).length + ' of ' + results.length + ' checks passed')
process.exit(results.every(Boolean) ? 0 : 1)
