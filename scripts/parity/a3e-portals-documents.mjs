#!/usr/bin/env node
// Site audit, task A3e (org issue 106): the water data portals and the document library, legacy site against this site.
//
//   node scripts/parity/a3e-portals-documents.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages \
//        [--docs-src ../CUAHSI3-website/.agent/docs-src] [--hand agent/audit/a3e-hand-match-261109.csv] [--out agent/audit]
//
// Reads ONLY the saved legacy pages (never the network), content/data-portals/portals.json, content/documents/documents.json,
// public/documents/** (the hosted PDFs; page counts and first-page text through pdfinfo and pdftotext, which must be on the PATH),
// agent/parity/legacy-files.csv (size and HTTP status of each legacy file, from the re-crawl of 6 November 2026),
// agent/parity/documents-sources.csv (October's record of which legacy file each hosted copy was made from),
// agent/audit/cutover-<d>-urls.csv (the redirect outcome), public/_redirects (the rule for each legacy file address, compared with the title and date pairing) and, if given, --docs-src (the legacy files as downloaded in October; scratch, gitignored).
// Writes agent/audit/:
//   a3e-legacy-portals-<d>.csv     one row per legacy portal page (44): title, address word, accession date, owner, website, scope, link to data, API, export formats
//   a3e-new-portals-<d>.csv        one row per portal here (44), with the legacy portal it was matched to
//   a3e-match-portals-<d>.csv      each legacy portal with its best match here, the level, and the facts compared (owner, scope, website)
//   a3e-legacy-documents-<d>.csv   one row per legacy library entry: title, list page, item page, file address, size now, HTTP status, October size
//   a3e-new-documents-<d>.csv      one row per document here (61), with the legacy entry it was matched to
//   a3e-match-documents-<d>.csv    each legacy entry with its best match here, the level (by title) and the date key
//   a3e-files-<d>.csv              each hosted file: opens, size, pages, first-page text check, the legacy file's size and page count
//   a3e-unhosted-<d>.csv           legacy entries with no document here
//   a3e-legacyhost-<d>.csv         references to the legacy host in the portal and document data, and in the two pages that show them
//   a3e-control-<d>.csv            the hand-matched control against the script
//   a3e-numbers-<d>.json           the counts, and the comparison with the hand-matched control
// Match levels are October's (agent/reports/261005_parity-stage4.md), never raised to improve a number:
//   exact     the title is the same once case, accents, punctuation and a leading "the" are ignored
//   probable  the title words overlap by 0.6 or more (Jaccard)
//   weak      0.4 or more
//   none
// "Matched" means exact or probable. The date key (same year and month for minutes; same year for a report; same years for a plan) is written next to the level
// and does NOT change it. E-mail addresses on the legacy site are hidden behind a script that is not decoded; they are counted as placeholders, never read.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : '', SRC = argv['docs-src'] ? String(argv['docs-src']) : ''
if (!SNAP) { console.error('usage: a3e-portals-documents.mjs --snapshot <pages folder> [--docs-src <folder>] [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows, header) => { const h = header || Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
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
const levelOf = (a, b) => { if (nameKey(a) === nameKey(b)) return ['exact', 1]; const j = jaccard(words(a), words(b)); return j >= 0.6 ? ['probable', j] : j >= 0.4 ? ['weak', j] : ['none', j] }
const RANK = { exact: 3, probable: 2, weak: 1, none: 0 }
const hostPath = u => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase() } catch { return clean(u).toLowerCase() } }
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
const rd = f => fs.readFileSync(f, 'utf8')
const num = n => Math.round(n * 100) / 100
const numbers = {}
const LEGACY_HOST = /(^|\.)cuahsi\.org$/

// ---------- portals ----------
const PD = path.join(SNAP, 'community', 'water-data-portals')
const stubs = fs.readdirSync(PD).filter(f => f.endsWith('.html')).sort()
const listPages = stubs.filter(f => /^p\d+\.html$/.test(f)), detailFiles = stubs.filter(f => !/^p\d+\.html$/.test(f))
const optionNames = new Set()
for (const f of ['../water-data-portals.html', ...listPages]) {
  const $ = cheerio.load(rd(path.join(PD, f)))
  $('option').each((_, e) => { const v = $(e).attr('value') || ''; if (v.includes('/water-data-portals/')) optionNames.add(v.split('/').pop()) })
  $('h2').each((_, e) => { const a = $(e).find('a').attr('href') || ''; if (a.includes('/water-data-portals/')) optionNames.add(a.split('/').pop()) })
}
const legacyPortals = detailFiles.map(f => {
  const $ = cheerio.load(rd(path.join(PD, f))); const box = $('div.jobs.detail').first()
  const dl = {}; box.find('dt').each((_, e) => { const k = clean($(e).text()).replace(/:$/, ''); dl[k] = clean($(e).next('dd').text()) })
  const web = box.find('dt:contains("Website")').next('dd').find('a').attr('href') || dl['Website'] || ''
  return {
    stub: f.replace(/\.html$/, ''), title: clean(box.find('h2').first().text()), accession: clean(box.find('h3').first().text()).replace(/^Accession Date:\s*/i, ''),
    description: clean(box.children('p').first().text()), owner: dl['Site Owner'] || '', website: clean(web), scope: dl['Geographical Scope'] || '', link_to_data: dl['Link to Data'] || '',
    api: dl['API'] || '', export_formats: dl['Data Export Formats'] || '', has_restrictions: Object.keys(dl).includes('Restrictions') ? 'yes' : '', labelled_fields: Object.keys(dl).length, hidden_contact: box.find('span[id^="enkoder"]').length, in_list_menu: optionNames.has(f.replace(/\.html$/, ''))
  }
})
numbers.portals_legacy_detail_pages = legacyPortals.length
numbers.portals_legacy_list_pages = listPages.length + 1
numbers.portals_in_list_menu = optionNames.size
numbers.portals_detail_without_menu_entry = legacyPortals.filter(p => !p.in_list_menu).map(p => p.stub)
numbers.portals_menu_without_detail_page = [...optionNames].filter(s => !detailFiles.includes(s + '.html'))

