#!/usr/bin/env node
// Site audit, task A3b (org issue 103): the events, legacy site against this site.
//
//   node scripts/parity/a3b-events.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages/events [--hand agent/audit/a3b-hand-match-261106.csv] [--elsewhere cyberseminars,workshops] [--out agent/audit]
//
// Reads ONLY the saved legacy pages (raw/legacy-site/<date>/pages/events, written by scripts/parity/fetch.mjs), content/events/*.md and
// content/cyberseminars/*.md; it never touches the network. Writes agent/audit/:
//   a3b-legacy-<d>.csv     one row per legacy event page: title, dates, time, location, links, what is odd about the date
//   a3b-new-<d>.csv        one row per file of content/events
//   a3b-match-<d>.csv      each legacy page with its best match (events first, cyberseminars as a second target), the level, the evidence and the differences
//   a3b-recurring-<d>.csv  legacy pages that share a title (one series), and whether the new site has the series
//   a3b-numbers-<d>.json   counts, and the comparison with the hand-matched control
// A legacy page is one /events/<slug> page. Its dates come from the line under the title: "Month D, YYYY / time", "Month D - D, YYYY",
// or only a deadline written m.d.yyyy.
// Match levels, as in October's parity analysis, never raised to improve a number:
//   exact    the title words are the same (case, punctuation, 4-digit years, words of fewer than 3 letters and the words the, and, for, with, free, part ignored) and the start date is the same
//   probable the title words overlap by 0.6 or more (Jaccard) and the start dates are within 7 days; or the start date is the same and the overlap is 0.34 or more
//   weak     the title words overlap by 0.6 or more on any other date
//   possible the same start date and some title overlap below 0.34 (shown so a person can confirm or reject; not counted as matched)
//   none
// "series_in_new" is separate: the best title overlap with any PUBLISHED new item on any date, so a recurring event whose other dates are on the new
// site is not counted as missing.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
const CRAWL_DAY = String(argv['crawl-day'] || '2026-11-06'), HAND = argv.hand ? String(argv.hand) : ''
if (!SNAP) { console.error('usage: a3b-events.mjs --snapshot <folder> [--hand <csv>] [--out <folder>] [--date <d>] [--crawl-day YYYY-MM-DD]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
const readCsv = file => { // quoted-field reader; the file may lack a trailing newline
  const rows = []; let row = [], cell = '', q = false; const t = fs.readFileSync(file, 'utf8')
  for (let i = 0; i < t.length; i++) { const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += c }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  const h = rows.shift(); return rows.filter(r => r.length > 1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])))
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const mi = s => MONTHS.indexOf(s)
const pad = n => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const dayNum = s => (s ? Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400000 : NaN)
const host = u => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])

// ---- title words ----------------------------------------------------------------------------------------------------
const STOP = new Set(['the', 'and', 'for', 'with', 'free', 'part'])
const words = s => new Set((s ?? '').toLowerCase().replace(/\b20\d\d\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w)))
const jaccard = (a, b) => { const i = [...a].filter(x => b.has(x)).length, u = new Set([...a, ...b]).size; return u ? i / u : 0 }
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x))

