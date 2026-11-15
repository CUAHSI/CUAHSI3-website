#!/usr/bin/env node
// Site audit, task A3d (org issue 105): the program pages and the graduate programs directory, legacy site against this site.
//
//   node scripts/parity/a3d-programs.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages [--hand agent/audit/a3d-hand-match-261109.csv] [--out agent/audit]
//
// Reads ONLY the saved legacy pages (never the network), content/graduate-programs/programs.json, content/programs/*.md
// and agent/audit/cutover-<d>-urls.csv (the redirect outcome comes from that file; public/_redirects is not read here). Writes agent/audit/:
//   a3d-legacy-grad-<d>.csv     one row per block of the legacy list (107): the name, its stub address, degrees, text length, website, links
//   a3d-new-grad-<d>.csv        one row per institution here (102), with the legacy institution it was matched to
//   a3d-match-grad-<d>.csv      each legacy institution (blocks with the same name merged) with its best match here, the level and the evidence
//   a3d-facts-grad-<d>.csv      for each matched pair: degrees, website, programs text, links, review date, contact
//   a3d-duplicates-<d>.csv      the legacy names listed more than once, with what each block says
//   a3d-programs-<d>.csv        the legacy program pages and the program files here: level, and the facts of each matched pair
//   a3d-control-<d>.csv         the hand-matched control against the script
//   a3d-numbers-<d>.json        the counts, and the comparison with the hand-matched control
// Also writes .agent/a3d-program-text.json (gitignored scratch, full text of the program pages, for reading by hand; never committed).
// Program pages are matched by equal address word, not by the name levels. Match levels are October's (agent/reports/261005_parity-stage4.md), never raised to improve a number:
//   exact     the name is the same once case, accents, punctuation (commas, hyphens, ampersands) and a leading "the" are ignored
//   probable  the name words overlap by 0.6 or more (Jaccard)
//   weak      0.4 or more
//   none
// "Matched" means exact or probable. E-mail addresses on the legacy site are hidden behind a script that is not decoded here; they are counted as
// placeholders, never read or copied. No address or telephone number is written to any file this script produces.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), HAND = argv.hand ? String(argv.hand) : ''
if (!SNAP) { console.error('usage: a3d-programs.mjs --snapshot <pages folder> [--hand <csv>] [--out <folder>] [--date <d>]'); process.exit(2) }
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
const clean = s => (s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const deaccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
const words = s => deaccent(clean(s).toLowerCase()).replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
const nameKey = s => { const w = words(s); if (w[0] === 'the') w.shift(); return w.join(' ') }
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); const i = [...A].filter(x => B.has(x)).length; return A.size + B.size - i ? i / (A.size + B.size - i) : 0 }
const levelOf = (a, b) => { if (nameKey(a) === nameKey(b)) return ['exact', 1]; const j = jaccard(words(a), words(b)); return j >= 0.6 ? ['probable', j] : j >= 0.4 ? ['weak', j] : ['none', j] }
const hostPath = u => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '')).toLowerCase() } catch { return clean(u).toLowerCase() } }
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
const rd = f => fs.readFileSync(f, 'utf8')
const numbers = {}

