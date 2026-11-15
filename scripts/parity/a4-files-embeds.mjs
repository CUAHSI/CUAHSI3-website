#!/usr/bin/env node
// Site audit, task A4 (org issue 109), step 3 of 3: the legacy site's files and embeds, against this site. Offline: reads saved files, makes no request.
//
//   node scripts/parity/a4-files-embeds.mjs --legacy ../CUAHSI3-website/raw/legacy-site/261106 [--hand agent/audit/a4-hand-match-261109.csv] [--out agent/audit] [--date 261106]
//
// Reads the saved legacy pages (<legacy>/pages), the list of linked files (<legacy>/files.json, with the pages that link each) and the HEAD log of 6 November
// (<legacy>/fetch-log.csv: status, type, size of each file), public/_redirects (the rule for each legacy file address), public/** (what is hosted here), content/**
// and the built site's outward links (agent/audit/a4-links-<d>.csv, from a4-links-extract.mjs), and A2's agent/audit/cutover-<d>-urls.csv.
// Writes agent/audit/:
//   a4-legacy-files-<d>.csv     one row per legacy file (118): type, size, status, pages that link it, clicks, the rule here, whether the target exists, whether this site links to the legacy address
//   a4-legacy-embeds-<d>.csv    one row per embed or outward form/map/video link on the legacy pages, with its counterpart here
//   a4-files-embeds-control-<d>.csv  the hand-matched control against the script
//   a4-files-embeds-numbers-<d>.json
// A legacy file is "hosted" when public/_redirects sends its address to a file that exists under public/ (or to a page), or when a file with the same name is under public/;
// "linked to the legacy host" when no copy is hosted and this site's pages link to the legacy address; otherwise "none". Never raised to improve a number.
// A legacy embed's counterpart: a YouTube video when its 11-character id appears anywhere in this site's content or built pages; any other address when the same address
// (case, scheme, trailing slash and #fragment ignored) is an outward link on this site; otherwise none. E-mail addresses are not read. No address of a person is written.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const LEG = String(argv.legacy || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : ''
if (!LEG) { console.error('usage: a4-files-embeds.mjs --legacy <legacy snapshot folder> [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
const readCsv = file => {
  const rows = []; let row = [], cell = '', q = false; const t = fs.readFileSync(file, 'utf8')
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const h = rows.shift(); return rows.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
}
const rd = f => fs.readFileSync(f, 'utf8')
const walk = (d, ok) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), ok) : (ok(e.name) ? [path.join(d, e.name)] : []))
const dec = u => { try { return decodeURIComponent(u) } catch { return u } }
const norm = u => dec(u).split('#')[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '').toLowerCase()
const tally = (rows, f) => rows.reduce((o, r) => { const k = typeof f === 'function' ? f(r) : r[f]; o[k] = (o[k] || 0) + 1; return o }, {})
const numbers = {}
const PAGES = path.join(LEG, 'pages')

