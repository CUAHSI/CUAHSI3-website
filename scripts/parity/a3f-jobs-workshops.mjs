#!/usr/bin/env node
// Site audit, task A3f (org issue 107): the legacy job board and workshop pages, against this site's jobs, events, programs and impact stories.
//
//   node scripts/parity/a3f-jobs-workshops.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages [--hand agent/audit/a3f-hand-match-261109.csv] [--out agent/audit]
//
// Reads ONLY the saved legacy pages (never the network), content/jobs, content/events, content/programs, content/research, content/news,
// agent/parity/legacy-inventory.csv (October's typing of each legacy page), agent/audit/cutover-<d>-urls.csv (A2's redirect outcome) and the two files
// that scripts/parity/a3f-live-check.mjs wrote from the live web (a3f-links-<d>.csv, a3f-cited-<d>.csv). Writes agent/audit/:
//   a3f-legacy-jobs-<d>.csv       one row per legacy job address (snapshot pages, October's typed jobs, and the other /job-board addresses A2 knows)
//   a3f-match-jobs-<d>.csv        each legacy job with its best match here, the level, the evidence, and the facts compared
//   a3f-new-jobs-<d>.csv          each job file here (149) with the legacy job it was matched to, whether it is published, and its posting link's verdict
//   a3f-legacy-workshops-<d>.csv  one row per legacy workshop page (21: the 20 October typed workshop and one added since) with dates and location read from the page
//   a3f-match-workshops-<d>.csv   each legacy workshop with its best match here, the level, and the facts compared
//   a3f-control-<d>.csv           the hand-matched control against the script
//   a3f-numbers-<d>.json          the counts
// Levels are October's (agent/reports/261005_parity-stage4.md): exact the title is the same once case, accents, punctuation and a leading "the" are ignored (a job is also
// exact when its apply link equals the posting link here, or the posting link here is the legacy address itself); probable the title words overlap by 0.6 or more AND the dates are
// within 30 days (for a job the legacy side must have a date: an address with only words stays weak; a workshop page always has a date, so that rule is not needed there); weak 0.4 or more; none. The employer is written next to the level as evidence and only adds a weak match when the title overlap
// is 0.3 or more and the employer names share half their words ("org+title"). Never raised to improve a number. E-mail addresses on the legacy site are hidden behind a script
// that is not decoded; they are counted, never read. No address or telephone number is written to any file this script produces.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : ''
if (!SNAP) { console.error('usage: a3f-jobs-workshops.mjs --snapshot <pages folder> [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
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
const clean = s => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const deaccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
const words = s => deaccent(clean(s).toLowerCase()).replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
const nameKey = s => { const w = words(s); if (w[0] === 'the') w.shift(); return w.join(' ') }
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); const i = [...A].filter(x => B.has(x)).length; return A.size + B.size - i ? i / (A.size + B.size - i) : 0 }
const shareOfShort = (a, b) => { const A = new Set(a), B = new Set(b); const i = [...A].filter(x => B.has(x)).length; return Math.min(A.size, B.size) ? i / Math.min(A.size, B.size) : 0 }
const GENERIC = new Set(['university', 'of', 'the', 'and', 'college', 'state', 'department', 'dept', 'institute', 'center', 'centre', 'school', 'for', 'at', 'in', 'a', 'us', 'u', 's', 'inc', 'llc'])
const orgWords = o => words(o).filter(w => !GENERIC.has(w))
const RANK = { exact: 3, probable: 2, weak: 1, none: 0 }
const num = n => Math.round(n * 100) / 100
const tally = (rows, f) => rows.reduce((o, r) => { const k = typeof f === 'function' ? f(r) : r[f]; o[k] = (o[k] || 0) + 1; return o }, {})
const rd = f => fs.readFileSync(f, 'utf8')
const hostPath = u => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '')).toLowerCase() } catch { return clean(u).toLowerCase() } }
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
const isoFromText = s => { const m = (s || '').match(/([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})/); return m && MON[m[1].toLowerCase()] ? `${m[3]}-${String(MON[m[1].toLowerCase()]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}` : '' }
const toIso = d => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : '')
const dayDiff = (a, b) => (a && b ? Math.round(Math.abs(Date.parse(a) - Date.parse(b)) / 864e5) : null)
const front = f => { const t = rd(f); const m = t.match(/^---\n([\s\S]*?)\n---/); return m ? parseYaml(m[1]) : {} }
const numbers = {}
const JOBS = path.join(SNAP, 'job-board'), WORK = path.join(SNAP, 'workshops')