// ---------- the legacy graduate directory ----------
const STU = path.join(SNAP, 'students'), LIST = path.join(STU, 'graduate-programs-in-water-science'), DEVDIR = path.join(STU, 'graduate-programs-in-water-science-dev')
const DEG = { "master's": 'masters', 'ph.d.': 'phd', 'other/professional': 'professional', 'undergraduate': 'undergraduate' }
const URLRE = /https?:\/\/[^\s)\]\[,;"<>]+/g
function blocks(file) {
  const $ = cheerio.load(rd(file)); const out = []
  $('div.jobs').each((_, el) => {
    const h2 = $(el).find('h2').first(), a = h2.find('a').first()
    const name = clean(a.text()) || clean(h2.text()), fullH2 = clean(h2.text())
    const paras = $(el).find('p').filter((_, p) => !$(p).find('strong').text().startsWith('Degrees')).map((_, p) => clean($(p).text())).get().filter(Boolean)
    const h3 = clean($(el).find('h3').first().text())
    const links = $(el).find('p a').map((_, x) => $(x).attr('href') || '').get().filter(h => /^https?:/.test(h) && !/cuahsi\.org/.test(h))
    const degrees = $(el).find('p').filter((_, p) => $(p).find('strong').text().startsWith('Degrees')).find('a').map((_, x) => DEG[clean($(x).text()).toLowerCase()] ?? `?${clean($(x).text())}`).get()
    out.push({ name, nameRunsOn: fullH2 !== name, stub: (a.attr('href') || '').replace('https://www.cuahsi.org', ''), h3, paras, links, degrees })
  })
  return out
}
const mainFiles = [LIST + '.html', ...Array.from({ length: 10 }, (_, i) => path.join(LIST, `p${i + 2}.html`))]
const legacyBlocks = mainFiles.flatMap((f, i) => blocks(f).map(b => ({ ...b, page: i + 1 })))
legacyBlocks.forEach((b, i) => { b.n = i + 1 })
const catFolders = { masters: 'masters', phd: 'ph-d', professional: 'other-professional', undergraduate: 'undergraduate' }
const catSets = {}, catFiles = {}
for (const [k, folder] of Object.entries(catFolders)) {
  const files = [path.join(LIST, folder + '.html')]; const d = path.join(LIST, folder)
  if (fs.existsSync(d)) files.push(...fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => path.join(d, f)))
  catFiles[k] = files.filter(fs.existsSync).length
  catSets[k] = new Set(files.filter(fs.existsSync).flatMap(f => blocks(f).map(b => nameKey(b.name))))
}
const allListPages = (function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []) })(STU)
const stubFiles = fs.existsSync(DEVDIR) ? fs.readdirSync(DEVDIR).filter(f => f.endsWith('.html')) : []
function stub(b) {
  const rel = b.stub.replace(/^\//, ''), f = [rel, encodeURI(rel)].map(r => path.join(SNAP, r + '.html')).find(fs.existsSync) || path.join(SNAP, rel + '.html')
  if (!fs.existsSync(f)) return { missing: true, website: '', text: '', placeholders: 0, reviewWord: false }
  const raw = rd(f), $ = cheerio.load(raw); const main = $('main').length ? $('main') : $('body')
  let website = ''
  main.find('p, div').each((_, e) => { const t = clean($(e).clone().children('a').remove().end().text()); if (!website && /Website:\s*$/.test(t)) { const a = $(e).find('a').first().attr('href'); if (a) website = a } })
  if (!website) { const m = clean(main.text()).match(/Website:\s*(https?:\/\/\S+)/); if (m) website = m[1] }
  const placeholders = (raw.match(/enkoder|data-cfemail|mailto:/gi) || []).length
  main.find('a, script, style').each((_, a) => { if (!$(a).closest('h1').length && /Graduate Programs in Water Science|←/.test($(a).text())) $(a).remove() })
  const text = clean(main.text()).replace(/^←?\s*Graduate Programs in Water Science\s*/, '')
  return { missing: false, website, text, placeholders, reviewWord: /\b(last )?(reviewed|updated)\b/i.test(text) }
}
for (const b of legacyBlocks) b.stubInfo = stub(b)
const reviewOnList = legacyBlocks.filter(b => /\b(reviewed|updated)\b/i.test(b.paras.join(' '))).length
writeCsv(`a3d-legacy-grad-${DATE}.csv`, legacyBlocks.map(b => ({
  block: b.n, list_page: b.page, name: b.name, name_runs_on_in_h2: b.nameRunsOn ? 'yes' : 'no', stub: b.stub, stub_saved: b.stubInfo.missing ? 'no' : 'yes',
  degrees_on_list: b.degrees.join('|'), list_words: words(b.paras.join(' ')).length, stub_words: words(b.stubInfo.text).length, stub_website: b.stubInfo.website, links_on_list: [...new Set(b.links)].length,
})))
// one legacy institution per distinct name (blocks with the same name merged, as October did); the key is the exact name
const legacy = []
for (const b of legacyBlocks) {
  let m = legacy.find(x => x.name === b.name)
  if (!m) { m = { name: b.name, blocks: [], degrees: new Set(), paras: [], websites: [], links: [], placeholders: 0 }; legacy.push(m) }
  m.blocks.push(b.n); b.degrees.forEach(d => m.degrees.add(d))
  for (const p of b.paras) if (!m.paras.includes(p)) m.paras.push(p)
  if (b.stubInfo.website) m.websites.push(b.stubInfo.website)
  m.links.push(...b.links); m.placeholders += b.stubInfo.placeholders
  m.stubText = (m.stubText || '') + ' ' + b.stubInfo.text
}
for (const m of legacy) { m.catDegrees = Object.entries(catSets).filter(([, s]) => s.has(nameKey(m.name))).map(([k]) => k); m.allDegrees = new Set([...m.degrees, ...m.catDegrees]) }

// ---------- this site's directory ----------
const nowRows = JSON.parse(rd('content/graduate-programs/programs.json'))
nowRows.forEach((r, i) => { r.n = i + 1 })
const match = []
for (const m of legacy) {
  const cand = nowRows.map(r => ({ r, lv: levelOf(m.name, r.institution) })).sort((a, b) => b.lv[1] - a.lv[1])
  const best = cand[0]
  match.push({ m, level: best.lv[0], score: best.lv[1], row: best.lv[0] === 'none' ? null : best.r, nearest: best.r })
}
const rowUsed = new Map()
for (const x of match) if (x.row) rowUsed.set(x.row.n, [...(rowUsed.get(x.row.n) || []), x.m.name])
const newUnmatched = nowRows.filter(r => !rowUsed.has(r.n))
writeCsv(`a3d-match-grad-${DATE}.csv`, match.map(x => ({
  legacy_name: x.m.name, legacy_blocks: x.m.blocks.join('|'), level: x.level, score: x.score.toFixed(2), new_row: x.row ? x.row.n : '', new_name: x.row ? x.row.institution : '', nearest_if_none: x.row ? '' : x.nearest.institution,
})))
writeCsv(`a3d-new-grad-${DATE}.csv`, nowRows.map(r => ({ row: r.n, institution: r.institution, degrees: r.degrees.join('|'), has_website: r.url ? 'yes' : 'no', programs_words: words(r.programs).length, last_reviewed: r.last_reviewed || '', matched_legacy: (rowUsed.get(r.n) || []).join('|') })))

// facts of each matched pair
const stripUrls = s => s.replace(URLRE, ' ')
const tokens = s => words(stripUrls(s))
const facts = []
for (const x of match.filter(x => x.row)) {
  const m = x.m, r = x.row
  const legacyText = m.paras.join(' '), legacyTok = tokens(legacyText), newTok = tokens(r.programs)
  const newSet = new Set(newTok), missingTok = legacyTok.filter(t => !newSet.has(t))
  const cover = legacyTok.length ? 1 - missingTok.length / legacyTok.length : 1
  const dLeg = [...m.allDegrees].sort(), dNew = [...r.degrees].sort()
  const onlyLeg = dLeg.filter(d => !dNew.includes(d)), onlyNew = dNew.filter(d => !dLeg.includes(d))
  const legSite = m.websites[0] || '', sameSite = legSite && r.url ? hostPath(legSite) === hostPath(r.url) : null
  const siteVerdict = !legSite && !r.url ? 'neither' : !legSite ? 'only here' : !r.url ? 'only legacy' : sameSite ? 'same' : hostOf(legSite) === hostOf(r.url) ? 'same host, other path' : 'different host'
  const legacyLinks = [...new Set([...m.links, ...m.websites].map(hostPath))]
  const keptLinks = r.url ? 1 : 0
  facts.push({
    legacy_name: m.name, new_row: r.n, level: x.level,
    degrees_legacy: dLeg.join('|'), degrees_here: dNew.join('|'), degrees_differ: onlyLeg.length || onlyNew.length ? `legacy only: ${onlyLeg.join('|') || '-'}; here only: ${onlyNew.join('|') || '-'}` : 'same',
    degrees_from_list_only: [...m.degrees].sort().join('|') === dLeg.join('|') ? 'no' : 'category pages added some',
    website: siteVerdict, legacy_distinct_links: legacyLinks.length, links_kept_here: keptLinks,
    words_legacy: legacyTok.length, words_here: newTok.length, legacy_words_not_here: missingTok.length, text_coverage: cover.toFixed(2),
    review_date_legacy: m.paras.some(p => /\b(reviewed|updated)\b/i.test(p)) || /\b(reviewed|updated)\b/i.test(m.stubText) ? 'named' : 'none', review_date_here: r.last_reviewed || 'none',
    contact_legacy: m.placeholders ? 'script-hidden address present' : 'none seen', contact_here: 'none (no field)',
  })
}
writeCsv(`a3d-facts-grad-${DATE}.csv`, facts)

// the five names listed twice (107 blocks, 102 names)
const dups = legacy.filter(m => m.blocks.length > 1).map(m => {
  const bs = m.blocks.map(n => legacyBlocks[n - 1])
  return {
    name: m.name, blocks: m.blocks.join('|'), stubs: bs.map(b => b.stub.split('/').pop()).join(' | '),
    degrees_per_block: bs.map(b => b.degrees.join('+') || '-').join(' | '), text_words_per_block: bs.map(b => words(b.paras.join(' ')).length).join(' | '),
    websites_per_block: bs.map(b => hostPath(b.stubInfo.website) || '-').join(' | '),
    texts_identical: new Set(bs.map(b => tokens(b.paras.join(' ')).join(' '))).size === 1 ? 'yes' : 'no',
    rows_here: nowRows.filter(r => nameKey(r.institution) === nameKey(m.name)).length,
  }
})
writeCsv(`a3d-duplicates-${DATE}.csv`, dups.length ? dups : [{ name: '', blocks: '' }])

// ---------- the control ----------
if (HAND) {
  const hand = readCsv(HAND), cmp = []
  for (const h of hand) {
    const blockIdx = Number(h.legacy_block), b = legacyBlocks[blockIdx - 1]
    const x = b && match.find(y => y.m.name === b.name)
    const got = x && x.row ? x.row.n : null
    const want = h.new_row === 'none' ? null : Number(h.new_row)
    cmp.push({ legacy_block: blockIdx, legacy_name: b ? b.name.slice(0, 60) : '?', by_hand: want ?? 'none', by_script: got ?? 'none', level: x ? x.level : '?', same: (want ?? 'none') === (got ?? 'none') ? 'yes' : 'NO' })
  }
  numbers.control = { items: cmp.length, same: cmp.filter(c => c.same === 'yes').length, differ: cmp.filter(c => c.same !== 'yes').map(c => `${c.legacy_block} ${c.legacy_name}: hand ${c.by_hand}, script ${c.by_script}`) }
  fs.writeFileSync(path.join(OUT, `a3d-control-${DATE}.csv`), Object.keys(cmp[0]).join(',') + '\n' + cmp.map(c => Object.values(c).map(csvCell).join(',')).join('\n') + '\n')
}

// degrees per side, and the category pages against the degrees on the main list
const degCount = rows => Object.fromEntries(['masters', 'phd', 'undergraduate', 'professional'].map(d => [d, rows.filter(r => r.has(d)).length]))
numbers.degrees = { legacy_institutions_by_degree: degCount(legacy.map(m => m.allDegrees)), here_by_degree: degCount(nowRows.map(r => new Set(r.degrees))), category_page_names: Object.fromEntries(Object.entries(catSets).map(([k, s]) => [k, s.size])),
  names_on_a_category_page_but_not_marked_on_the_list: Object.entries(catSets).flatMap(([k, s]) => [...s].filter(n => { const m = legacy.find(x => nameKey(x.name) === n); return m && !m.degrees.has(k) }).map(n => `${k}: ${n}`)) }
// links: every distinct address a legacy institution gives (list text and stub website) against the one website here
const linkSets = legacy.map(m => new Set([...m.links, ...m.websites].map(hostPath)))
numbers.links = { legacy_distinct_targets_total: linkSets.reduce((a, s) => a + s.size, 0), kept_here: match.filter(x => x.row && x.row.url).length, institutions_with_no_link_at_all_legacy: linkSets.filter(s => !s.size).length,
  dropped_in_the_five_merged: dups.map(d => d.name) }
for (const d of dups) { const r = nowRows.find(x => nameKey(x.institution) === nameKey(d.name)); d.website_kept_here = r && r.url ? hostPath(r.url) : '-'; d.second_website_not_here = d.websites_per_block.split(' | ').filter(w => w !== '-' && w !== d.website_kept_here).join(' | ') }
const stubSites = new Set(legacy.flatMap(m => m.websites.map(hostPath))), keptSites = new Set(nowRows.filter(r => r.url).map(r => hostPath(r.url)))
const listOnly = linkSets.reduce((a, s) => a + [...s].filter(x => !stubSites.has(x)).length, 0)
numbers.links.breakdown = { stub_websites_distinct: stubSites.size, of_which_kept_here: [...stubSites].filter(x => keptSites.has(x)).length, links_in_list_text_only: listOnly, institutions_with_such_links: linkSets.filter(s => [...s].some(x => !stubSites.has(x))).length, kept_here_not_on_a_legacy_stub: [...keptSites].filter(x => !stubSites.has(x)).length }
numbers.links.dropped_in_the_five_merged = dups.map(d => `${d.name}: kept ${d.website_kept_here}; not here ${d.second_website_not_here}`)
writeCsv(`a3d-duplicates-${DATE}.csv`, dups.length ? dups : [{ name: '', blocks: '' }])

// ---------- the program pages ----------
const PAGES = ['all-programs-services', 'cyberwater', 'next-generation-modeling-ci', 'ongoing-research-projects', 'summer-institute', 'virtual-university']
function legacyPage(slug) {
  const f = path.join(SNAP, slug + '.html'); if (!fs.existsSync(f)) return null
  const raw = rd(f), $ = cheerio.load(raw)
  $('script, style, nav, header, footer').remove()
  const main = $('main').length ? $('main') : $('body')
  const text = clean(main.text()), h1 = clean(main.find('h1').first().text())
  const ext = [...new Set(main.find('a').map((_, a) => $(a).attr('href') || '').get().filter(h => /^https?:/.test(h) && !/(^|\.)cuahsi\.org/.test(hostOf(h))).map(hostPath))]
  const internal = [...new Set(main.find('a').map((_, a) => $(a).attr('href') || '').get().filter(h => /^\/|cuahsi\.org/.test(h)).map(h => h.replace('https://www.cuahsi.org', '')))]
  return { slug, h1, words: words(text).length, years: [...new Set(text.match(/\b20[0-3]\d\b/g) || [])].sort(), dates: [...new Set(text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?!\d)(,\s*20\d\d)?/g) || [])],
    nums: [...new Set(text.match(/\b\d[\d,]*\+?\s*(%|students|alumni|fellows|universities|institutions|participants|modules|years)\b/gi) || [])], ext, internal, placeholders: (raw.match(/enkoder|data-cfemail|mailto:/gi) || []).length, headings: main.find('h2, h3').map((_, h) => clean($(h).text())).get().slice(0, 14), text }
}
function newProgram(file) {
  const raw = rd(file), m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); if (!m) return null
  const fm = parseYaml(m[1]) || {}, body = m[2]
  const links = [...body.matchAll(/\]\((https?:[^)\s]+)\)/g)].map(x => x[1]), bare = body.match(URLRE) || []
  const ext = [...new Set([...links, ...bare].map(hostPath))]
  const text = fm.title + ' ' + body
  return { file: path.basename(file), slug: fm.slug, title: fm.title, status: fm.status, published: fm.published, words: words(body).length, years: [...new Set(body.match(/\b20[0-3]\d\b/g) || [])].sort(),
    dates: [...new Set(body.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?!\d)(,\s*20\d\d)?/g) || [])],
    nums: [...new Set(body.match(/\b\d[\d,]*\+?\s*(%|students|alumni|fellows|universities|institutions|participants|modules|years)\b/gi) || [])], ext, has_contact_field: fm.contact ? 'yes' : 'no', text, headings: [...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map(x => clean(x[1])).slice(0, 14) }
}
const legacyPrograms = PAGES.map(legacyPage).filter(Boolean)
const newPrograms = fs.readdirSync('content/programs').filter(f => f.endsWith('.md') && f !== 'README.md').map(f => newProgram(path.join('content/programs', f))).filter(Boolean)
const cut = fs.existsSync(path.join('agent', 'audit', `cutover-${DATE}-urls.csv`)) ? readCsv(path.join('agent', 'audit', `cutover-${DATE}-urls.csv`)) : []
const progRows = []
for (const l of legacyPrograms) {
  const n = newPrograms.find(p => p.slug === l.slug) || null
  const c = cut.find(r => r.url === 'https://www.cuahsi.org/' + l.slug)
  const row = { kind: 'legacy page', legacy: '/' + l.slug, new: n ? '/learn-train/programs/' + n.slug : '', level: n ? 'exact' : 'none', evidence: n ? 'same address word and the same program' : 'no program file with this slug; see the report for where its content is, if anywhere',
    legacy_words: l.words, new_words: n ? n.words : '', years_legacy_only: n ? l.years.filter(y => !n.years.includes(y)).join('|') : '', years_here_only: n ? n.years.filter(y => !l.years.includes(y)).join('|') : '',
    dates_legacy: l.dates.join(' | '), dates_here: n ? n.dates.join(' | ') : '', links_legacy_external: l.ext.length, links_here_external: n ? n.ext.length : '', external_legacy_not_here: n ? l.ext.filter(h => !n.ext.includes(h)).join(' | ') : l.ext.join(' | '),
    contact_legacy: l.placeholders ? 'script-hidden address present' : 'none seen', cutover_final: c ? `${c.final} (${c.final_status})` : '', cutover_clicks_floor: c ? c.clicks : '' }
  progRows.push(row)
}
for (const n of newPrograms.filter(p => !legacyPrograms.some(l => l.slug === p.slug))) {
  progRows.push({ kind: 'file here', legacy: '', new: '/learn-train/programs/' + n.slug, level: 'none', evidence: 'no legacy page with this slug', legacy_words: '', new_words: n.words, years_legacy_only: '', years_here_only: n.years.join('|'), dates_legacy: '', dates_here: n.dates.join(' | '), links_legacy_external: '', links_here_external: n.ext.length, external_legacy_not_here: '', contact_legacy: '', cutover_final: '', cutover_clicks_floor: '' })
}
writeCsv(`a3d-programs-${DATE}.csv`, progRows)
fs.mkdirSync('.agent', { recursive: true })
fs.writeFileSync('.agent/a3d-program-text.json', JSON.stringify({ legacy: legacyPrograms.map(l => ({ slug: l.slug, h1: l.h1, headings: l.headings, text: l.text })), here: newPrograms.map(p => ({ slug: p.slug, title: p.title, headings: p.headings, text: p.text })) }, null, 1))

