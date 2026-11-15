#!/usr/bin/env node
// Site audit, task A4 (org issue 109), step 1 of 3: every outward link on the built site. Offline: reads files, makes no request.
//
//   npm run build:search && node scripts/parity/a4-links-extract.mjs [--root .output/public] [--out agent/audit] [--date 261106]
//
// Reads every .html file under the build output and collects each absolute http(s) address in an <a href>. That is what a visitor can click on a page
// as it is built: the pages and the content together (a markdown link in a news item is in the page that shows it). It does not see links that
// JavaScript builds in the browser, links in unpublished content (not built), or mailto: and tel: links (counted, not listed).
// Writes agent/audit/:
//   a4-links-<d>.csv        one row per distinct address (the #fragment dropped): host, how many pages have it, one page as an example
//   a4-link-pages-<d>.csv   one row per (address, page): where every link is, for the report's list of dead links by page
//   a4-extract-numbers-<d>.json
// Resources that load a visitor's page (fonts, thumbnails from YouTube, scripts) are counted separately and not checked.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const ROOT = String(argv.root || '.output/public'), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
if (!fs.existsSync(ROOT)) { console.error('no such directory: ' + ROOT + ' (build first)'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }

const files = []
;(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p) } })(ROOT)
files.sort()
const pageOf = f => '/' + path.relative(ROOT, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '')
const links = new Map(), pairs = []
let mailto = 0, tel = 0, resources = 0, occurrences = 0
for (const f of files) {
  const $ = cheerio.load(fs.readFileSync(f, 'utf8')); const page = pageOf(f) || '/'; const seenHere = new Set()
  $('a[href]').each((_, e) => {
    const h = ($(e).attr('href') || '').trim()
    if (/^mailto:/i.test(h)) { mailto++; return }
    if (/^tel:/i.test(h)) { tel++; return }
    if (!/^https?:\/\//i.test(h)) return
    occurrences++
    let u; try { u = new URL(h) } catch { return }
    u.hash = ''; const key = u.href
    if (!links.has(key)) links.set(key, { url: key, host: u.hostname, pages: new Set() })
    links.get(key).pages.add(page)
    if (!seenHere.has(key)) { seenHere.add(key); pairs.push({ url: key, page }) }
  })
  $('iframe[src],img[src],script[src],link[href],source[src],video[src]').each((_, e) => { if (/^https?:\/\//i.test($(e).attr('src') || $(e).attr('href') || '')) resources++ })
}
const rows = [...links.values()].sort((a, b) => a.host.localeCompare(b.host) || a.url.localeCompare(b.url)).map(l => ({ url: l.url, host: l.host, pages: l.pages.size, example_page: [...l.pages][0] }))
const hosts = rows.reduce((o, r) => ((o[r.host] = (o[r.host] || 0) + 1), o), {})
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a4-links-${DATE}.csv`, rows)
writeCsv(`a4-link-pages-${DATE}.csv`, pairs.sort((a, b) => a.url.localeCompare(b.url) || a.page.localeCompare(b.page)))
const nums = { built_html_files: files.length, outward_link_occurrences: occurrences, distinct_addresses: rows.length, distinct_hosts: Object.keys(hosts).length, address_page_pairs: pairs.length, mailto_links: mailto, tel_links: tel, resource_references_not_checked: resources, top_hosts: Object.entries(hosts).sort((a, b) => b[1] - a[1]).slice(0, 15), http_not_https: rows.filter(r => r.url.startsWith('http:')).length }
fs.writeFileSync(path.join(OUT, `a4-extract-numbers-${DATE}.json`), JSON.stringify(nums, null, 2) + '\n')
console.log(JSON.stringify(nums, null, 1))