const newPortalsRaw = JSON.parse(rd('content/data-portals/portals.json'))
const newPortals = newPortalsRaw.map((r, i) => ({ idx: i + 1, ...r }))
const normScope = s => clean(s).toLowerCase()
const normOwner = s => words(s).join(' ')
// one-to-one: score every pair, give the best pairs first, and never use a row here twice
const assign = (legacy, news, titleOf, newTitleOf, restrict) => {
  const pairs = []
  for (const l of legacy) for (const n of (restrict ? restrict(l, news) : news)) { const [lv, sc] = levelOf(titleOf(l), newTitleOf(n)); if (lv !== 'none') pairs.push({ l, n, lv, sc }) }
  pairs.sort((x, y) => RANK[y.lv] - RANK[x.lv] || y.sc - x.sc)
  const byL = new Map(), usedN = new Set()
  for (const p of pairs) if (!byL.has(p.l) && !usedN.has(p.n)) { byL.set(p.l, p); usedN.add(p.n) }
  return byL
}
const portalPairs = assign(legacyPortals, newPortals, p => p.title, np => np.name)
const matchPortals = legacyPortals.map(lp => {
  const hit = portalPairs.get(lp) || null
  const urlHit = newPortals.find(np => hostPath(np.url) === hostPath(lp.website))
  const np = hit ? hit.n : null
  return {
    legacy_stub: lp.stub, legacy_title: lp.title, level: hit ? hit.lv : 'none', similarity: hit ? num(hit.sc) : '', new_index: np ? np.idx : '', new_name: np ? np.name : '',
    website_same_address: np ? (hostPath(np.url) === hostPath(lp.website) ? 'same' : (hostOf(np.url) === hostOf(lp.website) ? 'same host, different path' : 'differ')) : '',
    website_scheme: np && hostPath(np.url) === hostPath(lp.website) ? (np.url.split(':')[0] === lp.website.split(':')[0] ? 'same' : `legacy ${lp.website.split(':')[0]}, here ${np.url.split(':')[0]}`) : '',
    website_found_at_other_row: !np && urlHit ? urlHit.name : '',
    owner_same: np ? (normOwner(np.owner || '') === normOwner(lp.owner) ? 'same' : (!np.owner ? 'empty here' : (!lp.owner ? 'empty there' : 'differ'))) : '',
    scope_same: np ? (normScope(np.scope || '') === normScope(lp.scope) ? 'same' : (!np.scope ? 'empty here' : (!lp.scope ? 'empty there' : 'differ'))) : '',
    legacy_owner: lp.owner, new_owner: np ? np.owner || '' : '', legacy_scope: lp.scope, new_scope: np ? np.scope || '' : '', legacy_website: lp.website, new_url: np ? np.url : '',
    legacy_link_to_data: lp.link_to_data, legacy_api: lp.api, legacy_formats: lp.export_formats, legacy_accession: lp.accession, new_last_reviewed: np ? np.last_reviewed || '' : '', legacy_host_website: LEGACY_HOST.test(hostOf(lp.website)) ? 'yes' : ''
  }
})
const usedNew = new Map(); for (const m of matchPortals) if (m.new_index) usedNew.set(m.new_index, [...(usedNew.get(m.new_index) || []), m.legacy_stub])
numbers.portals_new_rows = newPortals.length
numbers.portals_levels = Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchPortals.filter(m => m.level === l).length]))
numbers.portals_new_matched_twice = [...usedNew.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => ({ new_index: k, legacy: v }))
numbers.portals_new_without_legacy = newPortals.filter(np => !usedNew.has(np.idx)).map(np => np.name)
const pm = matchPortals.filter(m => m.new_index)
const tally = (rows, k) => rows.reduce((o, r) => ((o[r[k]] = (o[r[k]] || 0) + 1), o), {})
numbers.portals_website = tally(pm, 'website_same_address'); numbers.portals_website_scheme = tally(pm.filter(m => m.website_scheme), 'website_scheme')
numbers.portals_owner = tally(pm, 'owner_same'); numbers.portals_scope = tally(pm, 'scope_same')
numbers.portals_legacy_hidden_contact = legacyPortals.reduce((n, p) => n + p.hidden_contact, 0)
numbers.portals_legacy_hidden_contact_pages = legacyPortals.filter(p => p.hidden_contact).length
numbers.portals_legacy_with_accession_date = legacyPortals.filter(p => p.accession).length
numbers.portals_legacy_link_to_data = tally(legacyPortals, 'link_to_data'); numbers.portals_legacy_api = tally(legacyPortals, 'api')
numbers.portals_legacy_with_formats = legacyPortals.filter(p => p.export_formats && !/^(na|n\/a|)$/i.test(p.export_formats)).length
numbers.portals_legacy_with_restrictions_field = legacyPortals.filter(p => p.has_restrictions).length
numbers.portals_legacy_with_description = legacyPortals.filter(p => p.description).length
numbers.portals_new_with_review_date = newPortals.filter(p => p.last_reviewed).length
numbers.portals_legacy_website_on_legacy_host = legacyPortals.filter(p => LEGACY_HOST.test(hostOf(p.website))).map(p => p.title)
numbers.portals_new_url_on_legacy_host = newPortals.filter(p => LEGACY_HOST.test(hostOf(p.url))).map(p => p.name)
numbers.portals_legacy_website_empty = legacyPortals.filter(p => !p.website).length

