#!/usr/bin/env node
// Site audit, task A2 (org issue 101): the control for scripts/parity/cutover-sim.mjs. It asks the deployed prototype what it really does
// with a sample of the legacy paths and compares that with what the simulation said. Network: requests to the prototype only (not to
// www.cuahsi.org), one at a time, one second apart.
//
//   node scripts/parity/cutover-control.mjs --date 261106 [--host https://cuahsi3-website.netlify.app]
//
// Each sampled redirect's target is then requested and must end in a 200 on the prototype (up to 3 hops). Sample (about 85 requests): 12 many-to-one, 6 redirect, up to 7 generic, 5 same-path and 20 "404" paths (the 10 with most clicks and 10
// spread evenly), plus the same path of three redirected URLs with a trailing slash, in upper case and with a query string.
// A page that exists answers 200 or a 301 that only adds a slash (the host also ignores case in the path of a page, as /About -> /about/ shows;
// a redirect rule is case-sensitive, control B). The prototype is built from the organisation's main branch, which had the same 322 rules as this branch when this was run; a path whose
// answer differs is listed. Run from the folder that holds agent/audit/.
import fs from 'node:fs'
import path from 'node:path'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = String(argv.date || ''), HOST = String(argv.host || 'https://cuahsi3-website.netlify.app')
if (!DATE) { console.error('usage: cutover-control.mjs --date <date>'); process.exit(2) }
function parseCsv(text) {
  const out = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); out.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  if (cell || row.length) { row.push(cell); out.push(row) }
  const rows = out.filter(r => r.length > 1); const head = rows.shift()
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])))
}
const rows = parseCsv(fs.readFileSync(path.join('agent', 'audit', `cutover-${DATE}-urls.csv`), 'utf8')).filter(r => !r.url.includes('[email'))
const P = u => new URL(u).pathname
const spread = (list, n) => list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor(i * list.length / n)])
const byClass = c => rows.filter(r => r.class === c)
const topClicks = list => [...list].sort((a, b) => Number(b.clicks || 0) - Number(a.clicks || 0))
const f404 = byClass('404')
const sample = [
  ...spread(byClass('many-to-one'), 12), ...spread(byClass('redirect'), 6), ...spread(byClass('generic'), 7), ...spread(byClass('same-path'), 5),
  ...topClicks(f404.filter(r => r.clicks)).slice(0, 10), ...spread(f404, 10),
]
const seen = new Set(); const uniq = sample.filter(r => !seen.has(r.url) && seen.add(r.url))
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ask = async p => {
  const res = await fetch(HOST + p, { redirect: 'manual', headers: { 'User-Agent': 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only)' } })
  const loc = res.headers.get('location') ? new URL(res.headers.get('location'), HOST) : null
  return { status: res.status, location: loc ? loc.pathname : '', search: loc ? loc.search : '' }
}
// follow redirects (at most 3) and return the last status: does the target exist on the prototype?
const land = async p => { let cur = p, got; for (let i = 0; i < 3; i++) { got = await ask(cur); await sleep(1000); if (got.status !== 301 && got.status !== 302) return got.status; cur = got.location }; return got.status }
let agree = 0, differ = 0
console.log(`CONTROL A: the simulation against the deployed prototype, ${uniq.length} legacy paths (host: ${HOST})`)
for (const r of uniq) {
  const expect = r.class === '404' || r.class === 'dead' ? { status: 404 } : r.class === 'same-path' ? { status: 200 } : { status: 301, location: r.final }
  const got = await ask(P(r.url) || '/')
  // a page that exists is served directly, or after the host adds a trailing slash (301 to the same path with "/"); both land on the page
  const own = P(r.url) || '/'
  const slash = r.class === 'same-path' && got.status === 301 && (r.case_variant === 'true' ? got.location.toLowerCase() === own.toLowerCase() + '/' : got.location === own + '/')
  const ok = slash || (got.status === expect.status && (expect.location === undefined || got.location === expect.location))
  ok ? agree++ : differ++
  let landed = ''
  if (ok && expect.status === 301) { const st = await land(got.location); landed = ' target ' + st; if (st !== 200) { agree--; differ++ } }
  console.log(`${ok ? 'agree   ' : 'DIFFERENT'} ${r.class.padEnd(11)} ${(P(r.url) || '/').slice(0, 80)} expected ${expect.status}${expect.location ? ' ' + expect.location : ''} got ${got.status}${got.location ? ' ' + got.location : ''}${landed}`)
  await sleep(1000)
}
console.log(`agree: ${agree} of ${uniq.length}, differ: ${differ}\n\nCONTROL B: the rules' matching behaviour (the same redirected path three ways)`)
for (const r of spread(byClass('redirect').concat(byClass('many-to-one')), 3)) {
  const p = P(r.url)
  for (const [label, q, expectStatus] of [['trailing slash', p + '/', 301], ['upper case', p.toUpperCase(), 404], ['query string', p + '?x=1', 301]]) {
    const got = await ask(q)
    const kept = label !== 'query string' || got.search === '?x=1'   // the query must reach the target
    console.log(`${got.status === expectStatus && kept ? 'agree   ' : 'DIFFERENT'} ${label.padEnd(14)} ${q.slice(0, 70)} expected ${expectStatus} got ${got.status}${got.location ? ' ' + got.location + got.search : ''}`)
    await sleep(1000)
  }
}
