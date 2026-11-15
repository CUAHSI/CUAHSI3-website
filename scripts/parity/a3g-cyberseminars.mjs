#!/usr/bin/env node
// Site audit, task A3g (org issue 108): the cyberseminar archive, legacy site against this site.
//
//   node scripts/parity/a3g-cyberseminars.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages/cyberseminars [--out agent/audit]
//
// Reads ONLY the saved legacy pages (raw/legacy-site/<date>/pages/cyberseminars, written by scripts/parity/fetch.mjs) and
// content/cyberseminars/*.md; it never touches the network. Writes agent/audit/:
//   a3g-legacy-pages-<d>.csv   one row per legacy cyberseminar page: kind, title, date, series, YouTube ids on the page
//   a3g-legacy-videos-<d>.csv  one row per (YouTube id, legacy page) with the link text found
//   a3g-new-<d>.csv            one row per file of content/cyberseminars
//   a3g-match-<d>.csv          each legacy page and each new item with its match and the evidence
//   a3g-numbers-<d>.json
// What a legacy page is (the snapshot has 88): `series` = a file under series/ ; `listing` = all-upcoming ; `archive` = a page that links 5 or more
// videos (the six yearly Women Advancing River Research pages) ; `event` = every other page.
// The legacy site has no recording pages: an event page carries the date and a Register link, and only 18 pages hold YouTube links.
// Match levels, as in October's parity analysis: exact = the same YouTube id; probable = same date and title words overlap by 0.6 or
// more (Jaccard on words of 3 letters or more, series prefix and format words removed); weak = title overlap of 0.6 or more on another date;
// possible = no title overlap but a new item on the same date (shown so a person can confirm or reject it: three Navigating Academic Waters
// sessions of 2023 have different titles on the two sites); none.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
const CRAWL_DAY = String(argv['crawl-day'] || '2026-11-06')
if (!SNAP) { console.error('usage: a3g-cyberseminars.mjs --snapshot <folder> [--out <folder>] [--date <d>] [--crawl-day YYYY-MM-DD]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
const YT = /(?:youtube\.com\/(?:embed\/|watch\?v=|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/g
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const isoDate = s => { const m = /([A-Z][a-z]+) (\d{1,2}),? (\d{4})/.exec(s ?? ''); if (!m) return ''; const mo = MONTHS.indexOf(m[1]); return mo < 0 ? '' : `${m[3]}-${String(mo + 1).padStart(2, '0')}-${String(+m[2]).padStart(2, '0')}` }
// Title words for matching: lower case, the series prefix before a colon removed ("Navigating (beyond) Academic Waters:", brackets included),
// then words of 3 letters or more, less the words that name a format and say nothing about the session.
const FORMAT_WORDS = new Set(['part', 'panel', 'webinar', 'series', 'the', 'and', 'for', 'with'])
const words = s => new Set((s ?? '').toLowerCase().replace(/[()]/g, '').replace(/^.*?(?:navigating (?:beyond )?academic waters|women advancing river research)[^:]*:\s*/, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !FORMAT_WORDS.has(w)))
const jaccard = (a, b) => { const i = [...a].filter(x => b.has(x)).length, u = new Set([...a, ...b]).size; return u ? i / u : 0 }

// ---- the legacy pages -----------------------------------------------------------------------------------------------
const files = [...fs.readdirSync(SNAP).filter(f => f.endsWith('.html')).map(f => ({ f: path.join(SNAP, f), kind: f === 'all-upcoming.html' ? 'listing' : 'event', slug: f.replace(/\.html$/, '') })),
  ...(fs.existsSync(path.join(SNAP, 'series')) ? fs.readdirSync(path.join(SNAP, 'series')).filter(f => f.endsWith('.html')).map(f => ({ f: path.join(SNAP, 'series', f), kind: 'series', slug: 'series/' + f.replace(/\.html$/, '') })) : [])]
const pages = [], videos = []
for (const { f, kind, slug } of files) {
  const html = fs.readFileSync(f, 'utf8'); const $ = cheerio.load(html)
  const main = $('main').first(); main.find('script, style, svg').remove()
  const heads = main.find('h1, h2').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter(t => t && !/^←/.test(t))
  const text = main.text().replace(/\s+/g, ' ').trim()
  const date = isoDate(text.slice(0, 400))
  const ids = [...new Set([...html.matchAll(YT)].map(m => m[1]))]
  for (const id of ids) {
    const a = $(`a[href*="${id}"]`).first()
    const linkText = (a.text() || a.attr('title') || (a.length ? '' : '(embedded frame)')).replace(/\s+/g, ' ').trim()
    videos.push({ video_id: id, page: '/cyberseminars/' + slug, link_text: linkText })
  }
  const series = main.find('a[href^="/cyberseminars/series/"]').first().text().replace(/\s+/g, ' ').trim()
  pages.push({ page: '/cyberseminars/' + slug, kind: kind === 'event' && ids.length >= 5 ? 'archive' : kind, title: heads[0] ?? '', date, upcoming: date && date >= CRAWL_DAY ? 'yes' : '', register_link: /\bRegister\b/.test(text) ? 'yes' : '', series, youtube_ids: ids.join(' '), n_ids: ids.length, words: text.split(' ').length })
}

// ---- the new site ---------------------------------------------------------------------------------------------------
const dir = 'content/cyberseminars'
const items = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
  const t = fs.readFileSync(path.join(dir, f), 'utf8'); const m = /^---\n([\s\S]*?)\n---/.exec(t); let fm = {}
  try { fm = m ? parseYaml(m[1]) : {} } catch { fm = {} }
  return { file: f, slug: fm.slug ?? '', title: fm.title ?? '', date: fm.date ? String(fm.date instanceof Date ? fm.date.toISOString() : fm.date).slice(0, 10) : '', series: fm.series ?? '', video_id: fm.youtube_id ?? '', published: fm.published === false ? 'no' : 'yes', parsed: m ? 'yes' : 'no' }
})

// ---- matching -------------------------------------------------------------------------------------------------------
const byId = new Map(items.filter(i => i.video_id).map(i => [i.video_id, i]))
const match = []
const usedNew = new Set()
for (const p of pages) {
  if (p.kind === 'series' || p.kind === 'listing' || p.kind === 'archive') { match.push({ side: 'legacy', page: p.page, kind: p.kind, title: p.title, date: p.date, level: 'n/a', new_item: '', evidence: p.kind === 'series' ? 'series page: not matched item by item' : p.kind === 'archive' ? 'yearly archive page: its videos are counted by id' : 'listing' }); continue }
  let hit = null, level = 'none', why = ''
  const ids = p.youtube_ids ? p.youtube_ids.split(' ') : []
  const idHit = ids.map(i => byId.get(i)).find(Boolean)
  if (idHit) { hit = idHit; level = 'exact'; why = 'same YouTube id ' + idHit.video_id }
  else {
    const w = words(p.title)
    const cand = items.map(i => ({ i, j: jaccard(w, words(i.title)) })).sort((a, b) => b.j - a.j)[0]
    if (cand && cand.j >= 0.6) { hit = cand.i; level = p.date && cand.i.date === p.date ? 'probable' : 'weak'; why = `title overlap ${cand.j.toFixed(2)}, ${p.date && cand.i.date === p.date ? 'same date' : 'dates ' + (p.date || '?') + ' / ' + (cand.i.date || '?')}` }
    else if (p.date) {
      const same = items.filter(i => i.date === p.date)
      if (same.length === 1) { hit = same[0]; level = 'possible'; why = `same date, titles differ (overlap ${jaccard(w, words(same[0].title)).toFixed(2)}): new "${same[0].title.slice(0, 60)}"` }
      else if (same.length > 1) { level = 'possible'; why = `${same.length} new items on the same date, none with a similar title` ; hit = null }
    }
  }
  if (hit) usedNew.add(hit.file)
  match.push({ side: 'legacy', page: p.page, kind: p.kind, title: p.title, date: p.date, level, new_item: hit?.slug ?? '', evidence: why })
}
for (const i of items) if (!usedNew.has(i.file)) match.push({ side: 'new', page: '', kind: 'item', title: i.title, date: i.date, level: 'none', new_item: i.slug, evidence: 'no legacy page matched' })

fs.mkdirSync(OUT, { recursive: true })
writeCsv(`a3g-legacy-pages-${DATE}.csv`, pages); writeCsv(`a3g-legacy-videos-${DATE}.csv`, videos); writeCsv(`a3g-new-${DATE}.csv`, items); writeCsv(`a3g-match-${DATE}.csv`, match)
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
const legacyIds = new Set(videos.map(v => v.video_id)), newIds = new Set(items.map(i => i.video_id).filter(Boolean))
const events = pages.filter(p => p.kind === 'event')
const numbers = {
  date: DATE, legacy_pages: pages.length, by_kind: count(pages, p => p.kind), event_pages_upcoming: events.filter(p => p.upcoming).length, event_pages_past: events.filter(p => !p.upcoming).length, event_pages_no_date: events.filter(p => !p.date).length,
  event_pages_with_register: events.filter(p => p.register_link).length, pages_with_youtube_ids: pages.filter(p => p.n_ids).length, legacy_unique_video_ids: legacyIds.size,
  legacy_video_pages: count(pages.filter(p => p.n_ids), p => p.page), new_files: items.length, new_with_video_id: newIds.size, new_unpublished: items.filter(i => i.published === 'no').length, new_unparsed: items.filter(i => i.parsed === 'no').length,
  ids_in_both: [...legacyIds].filter(i => newIds.has(i)).length, ids_only_legacy: [...legacyIds].filter(i => !newIds.has(i)).length, ids_only_new: [...newIds].filter(i => !legacyIds.has(i)).length,
  event_match_levels: count(match.filter(m => m.kind === 'event'), m => m.level), new_unmatched: match.filter(m => m.side === 'new').length,
}
fs.writeFileSync(path.join(OUT, `a3g-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1))