// ---------- legacy jobs ----------
const inv = readCsv('agent/parity/legacy-inventory.csv'), cut = readCsv(path.join(OUT, `cutover-${DATE}-urls.csv`))
const slugOf = u => (u.match(/\/job-board\/([^/?#]+)/) || [])[1] || ''
const LISTLIKE = new Set(['p2', 'graduate-assistantship', 'permanent-position', 'post-doc'])
const YEAR = /^20\d\d$/
const legacy = new Map() // slug -> row
const get = slug => { if (!legacy.has(slug)) legacy.set(slug, { slug, title: '', org: '', posted: '', deadline: '', experience: '', apply: '', hidden_contact: 0, words: 0, in_snapshot: '', october_typed_job: '', in_a2_file: '', clicks: 0, cited_here: '', a2_final: '', a2_final_status: '' }); return legacy.get(slug) }
for (const f of fs.readdirSync(JOBS).filter(f => f.endsWith('.html'))) {
  const slug = f.replace(/\.html$/, ''); if (LISTLIKE.has(slug)) continue
  const $ = cheerio.load(rd(path.join(JOBS, f))); const box = $('div.jobs.detail').first(); const r = get(slug)
  r.title = clean(box.find('h2').first().text()); const h3 = clean(box.find('h3').first().text())
  r.org = clean(h3.split('|')[0]); r.posted = isoFromText(h3); r.deadline = isoFromText(box.find('h4').first().text())
  const dl = {}; box.find('dt').each((_, e) => { dl[clean($(e).text()).replace(/:$/, '')] = $(e).next('dd') })
  r.experience = dl['Experience Level'] ? clean(dl['Experience Level'].text()) : ''
  r.apply = dl['Link to Apply'] ? (dl['Link to Apply'].find('a').attr('href') || '') : ''
  r.hidden_contact = box.find('span[id^="enkoder"]').length; r.words = clean(box.children('p').text()).split(' ').length; r.in_snapshot = 'yes'
}
for (const r of inv.filter(r => r.page_type === 'job')) { const s = slugOf(r.url); const x = get(s); x.october_typed_job = 'yes'; x.title = x.title || clean(r.title); x.posted = x.posted || r.date }
const listing = {}
for (const f of ['../job-board.html', 'p2.html']) { const $ = cheerio.load(rd(path.join(JOBS, f))); listing[f] = $('div.jobs').length }
const a2jobs = cut.filter(r => /\/job-board\/[^/]+/.test(r.url))
for (const r of a2jobs) { const s = slugOf(r.url); if (YEAR.test(s) || LISTLIKE.has(s)) continue; const x = get(s); x.in_a2_file = 'yes'; x.clicks += Number(r.clicks || 0); x.cited_here = r.cited === 'true' ? 'yes' : x.cited_here; x.a2_final = r.final; x.a2_final_status = r.final_status }
for (const r of legacy.values()) { if (!r.title) r.title = r.slug.replace(/-/g, ' '); r.title_from = r.in_snapshot ? 'page' : r.october_typed_job ? 'October inventory' : 'address words' }
const legacyJobs = [...legacy.values()].sort((a, b) => a.slug.localeCompare(b.slug))
numbers.jobs_legacy_addresses = legacyJobs.length
numbers.jobs_legacy_sources = { in_snapshot_now: legacyJobs.filter(j => j.in_snapshot).length, october_typed_job: legacyJobs.filter(j => j.october_typed_job).length, october_typed_job_still_in_snapshot: legacyJobs.filter(j => j.october_typed_job && j.in_snapshot).length, only_in_a2_file: legacyJobs.filter(j => !j.in_snapshot && !j.october_typed_job).length, cited_by_this_site: legacyJobs.filter(j => j.cited_here).length }
numbers.jobs_legacy_listing_blocks = listing
numbers.jobs_legacy_with_clicks = legacyJobs.filter(j => j.clicks).length
numbers.jobs_legacy_clicks_total = legacyJobs.reduce((n, j) => n + j.clicks, 0)
numbers.jobs_legacy_hidden_contact_pages = legacyJobs.filter(j => j.hidden_contact).length
numbers.jobs_legacy_snapshot_with_apply_link = legacyJobs.filter(j => j.apply).length

// ---------- jobs here ----------
const links = readCsv(path.join(OUT, `a3f-links-${DATE}.csv`)), cited = readCsv(path.join(OUT, `a3f-cited-${DATE}.csv`))
const linkOf = Object.fromEntries(links.map(l => [l.file, l]))
const newJobs = fs.readdirSync('content/jobs').filter(f => f.endsWith('.md')).sort().map((f, i) => { const y = front(path.join('content/jobs', f)); return { idx: i + 1, file: f, title: clean(y.title), org: clean(y.organization), posted: toIso(y.posted), deadline: toIso(y.deadline), url: String(y.url || ''), published: y.published === true, source: y.source || '', type: y.type || '', location: clean(y.location) } })
numbers.jobs_new_rows = newJobs.length
numbers.jobs_new_published = newJobs.filter(j => j.published).length
numbers.jobs_new_by_source = tally(newJobs, j => j.source || '(none)')

const LEG_HOST = /(^|\.)cuahsi\.org$/
const matchJob = (lj, nj) => {
  const apply = lj.apply ? hostPath(lj.apply) : '', url = hostPath(nj.url)
  const byUrl = apply && apply === url
  const byLegacyAddress = nj.url && LEG_HOST.test((() => { try { return new URL(nj.url).hostname } catch { return '' } })()) && hostPath(nj.url).endsWith('/job-board/' + lj.slug)
  const lw = words(lj.title), nw = words(nj.title), ow = shareOfShort(orgWords(lj.org), orgWords(nj.org)), j = jaccard(lw, nw)
  const dd = dayDiff(lj.posted, nj.posted)
  let lv = 'none', how = ''
  if (byUrl) { lv = 'exact'; how = 'apply link = posting link' } else if (byLegacyAddress) { lv = 'exact'; how = 'posting link here is the legacy address' }
  else if (nameKey(lj.title) === nameKey(nj.title)) { lv = 'exact'; how = 'same title' }
  else if (j >= 0.6 && dd !== null && dd <= 30) { lv = 'probable'; how = 'title overlap ' + num(j) + ', posted ' + dd + ' days apart'; if (lj.org && nj.org && ow === 0) { lv = 'weak'; how += '; demoted from probable: the employers share no word' } }
  else if (j >= 0.4) { lv = 'weak'; how = 'title overlap ' + num(j) + (dd !== null && dd > 30 ? ', posted ' + dd + ' days apart' : '') + (dd === null && j >= 0.6 ? ', no date on the legacy side: not probable, which needs a date' : '') }
  else if (j >= 0.3 && ow >= 0.5 && lj.org) { lv = 'weak'; how = 'org+title: title overlap ' + num(j) + ', employer words ' + num(ow) }
  return { lv, how, j, ow, dd }
}
const pairs = []
for (const lj of legacyJobs) for (const nj of newJobs) { const m = matchJob(lj, nj); if (m.lv !== 'none') pairs.push({ lj, nj, ...m }) }
pairs.sort((a, b) => RANK[b.lv] - RANK[a.lv] || (b.ow >= 0.5 ? 1 : 0) - (a.ow >= 0.5 ? 1 : 0) || b.j - a.j || (a.dd ?? 99) - (b.dd ?? 99))
const byL = new Map(), usedN = new Set()
for (const p of pairs) if (!byL.has(p.lj) && !usedN.has(p.nj)) { byL.set(p.lj, p); usedN.add(p.nj) }
const matchJobs = legacyJobs.map(lj => {
  const p = byL.get(lj) || null, nj = p ? p.nj : null, lk = nj ? linkOf[nj.file] : null
  return {
    legacy_slug: lj.slug, legacy_title: lj.title, title_from: lj.title_from, on_legacy_site_now: lj.in_snapshot ? 'yes' : 'no (404)', level: p ? p.lv : 'none', evidence: p ? p.how : '',
    new_file: nj ? nj.file : '', new_title: nj ? nj.title : '', new_published: nj ? (nj.published ? 'yes' : 'no') : '',
    employer_same: nj && lj.org ? (shareOfShort(orgWords(lj.org), orgWords(nj.org)) >= 0.5 ? 'same or overlapping' : 'differ') : '', legacy_org: lj.org, new_org: nj ? nj.org : '',
    posted_legacy: lj.posted, posted_new: nj ? nj.posted : '', posted_days_apart: p && p.dd !== null ? p.dd : '', deadline_legacy: lj.deadline, deadline_new: nj ? nj.deadline : '',
    deadline_same: nj && lj.deadline ? (lj.deadline === nj.deadline ? 'same' : (nj.deadline ? 'differ' : 'none here')) : '',
    apply_link_same: nj && lj.apply ? (hostPath(lj.apply) === hostPath(nj.url) ? 'same' : 'differ') : '', new_posting_link_verdict: lk ? lk.verdict : '',
    legacy_hidden_contact: lj.hidden_contact, legacy_clicks: lj.clicks, a2_final_status: lj.a2_final_status
  }
})
const newJobsOut = newJobs.map(nj => { const lk = linkOf[nj.file]; const ms = matchJobs.filter(m => m.new_file === nj.file); return { idx: nj.idx, file: nj.file, title: nj.title, organization: nj.org, posted: nj.posted, published: nj.published, source: nj.source, posting_host: (() => { try { return new URL(nj.url).hostname } catch { return '' } })(), link_status: lk ? lk.status : '', link_verdict: lk ? lk.verdict : '', link_moved_to_other_host: lk && lk.final_url ? (() => { try { return new URL(lk.final_url).hostname !== new URL(nj.url).hostname ? 'yes' : '' } catch { return '' } })() : '', matched_legacy: ms.map(m => m.legacy_slug).join(' ; ') } })
numbers.jobs_levels = Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchJobs.filter(m => m.level === l).length]))
numbers.jobs_levels_by_source = {}
for (const [k, f] of [['in_snapshot_now', j => j.in_snapshot], ['not_in_snapshot_now_but_known', j => !j.in_snapshot]]) { const ids = new Set(legacyJobs.filter(f).map(j => j.slug)); numbers.jobs_levels_by_source[k] = { n: ids.size, ...Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchJobs.filter(m => ids.has(m.legacy_slug) && m.level === l).length])) } }
numbers.jobs_matched_by = tally(matchJobs.filter(m => m.level !== 'none'), m => m.evidence.split(':')[0].replace(/ [\d.]+.*$/, '').replace(/, .*$/, ''))
numbers.jobs_new_without_legacy = newJobsOut.filter(r => !r.matched_legacy).length
numbers.jobs_new_with_legacy = newJobsOut.filter(r => r.matched_legacy).length
numbers.jobs_new_matched_published = tally(matchJobs.filter(m => m.new_file), 'new_published')
numbers.jobs_new_pointing_at_legacy_host = newJobs.filter(j => { try { return LEG_HOST.test(new URL(j.url).hostname) } catch { return false } }).map(j => j.file + ' (published ' + j.published + ')')
numbers.jobs_facts_matched_pairs = (() => { const m = matchJobs.filter(x => x.level === 'exact' || x.level === 'probable'); return { n: m.length, employer: tally(m.filter(x => x.employer_same), 'employer_same'), apply_link: tally(m.filter(x => x.apply_link_same), 'apply_link_same'), deadline: tally(m.filter(x => x.deadline_same), 'deadline_same'), posted_days_apart: m.map(x => x.posted_days_apart).filter(x => x !== '').sort((a, b) => a - b) } })()