// ---- the legacy pages -----------------------------------------------------------------------------------------------
const to24 = (t, ap) => { const m = /(\d{1,2}):(\d{2})/.exec(t); if (!m) return ''; let h = +m[1] % 12; if (/p/i.test(ap)) h += 12; return `${pad(h)}:${m[2]}` }
const legacy = []
for (const f of walk(SNAP).filter(f => f.endsWith('.html')).sort()) {
  const slug = path.relative(SNAP, f).replace(/\.html$/, '')
  const html = fs.readFileSync(f, 'utf8'); const $ = cheerio.load(html)
  const main = $('main').first(); main.find('script, style, svg').remove()
  const heads = main.find('h1, h2').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter(t => t && !/^←/.test(t))
  const title = heads[0] ?? ''
  const text = main.text().replace(/\s+/g, ' ').replace(/^←Events\s*/, '').trim()
  const after = text.startsWith(title) ? text.slice(title.length).trim() : text
  const head = after.slice(0, 260) // the date, time, deadline and location come first
  let start = '', end = '', oddity = ''
  let m
  // the first date printed under the title is the page's date; a later one in the text (the dates of a programme the deadline is for) is not
  const cands = [
    [/([A-Z][a-z]+) (\d{1,2}) - ([A-Z][a-z]+) (\d{1,2}), (\d{4})/, 'cross'], [/([A-Z][a-z]+) (\d{1,2}) - (\d{1,2}), (\d{4})/, 'range'], [/([A-Z][a-z]+) (\d{1,2}), (\d{4})/, 'single'],
  ].map(([re, kind]) => { const x = re.exec(head); return x && mi(x[1]) >= 0 ? { x, kind } : null }).filter(Boolean).sort((a, b) => a.x.index - b.x.index)
  const first = cands[0]
  if (first?.kind === 'cross') { m = first.x; start = iso(+m[5], mi(m[1]), +m[2]); end = iso(+m[5], mi(m[3]), +m[4]) }
  else if (first?.kind === 'range') {
    m = first.x; const mo = mi(m[1]), y = +m[4], d1 = +m[2], d2 = +m[3]
    start = iso(y, mo, d1)
    if (d2 < d1) { const nm = (mo + 1) % 12, ny = mo === 11 ? y + 1 : y; end = iso(ny, nm, d2); oddity = 'range runs into the next month (day after the dash is smaller); read as the next month' }
    else if (d2 === d1) { end = ''; oddity = `range printed as "${m[1]} ${d1} - ${d2}, ${y}" (same day twice); end date unknown` }
    else end = iso(y, mo, d2)
  } else if (first?.kind === 'single') { m = first.x; start = iso(+m[3], mi(m[1]), +m[2]) }
  else if ((m = /^([A-Z][a-z]+) (\d{1,2})(?!\d)/.exec(head)) && mi(m[1]) >= 0) oddity = `date printed without a year ("${m[1]} ${m[2]}")`
  let deadline = '', deadlineLabel = ''
  if ((m = /(Application Deadline|Registration Deadline|Early-Bird Deadline|Early Bird Deadline|Submission Deadline|Proposal Submission Deadline|Evaluation Begins|Deadline to Submit Proposal|Deadline|Apply by|Submit Proposals By[^0-9]*)[: ]*(\d{1,2})\.(\d{1,2})\.(\d{4})/i.exec(head))) { deadlineLabel = m[1].trim(); deadline = iso(+m[4], +m[2] - 1, +m[3]) }
  else if ((m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(head))) { deadlineLabel = 'date'; deadline = iso(+m[3], +m[1] - 1, +m[2]) }
  const tm = /\/ (\d{1,2}:\d{2}) ?([AP]M)?(?: - (\d{1,2}:\d{2}) ?([AP]M))? ?([A-Z]{2,4})?/.exec(head)
  const time = tm ? `${to24(tm[1], tm[2] ?? tm[4] ?? '')}${tm[3] ? '-' + to24(tm[3], tm[4] ?? '') : ''}` : ''
  const tz = tm?.[5] ?? ''
  const lm = /Location:\s*(.*?)(?=\s(?:Register|Apply|Event Website|Event Detail|Event Details|Zoom Link|RSVP|Registration|Join|Submit|Hosted|Host|Speaker|Instructor|Are you|We |CUAHSI|The |This |Interested|Attention)\b|$)/.exec(after)
  const locText = (lm?.[1] ?? '').slice(0, 90).trim()
  const mode = !locText ? '' : /^virtual/i.test(locText) ? 'virtual' : 'in-person'
  const links = []
  main.find('a[href]').each((_, a) => { const href = $(a).attr('href') ?? ''; const t = $(a).text().replace(/\s+/g, ' ').trim()
    if (/^\/events\/?$/.test(href) || /^#/.test(href) || /^mailto:/.test(href)) return
    links.push({ text: t, href }) })
  const hasContact = /email hidden|\bcontact\b|please reach out|questions/i.test(after) || /mailto:/.test(html)
  const regLink = links.find(l => /register|apply|rsvp|submit|zoom|sign up|proposal/i.test(l.text) || /regist|apply|rsvp|jotform|ringcentral|eventbrite|zoom\.us\/(meeting|webinar)/i.test(l.href)) ?? null
  const ext = links.filter(l => /^https?:/.test(l.href) && !/cuahsi\.org/.test(l.href))
  legacy.push({
    page: '/events/' + slug, slug, title, start: start || deadline, end, date_kind: start ? (end ? 'range' : 'single') : deadline ? 'deadline-only' : 'none',
    deadline, deadline_label: deadlineLabel, time, tz, location_text: locText, mode, register_text: regLink?.text ?? '', register_href: regLink?.href ?? '',
    links: links.length, external_links: ext.length, link_hosts: [...new Set(links.map(l => host(l.href)).filter(Boolean))].join(' | '), mentions_contact: hasContact ? 'yes' : '', words: text.split(' ').length,
    upcoming: (start || deadline) && (end || start || deadline) >= CRAWL_DAY ? 'yes' : '', year: (start || deadline || '').slice(0, 4),
    date_oddity: oddity, _words: words(title),
  })
}

// ---- the new site ---------------------------------------------------------------------------------------------------
const readMd = dir => fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
  const t = fs.readFileSync(path.join(dir, f), 'utf8').split(/^---\s*$/m); const d = parseYaml(t[1]) ?? {}; return { file: f, d, body: t.slice(2).join('---') } })