// ---------- documents ----------
const LIB = path.join(SNAP, 'about', 'library')
const LISTS = [['annual-reports.html', 'Annual Reports'], ['board-and-membership-minutes.html', 'Board and membership minutes'], ['strategic-plans.html', 'Strategic Plans'], ['reports-and-publications.html', 'Reports and publications'], ['reports-and-publications/p2.html', 'Reports and publications']]
const abs = u => (u.startsWith('http') ? u : 'https://www.cuahsi.org' + u)
const legacyFiles = new Map(readCsv('agent/parity/legacy-files.csv').map(r => [r.url, r]))
const legacyDocs = []
for (const [file, group] of LISTS) {
  const $ = cheerio.load(rd(path.join(LIB, file))); let lastH2 = ''; const seen = new Set()
  $('h2, a[href*="/uploads/"]').each((_, e) => {
    if (e.name === 'h2') { lastH2 = clean($(e).text()); return }
    const href = $(e).attr('href'); const text = clean($(e).text())
    if (seen.has(href)) return
    seen.add(href)
    const title = /^download document$/i.test(text) ? lastH2 : text
    legacyDocs.push({ group, list_page: '/about/library/' + file.replace(/\.html$/, ''), title, file_path: href.replace(/^https?:\/\/www\.cuahsi\.org/, '') })
  })
}
// policies: the bylaws file linked from the policies page, and the two policy pages that hold the text itself
{
  const $ = cheerio.load(rd(path.join(SNAP, 'about', 'policies-and-conduct.html')))
  $('a[href*="/uploads/"]').each((_, e) => { const href = $(e).attr('href'); if (!legacyDocs.some(d => d.file_path === href.replace(/^https?:\/\/www\.cuahsi\.org/, ''))) legacyDocs.push({ group: 'Policies', list_page: '/about/policies-and-conduct', title: 'CUAHSI Bylaws', file_path: href.replace(/^https?:\/\/www\.cuahsi\.org/, '') }) })
  for (const [p, t] of [['travel-policy.html', '/travel-policy'], ['authorship-agreement-water-prediction-innovators-summer-institute.html', '/authorship-agreement-water-prediction-innovators-summer-institute']]) {
    const $$ = cheerio.load(rd(path.join(SNAP, p))); legacyDocs.push({ group: 'Policies (a page, no file)', list_page: t, title: clean($$('h2').first().text()), file_path: '' })
  }
}
// item pages
const itemPages = []
for (const f of fs.readdirSync(LIB).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.replace(/\.html$/, ''); if (['annual-reports', 'board-and-membership-minutes', 'strategic-plans', 'reports-and-publications'].includes(slug)) continue
  const $ = cheerio.load(rd(path.join(LIB, f)))
  itemPages.push({ slug, title: clean($('h2').first().text()), files: [...new Set($('a[href*="/uploads/"]').map((_, e) => $(e).attr('href')).get())] })
}
const base = p => decodeURIComponent((p || '').split('/').pop())
for (const d of legacyDocs) {
  const ip = itemPages.find(i => d.file_path && i.files.some(x => base(x) === base(d.file_path)))
  d.item_page = ip ? '/about/library/' + ip.slug : ''; d.item_title = ip ? ip.title : ''
  const key = d.file_path ? abs(d.file_path) : ''
  const lf = key ? [...legacyFiles.keys()].find(k => decodeURI(k) === decodeURI(key)) : ''
  d.file_url = key; d.size_now = lf ? legacyFiles.get(lf).size_bytes : ''; d.head_status = lf ? legacyFiles.get(lf).head_status : (key ? 'not in the file list' : '')
  d.in_uploads_library_doc = d.file_path.includes('/uploads/library/doc/') ? 'yes' : (d.file_path ? 'no' : '')
  const oct = SRC && d.file_path ? path.join(SRC, base(d.file_path)) : ''
  d.october_size = oct && fs.existsSync(oct) ? fs.statSync(oct).size : ''
}
numbers.docs_legacy_entries = legacyDocs.length
numbers.docs_legacy_entries_with_file = legacyDocs.filter(d => d.file_path).length
numbers.docs_legacy_by_group = tally(legacyDocs, 'group')
numbers.docs_item_pages = itemPages.length
numbers.docs_entries_without_item_page = legacyDocs.filter(d => d.file_path && !d.item_page).map(d => d.title)
numbers.docs_item_pages_not_in_a_list = itemPages.filter(i => !legacyDocs.some(d => d.item_page === '/about/library/' + i.slug)).map(i => i.slug + ' (' + i.title + ')')
numbers.docs_title_differs_list_vs_item = legacyDocs.filter(d => d.item_title && nameKey(d.item_title) !== nameKey(d.title)).map(d => d.title + ' / ' + d.item_title)
numbers.docs_legacy_file_status = tally(legacyDocs.filter(d => d.file_path), 'head_status')
numbers.docs_legacy_files_not_under_library_doc = legacyDocs.filter(d => d.in_uploads_library_doc === 'no').length
numbers.docs_legacy_size_changed_since_october = legacyDocs.filter(d => d.october_size !== '' && d.size_now !== '' && Number(d.october_size) !== Number(d.size_now)).map(d => d.title)
numbers.docs_legacy_with_october_copy = legacyDocs.filter(d => d.october_size !== '').length

