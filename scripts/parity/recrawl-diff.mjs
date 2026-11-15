#!/usr/bin/env node
// Site audit, task A1 (org issue 100): compare two snapshots of www.cuahsi.org made by scripts/parity/fetch.mjs.
//
//   node scripts/parity/recrawl-diff.mjs --old 261005 --new 261106 [--out <folder>]
//
// Reads ONLY raw/legacy-site/<old>/ and raw/legacy-site/<new>/ (fetch-log.csv, sitemap.xml, pages/); it never touches the
// network. Run it from the folder that holds raw/ (the main checkout). Writes agent/audit/:
//   recrawl-<new>-urls.csv      one row per URL in either snapshot, with what changed
//   recrawl-<new>-numbers.json  the counts the report quotes
// It does not run parse.mjs, which writes over the committed October inventory in agent/parity/.
//
// Definitions:
//   a URL is "fetched" when the log has a GET row for it with status 200; 3xx, 4xx and the rest are kept as the status
//   hash   sha1 of the text inside <main> (scripts, styles and SVGs removed, whitespace collapsed); '' for a page with no <main>
//   change added      200 in the new snapshot only (absent from the old log, or not 200 there)
//          removed    200 in the old snapshot only
//          changed    200 in both and the hash differs
//          same       200 in both and the hash is equal
//          status     both snapshots have a GET row and the status differs, neither pair above
//          empty      200 in both and <main> holds no text in either: not compared (the hash of nothing is the same for every such page)
//          other      anything else (the same non-200 status in both, or a URL in one snapshot only that is not 200)
//   P8     a URL whose last segment is an email address is written with [email-address-as-path] in its place
//   linked_by_*  distinct fetched pages in that snapshot whose links (navigation and footer included) point to the URL
//   route  the log's note column: how the crawler first found the URL (seed, sitemap, nav, footer, link, ...)
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const OLD = String(argv.old || ''), NEW = String(argv.new || '')
if (!OLD || !NEW) { console.error('usage: recrawl-diff.mjs --old <date> --new <date>'); process.exit(2) }
const ROOT = path.join('raw', 'legacy-site')
const OUT = String(argv.out || path.join('agent', 'audit'))   // --out lets a worktree run from the folder that holds raw/

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const head = rows.shift()
  return rows.filter(r => r.length === head.length).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])))
}
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const decode = u => { try { return decodeURI(u) } catch { return u } }   // the sitemap writes é, the crawler's log writes %C3%A9: compare them the same way
const canon = u => decode(u.replace(/#.*$/, '').replace(/\/$/, ''))
// P8: a link written as a bare email address becomes a path (/community/news/name@host); the address is never written to the output
const safe = u => u.replace(/\/[^/]*@[^/]*$/, '/[email-address-as-path]')

function mainText(file) {
  if (!file || !fs.existsSync(file)) return null
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'))
  const main = $('main').first()
  if (!main.length) return ''
  main.find('script, style, svg, noscript').remove()
  return main.text().replace(/\s+/g, ' ').trim()
}

function snapshot(date) {
  const dir = path.join(ROOT, date)
  const log = parseCsv(fs.readFileSync(path.join(dir, 'fetch-log.csv'), 'utf8'))
  const urls = new Map(), inbound = new Map()   // inbound: URL -> distinct fetched pages that link to it (navigation and footer included)
  for (const r of log) {
    if (r.method !== 'GET') continue
    const u = canon(r.url)
    if (urls.has(u)) continue
    const text = r.status === '200' ? mainText(r.saved) : null
    if (text !== null && r.saved && fs.existsSync(r.saved)) {
      const $ = cheerio.load(fs.readFileSync(r.saved, 'utf8'))
      $('a[href]').each((_, el) => {
        let t; try { t = new URL($(el).attr('href'), r.url) } catch { return }
        if (t.host !== 'www.cuahsi.org') return
        const target = canon(t.origin + t.pathname)
        if (target === u) return
        if (!inbound.has(target)) inbound.set(target, new Set())
        inbound.get(target).add(u)
      })
    }
    urls.set(u, { status: r.status, route: r.note, location: r.location, hash: text === null ? '' : crypto.createHash('sha1').update(text).digest('hex').slice(0, 12), words: text ? text.split(' ').length : 0 })
  }
  const sm = fs.existsSync(path.join(dir, 'sitemap.xml')) ? [...fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => canon(m[1])) : []
  return { urls, sitemap: new Set(sm), requests: log.length, inbound }
}

const o = snapshot(OLD), n = snapshot(NEW)
const all = [...new Set([...o.urls.keys(), ...n.urls.keys()])].sort()
const rows = all.map(u => {
  const a = o.urls.get(u), b = n.urls.get(u)
  const fa = a?.status === '200', fb = b?.status === '200'
  let change
  if (fb && !fa) change = 'added'
  else if (fa && !fb) change = 'removed'
  else if (fa && fb) change = a.hash === b.hash ? 'same' : 'changed'
  else if (a && b && a.status !== b.status) change = 'status'
  else change = 'other'
  // a page with no text in <main> in both snapshots has the same (empty) hash whatever it holds: it was not compared
  if (change === 'same' && a.words === 0 && b.words === 0) change = 'empty'
  return {
    url: safe(u), change, old_status: a?.status ?? '', new_status: b?.status ?? '', old_hash: a?.hash ?? '', new_hash: b?.hash ?? '',
    old_words: a?.words ?? '', new_words: b?.words ?? '', old_route: a?.route ?? '', new_route: b?.route ?? '',
    in_sitemap_old: o.sitemap.has(u), in_sitemap_new: n.sitemap.has(u), linked_by_old: o.inbound.get(u)?.size ?? 0, linked_by_new: n.inbound.get(u)?.size ?? 0, new_location: b?.location ?? '',
  }
})
fs.mkdirSync(OUT, { recursive: true })
const head = Object.keys(rows[0])
fs.writeFileSync(path.join(OUT, `recrawl-${NEW}-urls.csv`), head.join(',') + '\n' + rows.map(r => head.map(h => csvCell(r[h])).join(',')).join('\n') + '\n')

const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
const f200 = s => [...s.urls.values()].filter(v => v.status === '200').length
const sitemapFetched = s => [...s.sitemap].filter(u => s.urls.get(u)?.status === '200').length
const numbers = {
  old: OLD, new: NEW,
  old_urls: o.urls.size, new_urls: n.urls.size, union: all.length,
  old_200: f200(o), new_200: f200(n),
  old_status: count([...o.urls.values()], v => v.status), new_status: count([...n.urls.values()], v => v.status),
  sitemap_old: o.sitemap.size, sitemap_new: n.sitemap.size,
  sitemap_old_fetched_200: sitemapFetched(o), sitemap_new_fetched_200: sitemapFetched(n),
  new_200_not_in_new_sitemap: [...n.urls].filter(([u, v]) => v.status === '200' && !n.sitemap.has(u)).length,
  sitemap_new_not_200: [...n.sitemap].filter(u => n.urls.get(u)?.status !== '200').length,
  change: count(rows, r => r.change),
  new_200_by_route: count([...n.urls.values()].filter(v => v.status === '200'), v => v.route.split(':')[0] || '(none)'),
  added_by_route: count(rows.filter(r => r.change === 'added'), r => r.new_route.split(':')[0] || '(none)'),
  new_200_in_sitemap_not_linked: [...n.urls].filter(([u, v]) => v.status === '200' && n.sitemap.has(u) && !n.inbound.has(u)).length,
  new_200_linked_not_in_sitemap: [...n.urls].filter(([u, v]) => v.status === '200' && !n.sitemap.has(u) && n.inbound.has(u)).length,
  old_200_in_sitemap_not_linked: [...o.urls].filter(([u, v]) => v.status === '200' && o.sitemap.has(u) && !o.inbound.has(u)).length,
  requests_old: o.requests, requests_new: n.requests,
}
fs.writeFileSync(path.join(OUT, `recrawl-${NEW}-numbers.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1))