// ---------- files ----------
const filesJson = JSON.parse(rd(path.join(LEG, 'files.json')))
const head = new Map(readCsv(path.join(LEG, 'fetch-log.csv')).filter(r => r.method === 'HEAD').map(r => [dec(r.url), r]))
const cut = readCsv(path.join(OUT, `cutover-${DATE}-urls.csv`)); const cutBy = new Map(cut.map(r => [dec(r.url), r]))
const redirects = new Map(rd('public/_redirects').split('\n').map(l => l.trim().split(/\s+/)).filter(x => x.length >= 2 && x[0].startsWith('/')).map(x => [dec(x[0]), x[1]]))
const publicFiles = walk('public', () => true)
const byName = new Map(); for (const f of publicFiles) { const k = path.basename(f).toLowerCase(); byName.set(k, [...(byName.get(k) || []), f]) }
const hereLinks = readCsv(path.join(OUT, `a4-links-${DATE}.csv`))
const legacyHostUploads = hereLinks.filter(r => /(^|\.)cuahsi\.org$/.test(r.host) && /\/uploads\//.test(r.url))
const hereLinkByNorm = new Map(hereLinks.map(r => [norm(r.url), r]))
const legacyFiles = Object.keys(filesJson).sort().map(url => {
  const p = new URL(url).pathname, name = path.basename(dec(p)), ext = name.split('.').pop().toLowerCase()
  const h = head.get(dec(url)) || {}, cr = cutBy.get(dec(url))
  const rule = redirects.get(dec(p)) || ''
  const targetIsFile = rule.startsWith('/documents/') || /\.[a-z0-9]{2,4}$/i.test(rule)
  // a file target is looked for under public/; a page target under the built site (.output/public/<route>/index.html), which is not there if the site was not built (then it is not counted as existing)
  const targetExists = rule ? (targetIsFile ? fs.existsSync(path.join('public', rule)) : fs.existsSync(path.join('.output/public', rule.split('#')[0], 'index.html'))) : false
  const sameName = byName.get(name.toLowerCase()) || []
  const linkedHere = legacyHostUploads.filter(r => norm(r.url) === norm(url))
  const status = rule && targetExists ? 'hosted' : sameName.length ? 'hosted' : linkedHere.length ? 'linked to the legacy host' : 'none'
  return {
    url, name, ext, bytes: h.bytes || '', head_status: h.status || '', content_type: h.content_type || '', pages_linking: (filesJson[url].pages || []).length,
    a2_clicks: cr ? cr.clicks : '', a2_final_status: cr ? cr.final_status : '', redirect_rule_here: rule, rule_target_exists: rule ? (targetExists ? 'yes' : 'NO') : '', same_name_under_public: sameName.map(f => f.replace(/^public/, '')).join(' ; '),
    linked_from_pages_here: linkedHere.length ? linkedHere.reduce((n, r) => n + Number(r.pages), 0) : 0, status
  }
})
numbers.files_legacy = legacyFiles.length
numbers.files_by_type = tally(legacyFiles, 'ext')
numbers.files_distinct_names = new Set(legacyFiles.map(f => f.name)).size
numbers.files_names_at_more_than_one_address = [...legacyFiles.reduce((m, f) => m.set(f.name, (m.get(f.name) || 0) + 1), new Map()).entries()].filter(([, n]) => n > 1).map(([k, n]) => k + ' x' + n)
numbers.files_head_status = tally(legacyFiles, 'head_status')
numbers.files_total_megabytes = Math.round(legacyFiles.reduce((n, f) => n + Number(f.bytes || 0), 0) / 1e4) / 100
numbers.files_status = tally(legacyFiles, 'status')
numbers.files_status_by_type = Object.fromEntries(['pdf', 'png', 'jpg'].map(t => [t, tally(legacyFiles.filter(f => f.ext === t), 'status')]))
numbers.files_with_redirect_rule = legacyFiles.filter(f => f.redirect_rule_here).length
numbers.files_rule_target_missing = legacyFiles.filter(f => f.rule_target_exists === 'NO').map(f => f.name)
numbers.files_hosted_but_legacy_address_has_no_rule = legacyFiles.filter(f => f.status === 'hosted' && !f.redirect_rule_here).map(f => f.name + ' (a copy is under public/; A2: ' + (f.a2_final_status || 'not in A2 file') + ')')
numbers.files_hosted_by_name_only = legacyFiles.filter(f => f.status === 'hosted' && !f.redirect_rule_here).map(f => f.name)
numbers.files_not_hosted = tally(legacyFiles.filter(f => f.status !== 'hosted'), 'status')
numbers.files_not_hosted_megabytes = Math.round(legacyFiles.filter(f => f.status !== 'hosted').reduce((n, f) => n + Number(f.bytes || 0), 0) / 1e4) / 100
numbers.files_not_hosted_linking_pages = legacyFiles.filter(f => f.status !== 'hosted').reduce((n, f) => n + f.pages_linking, 0)
numbers.files_in_a2_file = legacyFiles.filter(f => f.a2_clicks !== '').length
numbers.files_a2_final = tally(legacyFiles.filter(f => f.a2_final_status), 'a2_final_status')
numbers.files_a2_clicks_not_hosted = legacyFiles.filter(f => f.status !== 'hosted').reduce((n, f) => n + Number(f.a2_clicks || 0), 0)
numbers.files_images = legacyFiles.filter(f => f.ext !== 'pdf').map(f => f.name + ' (' + f.status + ', linked by ' + f.pages_linking + ' pages)')
numbers.files_largest_not_hosted = legacyFiles.filter(f => f.status !== 'hosted').sort((a, b) => Number(b.bytes) - Number(a.bytes)).slice(0, 5).map(f => f.name + ' ' + Math.round(Number(f.bytes) / 1e4) / 100 + ' MB')
numbers.here_links_to_legacy_uploads = { addresses: legacyHostUploads.length, in_the_118: legacyHostUploads.filter(r => legacyFiles.some(f => norm(f.url) === norm(r.url))).length, not_in_the_118: legacyHostUploads.filter(r => !legacyFiles.some(f => norm(f.url) === norm(r.url))).map(r => r.url) }

// ---------- embeds ----------
// the transcripts of cyberseminars are named by video id, so a transcript is not a page that shows the video: left out
const here = [...walk('content', n => /\.(md|json)$/.test(n)).filter(f => !f.includes(path.join('cyberseminars', 'transcripts'))), ...walk('.output/public', n => n.endsWith('.html'))].map(f => rd(f)).join('\n')
const ytId = u => { const m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?(?:[^#]*&)?v=|shorts\/|live\/)|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : '' }
const FORMLIKE = /(jotform|forms\.gle|docs\.google\.com\/forms|hubspot|cvent|eventbrite|calendly|zoom\.us|typeform|surveymonkey|qualtrics|zeffy|givebutter|maps\.google|google\.com\/maps|goo\.gl\/maps|campaign-archive|mailchi|airtable|formstack|wufoo|smartsheet|eventsair|whova)/i
const inv = new Map(readCsv('agent/parity/legacy-inventory.csv').map(r => [r.url.replace(/^https:\/\/www\.cuahsi\.org/, '') || '/', r.page_type]))
const embeds = []
const pageFiles = walk(PAGES, n => n.endsWith('.html')).sort()
for (const f of pageFiles) {
  const route = '/' + path.relative(PAGES, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '')
  const $ = cheerio.load(rd(f)); const seen = new Set()
  const add = (kind, href) => { const key = kind + '|' + href; if (seen.has(key)) return; seen.add(key); embeds.push({ page: route || '/', page_type: inv.get(route) || '', kind, address: href }) }
  $('iframe[src]').each((_, e) => add('iframe', new URL($(e).attr('src'), 'https://www.cuahsi.org').href))
  $('embed[src],object[data],video[src],audio[src]').each((_, e) => add(e.name, new URL($(e).attr('src') || $(e).attr('data'), 'https://www.cuahsi.org').href))
  $('a[href]').each((_, e) => {
    const h = ($(e).attr('href') || '').trim(); if (!/^https?:\/\//i.test(h)) return
    if (ytId(h)) add('video link', h); else if (FORMLIKE.test(h)) add('form, map, event or donation link', h)
  })
}
for (const e of embeds) {
  const id = ytId(e.address); e.youtube_id = id
  if (id) { e.counterpart = here.includes(id) ? 'yes: the id is in this site' : 'none'; e.counterpart_how = here.includes(id) ? 'id found in content or built pages' : '' }
  else { const hit = hereLinkByNorm.get(norm(e.address)); const inPages = !hit && here.includes(e.address.replace(/^https?:\/\//, '')); e.counterpart = hit ? 'yes: same address linked here' : inPages ? 'yes: the same address is embedded or written here' : 'none'; e.counterpart_how = hit ? 'on ' + hit.pages + ' page(s)' : inPages ? 'address found in built pages or content' : '' }
}
const emb = e => e.kind
numbers.embeds_rows = embeds.length
numbers.embeds_by_kind = tally(embeds, 'kind')
numbers.embeds_iframes_by_host = tally(embeds.filter(e => e.kind === 'iframe'), e => new URL(e.address).hostname)
numbers.embeds_iframes_pages = [...new Set(embeds.filter(e => e.kind === 'iframe').map(e => e.page))].length
numbers.embeds_youtube_distinct_ids = new Set(embeds.filter(e => e.youtube_id).map(e => e.youtube_id)).size
numbers.embeds_youtube_iframe_ids = new Set(embeds.filter(e => e.kind === 'iframe' && e.youtube_id).map(e => e.youtube_id)).size
numbers.embeds_youtube_ids_here = new Set(embeds.filter(e => e.youtube_id && e.counterpart.startsWith('yes')).map(e => e.youtube_id)).size
numbers.embeds_youtube_ids_not_here = [...new Set(embeds.filter(e => e.youtube_id && e.counterpart === 'none').map(e => e.youtube_id))].length
numbers.embeds_iframe_other = embeds.filter(e => e.kind === 'iframe' && !e.youtube_id).map(e => e.page + ' -> ' + e.address + ' (' + e.counterpart + ')')
numbers.embeds_iframe_youtube_counterpart = tally(embeds.filter(e => e.kind === 'iframe' && e.youtube_id), 'counterpart')
numbers.embeds_other_links_counterpart = tally(embeds.filter(e => !e.youtube_id && e.kind !== 'iframe'), 'counterpart')
numbers.embeds_other_hosts = tally(embeds.filter(e => !e.youtube_id), e => { try { return new URL(e.address).hostname } catch { return '?' } })
numbers.embeds_by_page_type_with_no_counterpart = tally(embeds.filter(e => e.counterpart === 'none'), 'page_type')
numbers.legacy_pages_scanned = pageFiles.length

// ---------- control ----------
let control = []
if (HAND) {
  for (const h of readCsv(HAND)) {
    if (h.kind === 'file') {
      const f = legacyFiles.find(x => x.name === h.item)
      control.push({ kind: 'file', item: h.item, hand_label: h.hand_label, script_label: f ? f.status : 'row not found', same: f && f.status === h.hand_label ? 'same' : 'DIFFER', note: h.note })
    } else {
      const e = embeds.find(x => x.address.includes(h.item))
      const s = !e ? 'row not found' : e.counterpart.startsWith('yes') ? 'counterpart' : 'none'
      control.push({ kind: 'embed', item: h.item, hand_label: h.hand_label, script_label: s, same: s === h.hand_label ? 'same' : 'DIFFER', note: h.note })
    }
  }
  numbers.control = { rows: control.length, same: control.filter(c => c.same === 'same').length, differ: control.filter(c => c.same !== 'same').map(c => c.item + ' (hand ' + c.hand_label + ', script ' + c.script_label + ')') }
}

fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a4-legacy-files-${DATE}.csv`, legacyFiles)
// an address whose query string holds an e-mail address (an Outlook safelink wraps the recipient's) is written without its query string: C11
const safe = u => (/%40|@/i.test(u.split('?')[1] || '') ? u.split('?')[0] + '?[query removed: it holds an e-mail address]' : u)
writeCsv(`a4-legacy-embeds-${DATE}.csv`, embeds.map(e => ({ page: e.page, page_type: e.page_type, kind: e.kind, address: safe(e.address), youtube_id: e.youtube_id, counterpart: e.counterpart, counterpart_how: e.counterpart_how })))
if (control.length) writeCsv(`a4-files-embeds-control-${DATE}.csv`, control)
fs.writeFileSync(path.join(OUT, `a4-files-embeds-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1))