// live link results
numbers.jobs_new_links = { checked: links.length, verdicts: tally(links, 'verdict'), by_published: tally(links, l => l.published + ':' + l.verdict), dead_files: links.filter(l => l.verdict === 'dead').map(l => l.file + ' (published ' + l.published + ', ' + (l.url.includes('cuahsi.org') ? 'legacy host' : new URL(l.url).hostname) + ')'), moved: links.filter(l => l.verdict === 'moved').map(l => l.file + ' -> ' + (() => { try { return new URL(l.final_url).hostname + new URL(l.final_url).pathname.slice(0, 20) } catch { return '' } })()) }
numbers.jobs_new_links_by_source_dead = tally(links.filter(l => l.verdict === 'dead'), l => l.source || '(none)')
numbers.cited_eight = tally(cited, 'verdict'); numbers.cited_eight_statuses = tally(cited, 'status'); numbers.cited_eight_with_title = cited.filter(c => c.title || c.h1).length

// legacy side: do the legacy listing's jobs still point at live postings? (not checked; see the report)

// ---------- workshops ----------
const wInvBy = Object.fromEntries(inv.filter(r => /\/workshops\/[^/]+$/.test(r.url)).map(r => [r.url.split('/').pop(), r]))
const NOT_WORKSHOP = new Set(['past-workshops', 'propose-a-workshop'])
const wSlugs = fs.readdirSync(WORK).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')).filter(s => !NOT_WORKSHOP.has(s)).sort()
const legacyWorkshops = wSlugs.map(slug => {
  const r = wInvBy[slug] || { title: '', date: '', page_type: '(not in October inventory)' }, f = path.join(WORK, slug + '.html')
  let title = clean(r.title), start = '', end = '', location = '', hidden = 0, words = 0, applyOpen = ''
  if (fs.existsSync(f)) {
    const $ = cheerio.load(rd(f)); const c = $('div.container.mt-6').first(); const t = clean(c.text())
    title = clean(c.find('h2').first().text()) || title
    const m = t.match(/([A-Z][a-z]+ \d{1,2}, \d{4})\s*[-–]\s*([A-Z][a-z]+ \d{1,2}, \d{4})/) || t.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/)
    start = m ? isoFromText(m[1]) : (r.date || ''); end = m && m[2] ? isoFromText(m[2]) : ''
    const l = t.match(/Location:\s*(.*?)(?=\s+(?:Instructors|Apply|Application|Description|Participants|This |The |Workshop|Course|$))/); location = l ? clean(l[1]) : ''
    hidden = c.find('span[id^="enkoder"]').length; words = t.split(' ').length
    applyOpen = /application period has closed|applications? (?:are|is) closed/i.test(t) ? 'says closed' : ''
  } else start = r.date || ''
  return { slug, title, start, end, location, hidden_contact: hidden, words, application_note: applyOpen, october_type: r.page_type, october_date: r.date }
})
numbers.workshops_legacy = legacyWorkshops.length
numbers.workshops_legacy_typed_workshop_in_october = legacyWorkshops.filter(w => w.october_type === 'workshop').length
numbers.workshops_legacy_added_since_october = legacyWorkshops.filter(w => w.october_type !== 'workshop').map(w => w.slug)
numbers.workshops_legacy_pages_in_folder = fs.readdirSync(WORK).filter(f => f.endsWith('.html')).length
numbers.workshops_legacy_with_hidden_contact = legacyWorkshops.filter(w => w.hidden_contact).length