const newEvents = readMd('content/events').map(({ file, d, body }) => {
  const s = String(d.start ?? ''), e = String(d.end ?? '')
  return { file, slug: d.slug, title: d.title, type: d.type, start: s.slice(0, 10), end: e.slice(0, 10), time: /T|\d:\d\d/.test(s) ? s.replace(/^.*?[T ](\d\d:\d\d).*$/, '$1') + (/T|\d:\d\d/.test(e) ? '-' + e.replace(/^.*?[T ](\d\d:\d\d).*$/, '$1') : '') : '',
    tz: d.timezone ?? '', mode: d.location?.mode ?? '', city: d.location?.city ?? '', location_url: d.location?.url ?? '', reg_required: d.registration?.required ?? '', reg_url: d.registration?.url ?? '',
    published: d.published, featured: d.featured ?? '', body_has_email: /@/.test(body + JSON.stringify(d)) ? 'yes' : '', _words: words(String(d.title)) }
})
const newCyber = readMd('content/cyberseminars').map(({ file, d }) => ({ file, slug: d.slug, title: d.title, start: String(d.date ?? '').slice(0, 10), published: d.published, _words: words(String(d.title)) }))

// ---- matching ---------------------------------------------------------------------------------------------------------
const RANK = { exact: 4, probable: 3, weak: 2, possible: 1, none: 0 }
const levelOf = (L, N) => {
  const tj = jaccard(L._words, N._words); const dd = Math.abs(dayNum(L.start) - dayNum(N.start)), days = Number.isNaN(dd) ? Infinity : dd // an undated legacy page is infinitely far from every date
  const same = sameSet(L._words, N._words) && L._words.size > 0
  let level = 'none'
  if (same && days === 0) level = 'exact'
  else if ((tj >= 0.6 && days <= 7) || (days === 0 && tj >= 0.34)) level = 'probable'
  else if (tj >= 0.6) level = 'weak'
  else if (days === 0 && tj > 0) level = 'possible'
  return { level, tj, days }
}
const best = (L, targets) => targets.map(N => ({ N, ...levelOf(L, N) })).sort((a, b) => RANK[b.level] - RANK[a.level] || b.tj - a.tj || a.days - b.days)[0]
const timeOf = s => (s ?? '').split('-')[0]
const matches = legacy.map(L => {
  const e = best(L, newEvents), c = best(L, newCyber)
  const useC = c && RANK[c.level] > (e ? RANK[e.level] : 0)
  const b = useC ? c : e
  const ser = Math.max(0, ...[...newEvents, ...newCyber].filter(N => N.published === true).map(N => jaccard(L._words, N._words))) // only what is live counts as the series being on the site
  const row = { legacy_page: L.page, title: L.title, legacy_start: L.start, legacy_end: L.end, level: b.level, target: b.level === 'none' ? '' : useC ? 'cyberseminars' : 'events', new_file: b.level === 'none' ? '' : b.N.file,
    new_title: b.level === 'none' ? '' : b.N.title, new_published: b.level === 'none' ? '' : String(b.N.published), new_start: b.level === 'none' ? '' : b.N.start, title_overlap: b.level === 'none' ? '' : b.tj.toFixed(2), days_apart: b.level === 'none' || !Number.isFinite(b.days) ? '' : b.days,
    url_same: b.level !== 'none' && b.N.slug && L.slug === b.N.slug ? 'yes' : '', series_in_new: ser >= 0.6 ? 'yes' : '', series_overlap: ser.toFixed(2), differences: '' }
  if ((b.level === 'exact' || b.level === 'probable') && !useC) {
    const N = b.N, d = []
    if (L.start !== N.start) d.push(`start ${L.start} vs ${N.start}`)
    if (L.end && N.end && L.end !== N.end) d.push(`end ${L.end} vs ${N.end}`)
    else if (L.end && !N.end) d.push(`end ${L.end} vs none`)
    else if (!L.end && N.end && N.end !== N.start && L.date_kind !== 'deadline-only') d.push(`end none vs ${N.end}`) // a new end equal to its start is the same single day
    const cutoff = L.time && L.time.split('-')[0] === L.time.split('-')[1] // "11:59 PM - 11:59 PM": a deadline's cut-off, not an event time
    if (L.time && N.time && timeOf(L.time) !== timeOf(N.time)) d.push(`time ${L.time} ${L.tz} vs ${N.time} ${N.tz}`)
    else if (L.time && !N.time && !cutoff) d.push(`time ${L.time} ${L.tz} vs none`)
    if (L.mode && N.mode && ((L.mode === 'virtual') !== (N.mode === 'virtual'))) d.push(`mode ${L.mode} vs ${N.mode}`)
    if (L.mode === 'in-person' && N.city && !L.location_text.toLowerCase().includes(String(N.city).split(',')[0].toLowerCase())) d.push(`place "${L.location_text}" vs "${N.city}"`)
    const lreg = !!L.register_href
    if (lreg && !N.reg_url) d.push('legacy has a register/apply link, new has no registration link')
    else if (lreg && N.reg_url && host(L.register_href) !== host(N.reg_url)) d.push(`register link host ${host(L.register_href)} vs ${host(N.reg_url)}`)
    if (!lreg && N.reg_url && !L.link_hosts.split(' | ').includes(host(N.reg_url))) d.push(`new has a registration link (${host(N.reg_url)}), legacy has no register/apply link and no link to that site`)
    row.differences = d.join('; ')
  }
  return row
})

