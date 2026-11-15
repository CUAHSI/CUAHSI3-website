#!/usr/bin/env node
// Site audit, task A2 (org issue 101): where does every legacy www.cuahsi.org URL land on the new site?
//
//   node scripts/parity/cutover-sim.mjs --a1 agent/audit/recrawl-261106-urls.csv --sc raw/search-console/261106_cuahsi-org_pages.zip --date 261106
//
// Run after `npm run build:search` (it reads .output/public). It never touches the network. It applies the redirect rules the host
// applies (public/_redirects, then the [[redirects]] in netlify.toml) to the path of each legacy URL, follows them, then asks the built
// site whether the final path is a page or a file. The rules are exact paths, 301 or one external 200; this was checked against the
// deployed prototype (agent/audit/cutover-<date>-control.txt, scripts/parity/cutover-control.mjs): a trailing slash does not matter,
// the match is case-sensitive, and a query string is carried to the target.
//
// URL list = the union of three sources, each kept as a flag on the row:
//   a1     every URL the 6 November crawl requested (agent/audit/recrawl-<date>-urls.csv), with its status on the legacy site now
//   cited  URLs cited in newsletters and content (agent/parity/cited-urls.csv, October)
//   gsc    the page rows of the Search Console export (Pages.csv inside the zip): clicks and impressions, last 12 months
// Writes agent/audit/cutover-<date>-urls.csv and cutover-<date>-numbers.json.
//
// class (first that applies):
//   external     the final target is another host (a rewrite)
//   stub         the final page is a meta-refresh stub, not a real redirect
//   dead         a redirect rule leads to a path the built site does not have
//   404          no rule, no page: the visitor gets "not found"
//   chain        more than one redirect before the final path
//   generic      one redirect to a hub page (/, /about, /data-platforms, /learn-train, /community, /hire-cuahsi, /critical-zone-science)
//   many-to-one  one redirect to a page that 10 or more distinct legacy URLs land on (a whole body of work folded into one page: by design
//                for graduate programs, the portals catalog and the document library, so check the body's ruling)
//   redirect     one redirect to a page of the built site
//   same-path    no redirect, the path is a page or file of the built site (column case_variant: it matches only when case is ignored)
// Fan-in (the 10 in many-to-one) is counted over the URLs in this list, so a re-run with more URLs can move a page from redirect to many-to-one.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = String(argv.date || ''), A1 = String(argv.a1 || ''), SC = String(argv.sc || '')
const OUTDIR = String(argv.out || path.join('agent', 'audit')), BUILT = String(argv.built || '.output/public')
if (!DATE || !A1 || !SC) { console.error('usage: cutover-sim.mjs --date <d> --a1 <recrawl urls csv> --sc <search console zip> [--out <folder>] [--built <folder>]'); process.exit(2) }

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
  if (cell || row.length) { row.push(cell); out.push(row) }   // Search Console's files have no newline after the last row
  const rows = out.filter(r => r.length > 1); const head = rows.shift()
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])))
}
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const decode = u => { try { return decodeURI(u) } catch { return u } }
// P8: an address written as a path segment is never written out
const safe = u => u.split('/').map(seg => (seg.includes('@') || /%40/i.test(seg) ? '[email-address-as-path]' : seg)).join('/')
const ORIGIN = 'https://www.cuahsi.org'
const normPath = p => { const q = decode(p.split('#')[0].split('?')[0]); return q.length > 1 ? q.replace(/\/+$/, '') : '/' }
const toPath = u => { try { const x = new URL(u); return x.host === 'www.cuahsi.org' || x.host === 'cuahsi.org' ? normPath(x.pathname) : null } catch { return null } }

// ---- the rules ------------------------------------------------------------------------------------------------------
const rules = new Map()   // path -> { to, status, from: 'line N of public/_redirects' }
fs.readFileSync('public/_redirects', 'utf8').split('\n').forEach((line, i) => {
  if (!line.trim() || line.startsWith('#')) return
  const [from, to, status] = line.trim().split(/\s+/)
  if (!rules.has(normPath(from))) rules.set(normPath(from), { to, status: Number(status), from: `_redirects:${i + 1}` })
})
for (const m of fs.readFileSync('netlify.toml', 'utf8').matchAll(/\[\[redirects\]\]\s*\n\s*from\s*=\s*"([^"]+)"\s*\n\s*to\s*=\s*"([^"]+)"\s*\n\s*status\s*=\s*(\d+)/g))
  if (!rules.has(normPath(m[1]))) rules.set(normPath(m[1]), { to: m[2], status: Number(m[3]), from: 'netlify.toml' })