const newDocs = JSON.parse(rd('content/documents/documents.json')).map((r, i) => ({ idx: i + 1, ...r }))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const dateKey = t => {
  const w = words(t); const years = w.filter(x => /^(19|20)\d\d$/.test(x)); const m = w.find(x => MONTHS.includes(x))
  if (/minutes/.test(w.join(' ')) || /^(december 5 2018)$/.test(w.join(' '))) return years[0] && m ? years[0] + '-' + m : ''
  if (/annual report/.test(w.join(' '))) return years[0] || ''
  if (/strategic plan/.test(w.join(' '))) return years.sort().join('-')
  return ''
}
const kindOfLegacy = d => /minutes/i.test(d.title) || d.list_page.endsWith('board-and-membership-minutes') ? 'minutes' : /annual report/i.test(d.title) ? 'report' : /strategic plan/i.test(d.title) ? 'plan' : /bylaws/i.test(d.title) ? 'governance' : /policy|agreement/i.test(d.title) ? 'policy' : 'other'
const newKey = n => {
  if (n.kind === 'minutes') { const d = new Date((n.date || '') + 'T00:00:00Z'); return isNaN(d) ? '' : d.getUTCFullYear() + '-' + MONTHS[d.getUTCMonth()] }
  if (n.kind === 'report') return String(n.year || '')
  if (n.kind === 'plan') return words(n.title).filter(x => /^(19|20)\d\d$/.test(x)).sort().join('-')
  return ''
}
for (const d of legacyDocs) { d.kind_guess = kindOfLegacy(d); d.date_key = d.list_page.endsWith('board-and-membership-minutes') && /^December 5, 2018/.test(d.title) ? '2018-december' : dateKey(d.title) }
// one-to-one, as for the portals. A legacy entry with a date key (a meeting's month, a report's year, a plan's years) is paired only with a row here of the same kind
// and the same key when there is one; the level is still the title's, and the key never raises it. A pair below "weak" is not made.
const keyed = (l, news) => { const same = l.date_key ? news.filter(n => n.kind === l.kind_guess && newKey(n) === l.date_key) : []; return same.length ? same : news }
const docPairs = assign(legacyDocs, newDocs, d => d.title, n => n.title, keyed)
const matchDocs = legacyDocs.map(ld => {
  const hit = docPairs.get(ld) || null
  const sameKey = ld.date_key ? newDocs.filter(nd => nd.kind === ld.kind_guess && newKey(nd) === ld.date_key) : []
  return {
    legacy_title: ld.title, group: ld.group, kind_guess: ld.kind_guess, level_by_title: hit ? hit.lv : 'none', similarity: hit ? num(hit.sc) : '', new_index: hit ? hit.n.idx : '', new_title: hit ? hit.n.title : '',
    date_key: ld.date_key, same_date_key_here: sameKey.map(n => n.idx + ' ' + n.title).join(' ; '), date_key_candidates: sameKey.length,
    legacy_file: ld.file_path ? base(ld.file_path) : '(a page, no file)', provenance_note: ''
  }
})
// the redirect rule for each legacy file address (public/_redirects): does it send the file to the row here that the title and date pairing chose?
const redir = new Map(rd('public/_redirects').split('\n').map(l => l.trim().split(/\s+/)).filter(x => x.length >= 2 && x[0].startsWith('/')).map(x => { let k = x[0]; try { k = decodeURIComponent(k) } catch {} return [k, x[1]] }))
for (const ld of legacyDocs) {
  const m = matchDocs.find(x => x.legacy_title === ld.title && x.legacy_file === (ld.file_path ? base(ld.file_path) : '(a page, no file)'))
  const rule = ld.file_path ? redir.get(decodeURIComponent(ld.file_path)) : redir.get(ld.list_page)
  ld.redirect_to = rule || ''
  const nd = m && m.new_index ? newDocs.find(n => n.idx === m.new_index) : null
  ld.redirect_check = !ld.file_path ? '' : (!rule ? 'no rule' : (!nd ? (rule.startsWith('/documents/') ? 'rule to a hosted file; no title pairing' : 'rule to a page') : (nd.file === rule ? 'same as the title pairing' : 'DIFFERS: pairing is ' + nd.file)))
}
numbers.docs_file_redirect_check = tally(legacyDocs.filter(d => d.file_path), 'redirect_check')
numbers.docs_file_redirect_differs = legacyDocs.filter(d => d.redirect_check.startsWith('DIFFERS')).map(d => d.title + ' -> ' + d.redirect_to + ' / ' + d.redirect_check)
numbers.docs_file_no_rule = legacyDocs.filter(d => d.redirect_check === 'no rule').map(d => d.title)
numbers.docs_file_redirect_to_missing_file = legacyDocs.filter(d => d.redirect_to.startsWith('/documents/') && !fs.existsSync(path.join('public', d.redirect_to))).map(d => d.title)