// ---- new events that duplicate each other (same title words, start dates within 7 days) ------------------------------
const dupPairs = []
newEvents.forEach((A, i) => newEvents.slice(i + 1).forEach(B => { if (jaccard(A._words, B._words) >= 0.6 && Math.abs(dayNum(A.start) - dayNum(B.start)) <= 7) dupPairs.push([A.file, B.file]) }))

// ---- recurring series (legacy pages that share a title) ---------------------------------------------------------------
const key = L => [...L._words].sort().join(' ')
const groups = new Map(); legacy.forEach((L, i) => { const k = key(L); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i) })
const recurring = [...groups.values()].filter(g => g.length >= 2).map(g => {
  const ms = g.map(i => matches[i]), ser = ms.some(r => r.series_in_new === 'yes'), found = ms.filter(r => RANK[r.level] >= 3).length
  return { title: legacy[g[0]].title, pages: g.length, dates: g.map(i => legacy[i].start).sort().join(' | '), series_in_new: ser ? 'yes' : '', instances_matched: found, new_files: [...new Set(ms.filter(r => r.new_file).map(r => r.new_file))].join(' | ') }
}).sort((a, b) => b.pages - a.pages)

// ---- control against the hand-matched list ---------------------------------------------------------------------------
let control = null
if (HAND) {
  const hand = readCsv(HAND); const bySlug = new Map(matches.map(r => [r.legacy_page.replace('/events/', ''), r])); const rows = []
  for (const h of hand) { const r = bySlug.get(h.legacy_slug); rows.push({ legacy_slug: h.legacy_slug, hand: h.hand_level, script: r?.level ?? 'NOT FOUND', agree: r && r.level === h.hand_level ? 'yes' : 'NO', hand_file: h.new_file, script_file: r?.new_file ?? '' }) }
  control = { hand_total: hand.length, agree: rows.filter(r => r.agree === 'yes').length, disagree: rows.filter(r => r.agree !== 'yes') }
}