// ---- the built site -------------------------------------------------------------------------------------------------
const isFile = f => fs.existsSync(f) && fs.statSync(f).isFile()
// Exact case, on any file system: each segment must match a name in the folder as it is spelled (a macOS volume ignores case, Netlify's
// rule matching does not). A path that matches only when case is ignored is returned with a canonical spelling: the host serves such a page
// after a 301 to its own spelling (seen on the prototype: /About goes to /about/), so it lands, and is flagged as a case variant.
function lookup(p, exact) {
  const parts = p.split('/').filter(Boolean); let dir = BUILT; const real = []
  const pick = (names, want) => names.find(n => n === want) ?? (exact ? undefined : names.find(n => n.toLowerCase() === want.toLowerCase()))
  for (let i = 0; i < parts.length; i++) {
    const last = i === parts.length - 1
    const names = fs.existsSync(dir) && fs.statSync(dir).isDirectory() ? fs.readdirSync(dir) : []
    const hit = pick(names, parts[i])
    const html = last ? pick(names, parts[i] + '.html') : undefined
    if (last && !hit && html) return { file: path.join(dir, html), canonical: '/' + [...real, html.replace(/\.html$/, '')].join('/') }
    if (!hit) return null
    real.push(hit); dir = path.join(dir, hit)
  }
  if (isFile(dir)) return { file: dir, canonical: '/' + real.join('/') }
  if (isFile(path.join(dir, 'index.html'))) return { file: path.join(dir, 'index.html'), canonical: '/' + real.join('/') }
  return null
}
function page(p) {
  if (p === '/') return { file: path.join(BUILT, 'index.html'), caseVariant: false }
  const hit = lookup(p, true) ?? lookup(p, false)
  return hit ? { file: hit.file, caseVariant: hit.canonical !== p } : null
}
const isStub = f => /\.html$/.test(f) && /http-equiv="refresh"/i.test(fs.readFileSync(f, 'utf8').slice(0, 4000))