// where else do the programs here appear in the legacy site? (words only; the result is a pointer, not a match)
const probes = { 'snow-field-school': /snow measurement|snow field school|snow.{0,15}field school/i, watersofthack: /watersofthack|waters of hack/i, 'skills-certificate-pilot': /skills certificate|certificate pilot/i }
const elsewhere = {}
for (const [slug, re] of Object.entries(probes)) {
  elsewhere[slug] = (function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []) })(SNAP)
    .filter(f => re.test(clean(cheerio.load(rd(f))('main').text() || ''))).map(f => '/' + path.relative(SNAP, f).replace(/\.html$/, '')).sort()
}

// ---------- the cut-over for the directory ----------
const cutGrad = cut.filter(r => r.body === 'Graduate programs directory')
const cutProg = cut.filter(r => r.body === 'Programs and research projects')
const sum = rows => rows.reduce((a, r) => a + (Number(r.clicks) || 0), 0)

// ---------- counts ----------
const cnt = a => a.reduce((o, k) => (o[k] = (o[k] || 0) + 1, o), {})
const byLevel = cnt(match.map(x => x.level))
Object.assign(numbers, {
  legacy: { list_pages_main: mainFiles.length, blocks: legacyBlocks.length, stub_files: stubFiles.length, stubs_saved_for_blocks: legacyBlocks.filter(b => !b.stubInfo.missing).length, category_pages: catFiles, all_html_files_under_students: allListPages.length,
    distinct_names: legacy.length, names_listed_twice: dups.map(d => d.name), blocks_with_name_running_on: legacyBlocks.filter(b => b.nameRunsOn).map(b => b.n),
    blocks_without_degrees_on_list: legacyBlocks.filter(b => !b.degrees.length).length, institutions_degrees_added_by_category_pages: legacy.filter(m => m.catDegrees.some(d => !m.degrees.has(d))).length, institutions_with_no_degrees_anywhere: legacy.filter(m => !m.allDegrees.size).length,
    institutions_with_website_on_stub: legacy.filter(m => m.websites.length).length, institutions_with_script_hidden_address: legacy.filter(m => m.placeholders).length, list_text_that_names_a_review_or_update: reviewOnList, stubs_that_name_a_review_or_update: legacyBlocks.filter(b => b.stubInfo.reviewWord).length },
  here: { rows: nowRows.length, rows_with_website: nowRows.filter(r => r.url).length, rows_with_review_date: nowRows.filter(r => r.last_reviewed).length, rows_with_no_degrees: nowRows.filter(r => !r.degrees.length).length, rows_matching_no_legacy_name: newUnmatched.map(r => r.institution), rows_matched_by_more_than_one_legacy_name: [...rowUsed].filter(([, v]) => v.length > 1).length },
  levels: byLevel, matched_exact_or_probable: (byLevel.exact || 0) + (byLevel.probable || 0),
  facts: { pairs: facts.length, degrees_same: facts.filter(f => f.degrees_differ === 'same').length, degrees_differ: facts.filter(f => f.degrees_differ !== 'same').length, website: cnt(facts.map(f => f.website)),
    text_coverage_below_1: facts.filter(f => Number(f.text_coverage) < 1).length, text_coverage_below_0_9: facts.filter(f => Number(f.text_coverage) < 0.9).length, text_coverage_below_0_7: facts.filter(f => Number(f.text_coverage) < 0.7).length,
    pairs_where_legacy_had_more_than_one_distinct_link: facts.filter(f => f.legacy_distinct_links > 1).length, review_date_named_on_legacy: facts.filter(f => f.review_date_legacy === 'named').length, review_date_here: facts.filter(f => f.review_date_here !== 'none').length,
    contact_hidden_address_on_legacy: facts.filter(f => f.contact_legacy.startsWith('script')).length },
  programs: { legacy_pages_in_snapshot: legacyPrograms.length, files_here: newPrograms.length, matched: progRows.filter(r => r.kind === 'legacy page' && r.level !== 'none').length, legacy_with_no_match: progRows.filter(r => r.kind === 'legacy page' && r.level === 'none').map(r => r.legacy), here_with_no_legacy_page: progRows.filter(r => r.kind === 'file here').map(r => r.new), elsewhere_in_legacy: elsewhere },
  cutover: { graduate_urls: cutGrad.length, graduate_final_status: cnt(cutGrad.map(r => r.final_status)), graduate_final_targets: cnt(cutGrad.map(r => r.final)), graduate_clicks_floor: sum(cutGrad), program_urls: cutProg.length, program_final_status: cnt(cutProg.map(r => r.final_status)), program_clicks_floor: sum(cutProg) },
})
fs.writeFileSync(path.join(OUT, `a3d-numbers-${DATE}.json`), JSON.stringify(numbers, null, 1) + '\n')
console.log(JSON.stringify(numbers, null, 1))