// ---- new events with no matching /events page: is there one on another legacy section? (--elsewhere a,b = folders under the snapshot's pages/) ----
// Title is the first heading, the date the first "Month D, YYYY" (or "Month D - D, YYYY") under it. A looser read than the one above (it does not handle
// deadlines or the odd ranges), used only to look for a counterpart; the levels are the same.
const elsewhere = []
for (const sub of String(argv.elsewhere || '').split(',').filter(Boolean)) {
  const root = path.join(SNAP, '..', sub); if (!fs.existsSync(root)) { console.error('no such folder: ' + root); process.exit(2) }
  for (const f of walk(root).filter(f => f.endsWith('.html')).sort()) {
    const $ = cheerio.load(fs.readFileSync(f, 'utf8')); const m = $('main').first(); m.find('script, style, svg').remove()
    const title = m.find('h1, h2').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter(t => t && !/^←/.test(t))[0] ?? ''
    const t = m.text().replace(/\s+/g, ' ').trim(); const x = /([A-Z][a-z]+) (\d{1,2})(?: - \d{1,2})?, (\d{4})/.exec(t)
    if (title) elsewhere.push({ page: '/' + sub + '/' + path.relative(root, f).replace(/\.html$/, ''), title, start: x && mi(x[1]) >= 0 ? iso(+x[3], mi(x[1]), +x[2]) : '', _words: words(title) })
  }
}
const claimed = new Set(matches.filter(r => RANK[r.level] >= 3 && r.target === 'events').map(r => r.new_file))
const newElsewhere = elsewhere.length ? newEvents.filter(N => !claimed.has(N.file)).map(N => {
  const b = elsewhere.filter(E => E.start).map(E => ({ E, ...levelOf(E, N) })).sort((a, b) => RANK[b.level] - RANK[a.level] || b.tj - a.tj || a.days - b.days)[0]
  const hit = b && RANK[b.level] >= 1
  return { new_file: N.file, new_title: N.title, new_start: N.start, level: hit ? b.level : 'none', legacy_page: hit ? b.E.page : '', legacy_title: hit ? b.E.title : '', legacy_start: hit ? b.E.start : '', title_overlap: hit ? b.tj.toFixed(2) : '', days_apart: hit ? b.days : '' }
}) : []