// October's provenance record: which legacy file each hosted copy was made from
const prov = readCsv('agent/parity/documents-sources.csv')
const provByHosted = new Map(prov.map(r => [r.hosted_as, r]))
const provBase = r => { const m = (r.legacy_file || '').match(/([^/\s]+\.pdf)/); return m ? decodeURIComponent(m[1]) : '' }
for (const m of matchDocs) {
  const nd = newDocs.find(n => n.idx === m.new_index); const pr = nd ? provByHosted.get(nd.file) : null
  if (nd) m.provenance_note = !pr ? 'no row in documents-sources.csv' : (provBase(pr) === m.legacy_file ? 'October record: made from this legacy file' : 'October record names another file: ' + (provBase(pr) || pr.legacy_file.slice(0, 60)))
}
// by date key and kind, for the entries whose title level is below probable
for (const m of matchDocs) m.date_key_pairing = m.level_by_title === 'weak' || m.level_by_title === 'none' ? (m.date_key_candidates === 1 ? 'one candidate with the same date key' : (m.date_key_candidates > 1 ? m.date_key_candidates + ' candidates with the same date key' : (m.date_key ? 'none with this date key' : 'no date key'))) : ''
const matchedNew = new Map(); for (const m of matchDocs) if (m.new_index) matchedNew.set(m.new_index, [...(matchedNew.get(m.new_index) || []), m.legacy_title])
numbers.docs_new_rows = newDocs.length
numbers.docs_new_by_kind = tally(newDocs, 'kind')
numbers.docs_levels_by_title = Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchDocs.filter(m => m.level_by_title === l).length]))
numbers.docs_levels_by_kind = Object.fromEntries([...new Set(matchDocs.map(m => m.kind_guess))].map(k => [k, Object.fromEntries(['exact', 'probable', 'weak', 'none'].map(l => [l, matchDocs.filter(m => m.kind_guess === k && m.level_by_title === l).length]))]))
numbers.docs_date_key_pairing_for_weak_or_none = tally(matchDocs.filter(m => m.date_key_pairing), 'date_key_pairing')