const cands = []
for (const d of ['events', 'research', 'news']) for (const f of fs.readdirSync(path.join('content', d)).filter(f => f.endsWith('.md'))) {
  const y = front(path.join('content', d, f)); cands.push({ kind: d, file: d + '/' + f, title: clean(y.title), start: toIso(y.start || y.date), end: toIso(y.end), published: y.published !== false, type: y.type || '', location: y.location && typeof y.location === 'object' ? clean([y.location.city, y.location.mode].filter(Boolean).join(', ')) : clean(y.location) })
}
const programs = fs.readdirSync('content/programs').filter(f => f.endsWith('.md')).map(f => { const y = front(path.join('content/programs', f)); return { file: 'programs/' + f, title: clean(y.title) } })
const wPairs = []
for (const lw of legacyWorkshops) for (const c of cands) {
  const j = jaccard(words(lw.title), words(c.title)), dd = dayDiff(lw.start, c.start)
  let lv = 'none'
  if (nameKey(lw.title) === nameKey(c.title)) lv = 'exact'
  else if (j >= 0.6 && (dd === null || dd <= 30)) lv = 'probable'
  else if (j >= 0.4) lv = 'weak'
  if (lv !== 'none') wPairs.push({ lw, c, lv, j, dd })
}
wPairs.sort((a, b) => RANK[b.lv] - RANK[a.lv] || b.j - a.j || (a.dd ?? 999) - (b.dd ?? 999))
const wBy = new Map(), wUsed = new Set()
for (const p of wPairs) if (!wBy.has(p.lw) && !wUsed.has(p.c)) { wBy.set(p.lw, p); wUsed.add(p.c) }
const matchWorkshops = legacyWorkshops.map(lw => {
  const p = wBy.get(lw) || null
  // a series page: the program's title is wholly inside the legacy title (a year page of a recurring workshop)
  const series = p ? null : programs.find(pr => { const a = words(pr.title), b = new Set(words(lw.title)); return a.length >= 2 && a.every(x => b.has(x)) })
  const c = p ? p.c : null
  const sameStart = c && lw.start && c.start ? (lw.start === c.start ? 'same' : 'differ by ' + dayDiff(lw.start, c.start) + ' days') : ''
  const sameEnd = c && lw.end && c.end ? (lw.end === c.end ? 'same' : 'differ') : ''
  return { legacy_slug: lw.slug, legacy_title: lw.title, legacy_start: lw.start, legacy_end: lw.end, legacy_location: lw.location, level: p ? p.lv : 'none', similarity: p ? num(p.j) : '', new_file: c ? c.file : '', new_title: c ? c.title : '', new_kind: c ? c.kind : '', new_published: c ? (c.published ? 'yes' : 'no') : '', new_start: c ? c.start : '', new_end: c ? c.end : '', start_same: sameStart, end_same: sameEnd, new_location: c ? c.location : '', series_page_here: series ? series.file : '', legacy_hidden_contact: lw.hidden_contact, legacy_application_note: lw.application_note }
})
const wNewUsed = new Map(); for (const m of matchWorkshops) if (m.new_file) wNewUsed.set(m.new_file, m.legacy_slug)
numbers.workshops_levels = Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchWorkshops.filter(m => m.level === l).length]))
numbers.workshops_none_with_a_series_page = matchWorkshops.filter(m => m.level === 'none' && m.series_page_here).map(m => m.legacy_title + ' -> ' + m.series_page_here)
numbers.workshops_matched_kinds = tally(matchWorkshops.filter(m => m.new_file), 'new_kind')
numbers.workshops_start_same = tally(matchWorkshops.filter(m => m.start_same), m => m.start_same.startsWith('same') ? 'same' : 'differ')
numbers.workshops_by_year = tally(legacyWorkshops, w => (w.start || '').slice(0, 4))
numbers.workshops_none_by_year = tally(matchWorkshops.filter(m => m.level === 'none'), m => (m.legacy_start || '').slice(0, 4))
numbers.workshops_new_events_of_type_workshop = cands.filter(c => c.kind === 'events' && c.type === 'workshop').length
numbers.workshops_new_events_of_type_workshop_with_legacy = cands.filter(c => c.kind === 'events' && c.type === 'workshop' && wNewUsed.has(c.file)).length
numbers.workshops_new_events_workshop_without_legacy = cands.filter(c => c.kind === 'events' && c.type === 'workshop' && !wNewUsed.has(c.file)).map(c => c.file)