// ---- links in the new events that point at www.cuahsi.org (the legacy site) --------------------------------------------
// Each is looked up in A2's cut-over simulation (agent/audit/cutover-<d>-urls.csv): what the address would do once this site is www.cuahsi.org.
const cutFile = path.join(OUT, `cutover-${DATE}-urls.csv`)
const cut = fs.existsSync(cutFile) ? new Map(readCsv(cutFile).map(r => [r.url.replace(/^https?:\/\/www\.cuahsi\.org/, '').replace(/\/$/, '') || '/', r])) : new Map()
const ownLinks = []
for (const N of newEvents) for (const [field, u] of [['location.url', N.location_url], ['registration.url', N.reg_url]]) {
  const m = /^https?:\/\/(?:www\.)?cuahsi\.org(\/[^\s?#]*)?/.exec(u ?? ''); if (!m) continue
  const p = (m[1] ?? '/').replace(/\/$/, '') || '/', r = cut.get(p)
  ownLinks.push({ new_file: N.file, field, path: p, in_a2_list: r ? 'yes' : 'no', legacy_status: r?.legacy_status ?? '', after_cutover: r?.class ?? '' })
}

// ---- numbers and files ------------------------------------------------------------------------------------------------
const count = (rows, f) => rows.reduce((o, r) => ((o[f(r)] = (o[f(r)] ?? 0) + 1), o), {})
const matchedNew = new Set(matches.filter(r => RANK[r.level] >= 3 && r.target === 'events').map(r => r.new_file))
const newNoLegacy = newEvents.filter(N => !matches.some(r => r.new_file === N.file && RANK[r.level] >= 2 && r.target === 'events'))
const byYear = {}; matches.forEach((r, i) => { const y = legacy[i].year || 'no date'; (byYear[y] ??= {}); byYear[y][r.level] = (byYear[y][r.level] ?? 0) + 1 })
const upcoming = matches.filter((r, i) => legacy[i].upcoming === 'yes')
const numbers = {
  crawl_day: CRAWL_DAY, legacy_pages: legacy.length, new_events: newEvents.length, new_events_published: newEvents.filter(N => N.published === true).length, new_cyberseminars_searched: newCyber.length,
  by_level: count(matches, r => r.level), by_target: count(matches.filter(r => r.target), r => r.target), by_year_and_level: byYear,
  none_with_series_in_new: matches.filter(r => r.level === 'none' && r.series_in_new === 'yes').length, none_without_series: matches.filter(r => r.level === 'none' && r.series_in_new !== 'yes').length,
  date_kind: count(legacy, L => L.date_kind), date_oddities: legacy.filter(L => L.date_oddity).map(L => ({ page: L.page, oddity: L.date_oddity })),
  upcoming_legacy: upcoming.length, upcoming_by_level: count(upcoming, r => r.level),
  recurring_groups: recurring.length, recurring_pages: recurring.reduce((n, g) => n + g.pages, 0), recurring_groups_with_series_in_new: recurring.filter(g => g.series_in_new === 'yes').length,
  matched_pairs_with_differences: matches.filter(r => r.differences).length, matched_pairs_compared: matches.filter(r => (r.level === 'exact' || r.level === 'probable') && r.target === 'events').length,
  new_events_matched_exact_or_probable: matchedNew.size, new_events_without_legacy_page_at_weak_or_better: newNoLegacy.length,
  new_events_without_legacy_page: newNoLegacy.map(N => N.file), new_duplicate_pairs: dupPairs, new_elsewhere: elsewhere.length ? { searched_pages: elsewhere.length, searched_dated: elsewhere.filter(E => E.start).length, undated_pages_skipped: elsewhere.filter(E => !E.start).map(E => E.page), new_events_checked: newElsewhere.length, by_level: count(newElsewhere, r => r.level) } : null, new_links_to_legacy_site: { values: ownLinks.length, files: new Set(ownLinks.map(r => r.new_file)).size, distinct_paths: new Set(ownLinks.map(r => r.path)).size, after_cutover: count(ownLinks, r => r.after_cutover || 'not in A2 list') }, url_same: matches.filter(r => r.url_same).length,
  legacy_pages_with_no_date: legacy.filter(L => !L.start).map(L => L.page), control,
}
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3b-legacy-${DATE}.csv`, legacy.map(({ _words, ...r }) => r))
writeCsv(`a3b-new-${DATE}.csv`, newEvents.map(({ _words, ...r }) => r))
writeCsv(`a3b-match-${DATE}.csv`, matches)
if (newElsewhere.length) writeCsv(`a3b-new-elsewhere-${DATE}.csv`, newElsewhere)
if (ownLinks.length) writeCsv(`a3b-new-links-${DATE}.csv`, ownLinks)
writeCsv(`a3b-recurring-${DATE}.csv`, recurring.length ? recurring : [{ title: '' }])
fs.writeFileSync(path.join(OUT, `a3b-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify({ legacy_pages: numbers.legacy_pages, by_level: numbers.by_level, by_target: numbers.by_target, none_with_series_in_new: numbers.none_with_series_in_new, upcoming_by_level: numbers.upcoming_by_level, recurring_groups: numbers.recurring_groups, control: control && { agree: control.agree, of: control.hand_total, disagree: control.disagree } }, null, 1))