function resolve(p) {
  const chain = []; let cur = p
  for (let i = 0; i < 10; i++) {
    const r = rules.get(normPath(cur))
    if (!r) break
    chain.push({ from: cur, to: r.to, status: r.status, rule: r.from })
    if (/^https?:\/\//.test(r.to)) return { chain, final: r.to, final_status: 'external' }
    cur = normPath(r.to)
  }
  const f = page(cur)
  return { chain, final: cur, final_status: f ? (isStub(f.file) ? 'stub' : '200') : '404', case_variant: f?.caseVariant ?? false }
}

// ---- the URLs -------------------------------------------------------------------------------------------------------
const urls = new Map()   // path -> row
const add = (u, flag, extra = {}) => {
  const p = toPath(u); if (p === null) return
  const row = urls.get(p) ?? { url: ORIGIN + (p === '/' ? '' : p), path: p, a1: false, cited: false, gsc: false, legacy_status: '', clicks: '', impressions: '' }
  row[flag] = true; Object.assign(row, extra); urls.set(p, row)
}
for (const r of parseCsv(fs.readFileSync(A1, 'utf8'))) add(r.url, 'a1', { legacy_status: r.new_status })
for (const r of parseCsv(fs.readFileSync('agent/parity/cited-urls.csv', 'utf8'))) add(r.url, 'cited')
const gsc = parseCsv(execFileSync('unzip', ['-p', SC, 'Pages.csv'], { encoding: 'utf8', maxBuffer: 1 << 26 }))
let gscOtherHost = 0, gscWwwWithQuery = 0; const otherHosts = {}
for (const r of gsc) { if (toPath(r['Top pages']) === null) { gscOtherHost++; const h = new URL(r['Top pages']).host; (otherHosts[h] ??= { rows: 0, clicks: 0 }); otherHosts[h].rows++; otherHosts[h].clicks += Number(r.Clicks); continue }
  if (r['Top pages'].includes('?')) gscWwwWithQuery++
  { const ex = urls.get(toPath(r['Top pages'])); add(r['Top pages'], 'gsc', { clicks: Number(r.Clicks) + (ex?.gsc ? ex.clicks : 0), impressions: Number(r.Impressions) + (ex?.gsc ? ex.impressions : 0) }) } }   // http, https and trailing-slash variants of one path add up

// body and fate (October data; fates are proposals, `agent/parity/dispositions.csv`, apart from the three bodies built and ruled by 6 October)
const bodyOf = new Map(parseCsv(fs.readFileSync('agent/parity/url-bodies.csv', 'utf8')).map(r => [toPath(r.legacy_url), r.body]))
const fates = new Map(parseCsv(fs.readFileSync('agent/parity/dispositions.csv', 'utf8')).map(r => [r.body_or_url, r]))
const BUILT_BODIES = new Set(['Graduate programs directory', 'Water data portals catalog', 'Document library'])   // agent/reports/261006_parity-stage7-status.md

const HUBS = new Set(['/', '/about', '/data-platforms', '/learn-train', '/community', '/hire-cuahsi', '/critical-zone-science'])
const rows = [...urls.values()].sort((a, b) => a.path < b.path ? -1 : 1).map(r => {
  const res = resolve(r.path)
  const body = bodyOf.get(r.path) ?? ''
  const fate = fates.get(body)
  return { ...r, body, fate: fate?.fate ?? '', fate_status: BUILT_BODIES.has(body) ? 'ruled and built' : (fate ? 'proposed' : ''), hops: res.chain.length, rules: res.chain.map(c => c.rule).join(' '), final: res.final, final_status: res.final_status, case_variant: res.case_variant }
})
const fanIn = rows.reduce((m, r) => { if (r.hops) m[r.final] = (m[r.final] || 0) + 1; return m }, {})
for (const r of rows) {
  r.class = r.final_status === 'external' ? 'external' : r.final_status === 'stub' ? 'stub'
    : r.final_status === '404' ? (r.hops ? 'dead' : '404')
    : r.hops > 1 ? 'chain' : r.hops === 1 ? (HUBS.has(r.final) ? 'generic' : fanIn[r.final] >= 10 ? 'many-to-one' : 'redirect') : 'same-path'
  r.fan_in = r.hops ? fanIn[r.final] : ''
}

fs.mkdirSync(OUTDIR, { recursive: true })
const cols = ['url', 'a1', 'cited', 'gsc', 'legacy_status', 'clicks', 'impressions', 'body', 'fate', 'fate_status', 'hops', 'rules', 'final', 'final_status', 'case_variant', 'class', 'fan_in']
fs.writeFileSync(path.join(OUTDIR, `cutover-${DATE}-urls.csv`), cols.join(',') + '\n' + rows.map(r => cols.map(c => csvCell(c === 'url' || c === 'final' ? safe(r[c]) : r[c])).join(',')).join('\n') + '\n')

const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0)
const gscRows = rows.filter(r => r.gsc), live = rows.filter(r => r.legacy_status === '200')
const numbers = {
  date: DATE, rules: rules.size, urls: rows.length,
  sources: { a1: rows.filter(r => r.a1).length, cited: rows.filter(r => r.cited).length, gsc: gscRows.length, gsc_rows_read: gsc.length, gsc_other_host: gscOtherHost, gsc_www_rows_with_query: gscWwwWithQuery, gsc_other_hosts: otherHosts, gsc_total_clicks_all_hosts: sum(gsc, r => r.Clicks), gsc_only: rows.filter(r => r.gsc && !r.a1 && !r.cited).length, a1_and_gsc: rows.filter(r => r.a1 && r.gsc).length },
  class_all: count(rows, r => r.class),
  class_a1_answering_200: count(live, r => r.class), a1_answering_200: live.length,
  class_gsc: count(gscRows, r => r.class),
  clicks_total: sum(gscRows, r => r.clicks),
  clicks_by_class: Object.fromEntries(Object.keys(count(gscRows, r => r.class)).map(k => [k, sum(gscRows.filter(r => r.class === k), r => r.clicks)])),
  clicks_404_or_dead: sum(gscRows.filter(r => r.class === '404' || r.class === 'dead'), r => r.clicks),
  fate_status_a1_200: count(live, r => r.fate_status || '(no body)'),
  fate_status_clicks: Object.fromEntries(Object.entries(count(gscRows, r => r.fate_status || '(no body)')).map(([k]) => [k, sum(gscRows.filter(r => (r.fate_status || '(no body)') === k), r => r.clicks)])),
  case_variants: rows.filter(r => r.case_variant).map(r => safe(r.url)),
  hops: count(rows.filter(r => r.hops), r => r.hops),
  top_targets: Object.entries(fanIn).sort((a, b) => b[1] - a[1]).slice(0, 12),
}
fs.writeFileSync(path.join(OUTDIR, `cutover-${DATE}-numbers.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1))