// hosted files
const pdfinfo = f => { try { const o = execFileSync('pdfinfo', [f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return { pages: Number((o.match(/^Pages:\s+(\d+)/m) || [])[1]) || '', title: (o.match(/^Title:\s+(.*)$/m) || [])[1] || '' } } catch { return { pages: '', title: '' } } }
const pdftext = f => { try { return clean(execFileSync('pdftotext', ['-l', '1', '-layout', f, '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 })) } catch { return '' } }
const files = []
for (const nd of newDocs.filter(n => n.file)) {
  const p = path.join('public', nd.file); const exists = fs.existsSync(p)
  const info = exists ? pdfinfo(p) : { pages: '', title: '' }; const txt = exists ? pdftext(p) : ''
  const lower = deaccent(txt.toLowerCase())
  // the title's own facts that a reader acts on: the year(s), the month, and the first day of the meeting; checked against the first page's text
  const tw = words(nd.title); const years = tw.filter(x => /^(19|20)\d\d$/.test(x)); const month = tw.find(x => MONTHS.includes(x)); const dayM = nd.title.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/)
  const checks = []
  if (nd.kind === 'minutes' && month) checks.push(month + ' ' + (dayM ? dayM[1] : '') + (years[0] ? ', ' + years[0] : ''))
  else for (const y of years) checks.push(y)
  const found = txt ? checks.map(c => { const mm = c.match(/^([a-z]+) (\d*)(?:, (\d{4}))?$/); if (!mm) return lower.includes(c); const [, mo, dd, yy] = mm; const re = new RegExp('\\b' + mo.slice(0, 3) + '[a-z]*\\.?\\s+' + (dd ? '0?' + dd + '\\b' : '')); return re.test(lower) && (!yy || lower.includes(yy)) }) : []
  const pr = provByHosted.get(nd.file); const legacyBase = pr ? provBase(pr) : ''
  const lf = legacyBase ? legacyDocs.find(d => base(d.file_path) === legacyBase) : null
  const orig = SRC && legacyBase && fs.existsSync(path.join(SRC, legacyBase)) ? path.join(SRC, legacyBase) : ''
  const oi = orig ? pdfinfo(orig) : { pages: '' }
  files.push({
    idx: nd.idx, title: nd.title, kind: nd.kind, file: nd.file, opens: exists && info.pages ? 'yes' : (exists ? 'exists, not a readable PDF' : 'missing'), size_bytes: exists ? fs.statSync(p).size : '', pages: info.pages,
    first_page_text_words: txt ? txt.split(' ').length : 0, text_check: !txt ? 'no readable text on page 1' : (checks.length ? (found.every(Boolean) ? 'title date found: ' + checks.join('; ') : 'title date NOT found: ' + checks.filter((_, i) => !found[i]).join('; ')) : 'no date in the title to check'),
    legacy_file_per_october_record: legacyBase, legacy_size_now: lf ? lf.size_now : '', legacy_file_status_now: lf ? lf.head_status : '', october_copy_pages: oi.pages, pages_same_as_october_copy: oi.pages && info.pages ? (oi.pages === info.pages ? 'same' : 'differ') : '',
    size_ratio_hosted_to_legacy: exists && lf && lf.size_now ? num(fs.statSync(p).size / Number(lf.size_now)) : ''
  })
}
numbers.docs_new_with_file = files.length
numbers.docs_new_with_url = newDocs.filter(n => n.url).length
numbers.files_open = tally(files, 'opens')
numbers.files_text_check = (Object.entries(tally(files, 'text_check')).map(([k, v]) => [k.startsWith('title date found') ? 'title date found' : k.startsWith('title date NOT found') ? 'title date NOT found' : k, v]).reduce((o, [k, v]) => ((o[k] = (o[k] || 0) + v), o), {}))
numbers.files_title_date_not_found = files.filter(f => f.text_check.startsWith('title date NOT found')).map(f => f.title + ' [' + f.text_check + ']')
numbers.files_no_text = files.filter(f => f.text_check.startsWith('no readable')).map(f => f.title)
numbers.files_pages_vs_october_copy = tally(files, 'pages_same_as_october_copy')
numbers.files_pages_differ = files.filter(f => f.pages_same_as_october_copy === 'differ').map(f => f.title + ' (' + f.pages + ' here, ' + f.october_copy_pages + ' in the October copy)')
numbers.files_without_legacy_file_record = files.filter(f => !f.legacy_file_per_october_record).map(f => f.title)
numbers.files_hosted_much_smaller_than_legacy = files.filter(f => f.size_ratio_hosted_to_legacy !== '' && f.size_ratio_hosted_to_legacy < 0.8).map(f => f.title + ' (' + f.size_ratio_hosted_to_legacy + ')')
numbers.files_size_within_5_percent_of_legacy = files.filter(f => f.size_ratio_hosted_to_legacy !== '' && Math.abs(f.size_ratio_hosted_to_legacy - 1) <= 0.05).length
numbers.files_with_a_legacy_size = files.filter(f => f.size_ratio_hosted_to_legacy !== '').length
numbers.files_total_bytes = files.reduce((n, f) => n + Number(f.size_bytes || 0), 0)
const hostedFilesOnDisk = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : hostedFilesOnDisk.push('/' + path.join(d, e.name).replace(/^public\//, '')) })('public/documents')
numbers.hosted_files_on_disk = hostedFilesOnDisk.length
numbers.hosted_files_not_in_documents_json = hostedFilesOnDisk.filter(f => !newDocs.some(n => n.file === f))
numbers.documents_json_files_not_on_disk = newDocs.filter(n => n.file && !hostedFilesOnDisk.includes(n.file)).map(n => n.title)
const dupFiles = {}; for (const n of newDocs) if (n.file) dupFiles[n.file] = (dupFiles[n.file] || 0) + 1
numbers.documents_json_duplicate_files = Object.entries(dupFiles).filter(([, v]) => v > 1).map(([k]) => k)

// the new rows with the legacy entry they were matched to
const newDocsOut = newDocs.map(nd => ({ idx: nd.idx, title: nd.title, kind: nd.kind, series: nd.series || '', year: nd.year || '', date: nd.date || '', file: nd.file || '', url: nd.url || '', matched_legacy: (matchedNew.get(nd.idx) || []).join(' ; '), n_legacy: (matchedNew.get(nd.idx) || []).length }))
numbers.docs_new_without_legacy_by_title = newDocsOut.filter(r => !r.n_legacy).map(r => r.title)
numbers.docs_new_matched_by_more_than_one_legacy = newDocsOut.filter(r => r.n_legacy > 1).map(r => r.title + ' <- ' + r.matched_legacy)
// not hosted: legacy entries with no document here by title and no single date-key candidate
const unhosted = matchDocs.filter(m => !m.new_index && !m.date_key_candidates)
numbers.docs_unhosted_by_group = tally(unhosted, 'group')

// ---------- legacy-host references ----------
const refs = []
const scan = (where, text) => { for (const m of text.matchAll(/https?:\/\/(?:www\.)?cuahsi\.org[^\s"'<>)\]]*/g)) refs.push({ where, reference: m[0] }) }
newPortals.forEach(p => { if (LEGACY_HOST.test(hostOf(p.url))) refs.push({ where: 'content/data-portals/portals.json: ' + p.name, reference: p.url }) })
newDocs.forEach(d => { for (const k of ['file', 'url', 'citation', 'note']) if (d[k] && /cuahsi\.org/.test(d[k])) refs.push({ where: 'content/documents/documents.json: ' + d.title + ' (' + k + ')', reference: (d[k].match(/https?:\/\/[^\s"]*cuahsi\.org[^\s"]*/) || [d[k]])[0] }) })
for (const f of ['pages/about/documents.vue', 'pages/data-platforms/portals.vue']) scan(f, rd(f))
// every link to a file on the legacy host anywhere in the site's content and code (A4 does the whole site; here: which of them have a hosted copy in the library)
const uploadRe = /https?:\/\/(?:www\.)?cuahsi\.org\/uploads\/[^\s"'<>]*?\.(?:pdf|docx?|xlsx?|pptx?|png|jpe?g)(?!\.?[A-Za-z0-9])/g
const walkFiles = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walkFiles(path.join(d, e.name)) : [path.join(d, e.name)])
const siteRefs = []
for (const root of ['content', 'pages', 'components', 'composables']) for (const f of walkFiles(root).filter(f => /\.(md|vue|ts|json)$/.test(f))) rd(f).split('\n').forEach((line, i) => { for (const m of line.matchAll(uploadRe)) siteRefs.push({ where: f + ':' + (i + 1), reference: m[0] }) })
const hostedTwin = ref => { const b = base(ref); const pr = prov.find(r => provBase(r) === b); return pr ? pr.hosted_as : '' }
for (const r of siteRefs) { r.hosted_copy_here = hostedTwin(r.reference); refs.push(r) }
numbers.legacy_host_file_links_site_wide = siteRefs.length
numbers.legacy_host_file_links_distinct_files = new Set(siteRefs.map(r => base(r.reference))).size
numbers.legacy_host_file_links_with_hosted_copy = siteRefs.filter(r => r.hosted_copy_here).map(r => r.where + ' -> ' + r.hosted_copy_here)
numbers.legacy_host_file_links_in_library_documents = siteRefs.filter(r => legacyDocs.some(d => d.file_path && base(d.file_path) === base(r.reference))).length
numbers.legacy_host_file_links_to_unhosted_library_files = siteRefs.filter(r => !hostedTwin(r.reference) && legacyDocs.some(d => d.file_path && base(d.file_path) === base(r.reference))).map(r => r.where + ' -> ' + base(r.reference))
numbers.legacy_host_references_in_portal_and_document_data = refs.filter(r => /^content\/(data-portals|documents)\//.test(r.where)).length
numbers.legacy_host_references_in_the_two_pages = refs.filter(r => r.where === 'pages/about/documents.vue' || r.where === 'pages/data-platforms/portals.vue').length

// ---------- cut-over ----------
const cut = readCsv(path.join(OUT, `cutover-${DATE}-urls.csv`))
const cutRow = u => cut.find(r => r.url.replace(/\/+$/, '') === 'https://www.cuahsi.org' + u)
const cutSum = rows => ({ addresses: rows.length, clicks: rows.reduce((n, r) => n + Number(r.clicks || 0), 0), final: tally(rows, 'final_status'), fate: tally(rows, 'fate') })
const portalRows = cut.filter(r => /^https:\/\/www\.cuahsi\.org\/community\/water-data-portals(\/|$)/.test(r.url))
const libRows = cut.filter(r => /^https:\/\/www\.cuahsi\.org\/(about\/library|library)(\/|$)/.test(r.url))
numbers.cutover_portals = { ...cutSum(portalRows), finals: tally(portalRows, 'final'), detail_pages_in_snapshot: legacyPortals.length }
numbers.cutover_library = { ...cutSum(libRows), finals: tally(libRows, 'final'), item_and_list_pages_in_snapshot: itemPages.length + 5 }
numbers.cutover_library_file_addresses = cut.filter(r => /\/uploads\//.test(r.url)).length
const decode = u => { try { return decodeURIComponent(u) } catch { return u } }
const fileRows = d => cut.filter(r => decode(r.url) === decode(d.file_url))
const unhostedDocs = legacyDocs.filter(d => d.file_path && d.redirect_check === 'no rule')
numbers.cutover_unhosted_file_addresses = { files: unhostedDocs.length, in_cutover_file: unhostedDocs.filter(d => fileRows(d).length).length, clicks: unhostedDocs.reduce((n, d) => n + fileRows(d).reduce((m, r) => m + Number(r.clicks || 0), 0), 0), final: tally(unhostedDocs.flatMap(fileRows), 'final_status'), megabytes: num(unhostedDocs.reduce((n, d) => n + Number(d.size_now || 0), 0) / 1e6) }
const hostedDocs = legacyDocs.filter(d => d.file_path && d.redirect_check !== 'no rule')
numbers.cutover_hosted_file_addresses = { files: hostedDocs.length, in_cutover_file: hostedDocs.filter(d => fileRows(d).length).length, clicks: hostedDocs.reduce((n, d) => n + fileRows(d).reduce((m, r) => m + Number(r.clicks || 0), 0), 0), final: tally(hostedDocs.flatMap(fileRows), 'final_status') }
const pageRows = u => cut.filter(r => r.url.replace(/\/+$/, '') === 'https://www.cuahsi.org' + u)
numbers.cutover_library_pages_404 = legacyDocs.map(d => d.item_page).filter(Boolean).filter(u => pageRows(u).some(r => r.final_status === '404')).map(u => u.replace('/about/library/', '') + ' (' + pageRows(u).reduce((n, r) => n + Number(r.clicks || 0), 0) + ' clicks)')
numbers.cutover_library_pages_404_whose_document_is_hosted = legacyDocs.filter(d => d.item_page && d.redirect_check !== 'no rule' && d.file_path && pageRows(d.item_page).some(r => r.final_status === '404')).map(d => d.item_page.replace('/about/library/', ''))
numbers.cutover_other_document_addresses = ['/travel-policy', '/authorship-agreement-water-prediction-innovators-summer-institute', '/about/policies-and-conduct'].map(u => { const r = cutRow(u); return r ? { address: u, clicks: r.clicks, final: r.final, status: r.final_status } : { address: u, note: 'not in the cut-over file' } })

// ---------- control ----------
let control = []
if (HAND) {
  const hand = readCsv(HAND)
  for (const h of hand) {
    if (h.kind === 'document') {
      const ld = legacyDocs.find(d => nameKey(d.title) === nameKey(h.legacy_title_or_address)); const m = ld ? matchDocs.find(x => x.legacy_title === ld.title) : null
      const keyed = m && m.new_index ? m.new_title : (m && m.date_key_candidates === 1 ? m.same_date_key_here.replace(/^\d+ /, '') : '')
      const script = !m ? 'legacy row not found' : keyed ? 'matched' : 'none'
      control.push({ kind: 'document', legacy: h.legacy_title_or_address, hand_new: h.new_title, hand_label: h.hand_label, script_level_by_title: m ? m.level_by_title : '', script_new: m ? m.new_title : '', script_date_key_candidate: m ? m.same_date_key_here : '', script_label: script, same: script === h.hand_label ? 'same' : 'DIFFER', note: h.note })
    } else {
      const lp = legacyPortals.find(p => nameKey(p.title) === nameKey(h.legacy_title_or_address)) || legacyPortals.find(p => jaccard(words(p.title), words(h.legacy_title_or_address)) >= 0.8)
      const m = lp ? matchPortals.find(x => x.legacy_stub === lp.stub) : null
      const script = !m ? 'legacy row not found' : (m.level === 'exact' || m.level === 'probable' ? 'matched' : 'none')
      control.push({ kind: 'portal', legacy: h.legacy_title_or_address, hand_new: h.new_title, hand_label: h.hand_label, script_level_by_title: m ? m.level : '', script_new: m ? m.new_name : '', script_date_key_candidate: '', script_label: script, same: script === h.hand_label && (!m || !h.new_title || nameKey(m.new_name) === nameKey(h.new_title) || jaccard(words(m.new_name), words(h.new_title)) >= 0.8) ? 'same' : 'DIFFER', note: h.note })
    }
  }
  numbers.control = { rows: control.length, documents: control.filter(c => c.kind === 'document').length, portals: control.filter(c => c.kind === 'portal').length, same: control.filter(c => c.same === 'same').length, differ: control.filter(c => c.same !== 'same').map(c => c.legacy), by_title_level: tally(control.filter(c => c.kind === 'document'), 'script_level_by_title') }
}

// ---------- write ----------
fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3e-legacy-portals-${DATE}.csv`, legacyPortals.map(p => ({ ...p, description: p.description.slice(0, 200), hidden_contact: p.hidden_contact })))
writeCsv(`a3e-new-portals-${DATE}.csv`, newPortals.map(np => ({ idx: np.idx, name: np.name, owner: np.owner || '', scope: np.scope || '', url: np.url, last_reviewed: np.last_reviewed || '', matched_legacy: (usedNew.get(np.idx) || []).join(' ; ') })))
writeCsv(`a3e-match-portals-${DATE}.csv`, matchPortals)
writeCsv(`a3e-legacy-documents-${DATE}.csv`, legacyDocs.map(d => ({ group: d.group, title: d.title, kind_guess: d.kind_guess, list_page: d.list_page, item_page: d.item_page, item_title: d.item_title, file_url: d.file_url, in_uploads_library_doc: d.in_uploads_library_doc, head_status: d.head_status, size_now: d.size_now, october_size: d.october_size, date_key: d.date_key, redirect_to: d.redirect_to, redirect_check: d.redirect_check })))
writeCsv(`a3e-new-documents-${DATE}.csv`, newDocsOut)
writeCsv(`a3e-match-documents-${DATE}.csv`, matchDocs)
writeCsv(`a3e-files-${DATE}.csv`, files)
writeCsv(`a3e-unhosted-${DATE}.csv`, unhosted.map(m => ({ group: m.group, legacy_title: m.legacy_title, kind_guess: m.kind_guess, level_by_title: m.level_by_title, legacy_file: m.legacy_file, date_key_pairing: m.date_key_pairing })), ['group', 'legacy_title', 'kind_guess', 'level_by_title', 'legacy_file', 'date_key_pairing'])
writeCsv(`a3e-legacyhost-${DATE}.csv`, refs.map(r => ({ where: r.where, reference: r.reference, hosted_copy_here: r.hosted_copy_here || '' })), ['where', 'reference', 'hosted_copy_here'])
if (control.length) writeCsv(`a3e-control-${DATE}.csv`, control)
fs.writeFileSync(path.join(OUT, `a3e-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1).slice(0, 9000))