// ---------- cut-over ----------
const sum = rows => ({ addresses: rows.length, clicks: rows.reduce((n, r) => n + Number(r.clicks || 0), 0), final_status: tally(rows, 'final_status') })
numbers.cutover_job_board = sum(cut.filter(r => /\/job-board(\/|$)|\/community\/job-board/.test(r.url)))
numbers.cutover_job_addresses_with_page_snapshot = sum(cut.filter(r => legacy.has(slugOf(r.url)) && legacy.get(slugOf(r.url)).in_snapshot))
numbers.cutover_job_landing = (() => { const r = cut.find(x => x.url.replace(/\/+$/, '') === 'https://www.cuahsi.org/job-board'); return r ? { address: '/job-board', clicks: r.clicks, final: r.final, status: r.final_status } : null })()
numbers.cutover_workshops = sum(cut.filter(r => /\/workshops(\/|$)/.test(r.url)))
numbers.cutover_workshop_pages_matched = sum(cut.filter(r => legacyWorkshops.some(w => r.url.endsWith('/workshops/' + w.slug))))

// ---------- control ----------
let control = []
if (HAND) {
  for (const h of readCsv(HAND)) {
    if (h.kind === 'job') {
      const lj = legacyJobs.find(j => nameKey(j.title) === nameKey(h.legacy_title.replace(/ \(.*\)$/, '').replace(/- Hydrology/, ', Hydrology')) || jaccard(words(j.title), words(h.legacy_title)) >= 0.8)
      const m = lj ? matchJobs.find(x => x.legacy_slug === lj.slug) : null
      const script = !m ? 'legacy row not found' : (m.level === 'exact' || m.level === 'probable' ? 'matched' : 'none')
      control.push({ kind: 'job', legacy: h.legacy_title, hand_new: h.new_file, hand_label: h.hand_label, script_level: m ? m.level : '', script_new: m && m.new_file ? 'content/jobs/' + m.new_file : '', script_label: script, same: script === h.hand_label && (h.hand_label === 'none' || (m && 'content/jobs/' + m.new_file === h.new_file)) ? 'same' : 'DIFFER', note: h.note })
    } else {
      const lw = legacyWorkshops.find(w => nameKey(w.title) === nameKey(h.legacy_title) || jaccard(words(w.title), words(h.legacy_title)) >= 0.8)
      const m = lw ? matchWorkshops.find(x => x.legacy_slug === lw.slug) : null
      const script = !m ? 'legacy row not found' : (m.level === 'exact' || m.level === 'probable' ? 'matched' : 'none')
      control.push({ kind: 'workshop', legacy: h.legacy_title, hand_new: h.new_file, hand_label: h.hand_label, script_level: m ? m.level : '', script_new: m && m.new_file ? 'content/' + m.new_file : '', script_label: script, same: script === h.hand_label && (h.hand_label === 'none' || (m && 'content/' + m.new_file === h.new_file)) ? 'same' : 'DIFFER', note: h.note })
    }
  }
  numbers.control = { rows: control.length, jobs: control.filter(c => c.kind === 'job').length, workshops: control.filter(c => c.kind === 'workshop').length, same: control.filter(c => c.same === 'same').length, differ: control.filter(c => c.same !== 'same').map(c => c.legacy + ' (hand ' + c.hand_label + ', script ' + c.script_level + ')'), by_level: tally(control, 'script_level') }
}

// ---------- write ----------
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3f-legacy-jobs-${DATE}.csv`, legacyJobs.map(j => ({ slug: j.slug, title: j.title, title_from: j.title_from, organization: j.org, posted: j.posted, deadline: j.deadline, experience_level: j.experience, apply_link_host: j.apply ? (() => { try { return new URL(j.apply).hostname } catch { return '' } })() : '', hidden_contact_placeholders: j.hidden_contact, in_snapshot: j.in_snapshot, october_typed_job: j.october_typed_job, in_a2_file: j.in_a2_file, clicks: j.clicks, cited_here: j.cited_here, a2_final_status: j.a2_final_status })))
writeCsv(`a3f-match-jobs-${DATE}.csv`, matchJobs)
writeCsv(`a3f-new-jobs-${DATE}.csv`, newJobsOut)
writeCsv(`a3f-legacy-workshops-${DATE}.csv`, legacyWorkshops)
writeCsv(`a3f-match-workshops-${DATE}.csv`, matchWorkshops)
if (control.length) writeCsv(`a3f-control-${DATE}.csv`, control)
fs.writeFileSync(path.join(OUT, `a3f-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1).slice(0, 12000))
