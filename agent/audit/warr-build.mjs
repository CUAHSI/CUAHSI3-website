#!/usr/bin/env node
// Audit A3g follow-up (org issue 108): the Women Advancing River Research (WARR) lectures as content/cyberseminars items.
//
//   node agent/audit/warr-build.mjs --snapshot <.../raw/legacy-site/261106/pages/cyberseminars>            proposal only (writes agent/audit/warr-proposal-261106.*)
//   node agent/audit/warr-build.mjs --snapshot <...> --preview                                             also prints 3 of the files
//   node agent/audit/warr-build.mjs --snapshot <...> --write                                               also writes content/cyberseminars/YYYY-warr-*.md
//
// Source: the six yearly pages of the legacy site (/cyberseminars/<year>-women-advancing-river-research-lecture-series), saved in the
// 6 November 2026 snapshot. Each lists a date, a title linked to its YouTube video and the speakers with their institutions. Nothing is
// invented (C3): a field the page does not give is left out. It reads the A3g oEmbed check (agent/audit/a3g-youtube-261106.csv) to
// confirm each video answered 200 and to compare the page's title with the one YouTube holds; where they differ the proposal says so.
// This script lives in agent/ because a content branch may change only content/ and agent/ (CLAUDE.md rule 3); it reads and writes only
// the paths named here and never touches the network.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { stringify } from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SNAP = String(argv.snapshot || ''); const WRITE = !!argv.write
if (!SNAP) { console.error('usage: warr-build.mjs --snapshot <folder> [--write]'); process.exit(2) }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SERIES = 'Women Advancing River Research (WARR)', SERIES_SLUG = 'women-advancing-river-research-lecture-series'
const norm = s => (s ?? '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim()
const clean = s => s.replace(/\s+/g, ' ').replace(/ /g, ' ').trim()
const list = a => a.length < 3 ? a.join(' and ') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]   // A, B and C
const csvLine = (a) => a.map(v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }).join(',')

// the oEmbed results of A3g
const yt = new Map(); {
  const t = fs.readFileSync('agent/audit/a3g-youtube-261106.csv', 'utf8').split('\n'); const head = t[0].split(',')
  // title is the 8th column and may be quoted: parse with a small reader
  let row = [], cell = '', q = false; const rows = []
  for (const c of fs.readFileSync('agent/audit/a3g-youtube-261106.csv', 'utf8')) {
    if (q) { if (c === '"') q = false; else cell += c } else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = '' } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' } else cell += c
  }
  const h = rows.shift(); for (const r of rows) if (r.length === h.length) yt.set(r[h.indexOf('video_id')], Object.fromEntries(h.map((k, i) => [k, r[i]])))
}

// Two spellings on the legacy page that are plainly typos, corrected here and listed in the proposal as the agent's choice (C7):
// "llison Pfeiffer" (a geologist at Western Washington University; checked against the university's department page) and
// "The Nature Conservatory" (the organisation is The Nature Conservancy).
const FIXES = { 'llison Pfeiffer': 'Allison Pfeiffer', 'The Nature Conservatory': 'The Nature Conservancy' }
const fixes_used = []
const records = [], skipped = []
for (const year of [2021, 2022, 2023, 2024, 2025, 2026]) {
  const file = path.join(SNAP, `${year}-women-advancing-river-research-lecture-series.html`)
  const $ = cheerio.load(fs.readFileSync(file, 'utf8')); const main = $('main').first()
  let date = ''
  main.find('h3, p').each((_, el) => {
    const $el = $(el); const text = clean($el.text())
    if (el.tagName === 'h3') {
      const m = /^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/.exec(text)
      if (m && MONTHS.includes(m[1])) { date = `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${String(+m[2]).padStart(2, '0')}`; return }
      const a = $el.find('a[href*="youtu"]').first()
      if (a.length && date) {
        const id = /(?:youtu\.be\/|v=|embed\/)([\w-]{11})/.exec(a.attr('href'))?.[1]
        records.push({ year, date, title: clean(a.text()), video_id: id, speakers: [], speaker_orgs: [], speaker_raw: [] })
      } else if (date && text && !/^Return to/.test(text)) skipped.push({ year, date, text: text.slice(0, 80) })
    } else if (el.tagName === 'p' && /^Speakers?:/.test(text) && records.length) {
      const last = records[records.length - 1]
      const lines = $el.html().split(/<br\s*\/?>/i).map(x => clean(cheerio.load('<x>' + x + '</x>')('x').text())).filter(x => x && !/^Speakers?:$/.test(x))
      for (let ln of lines) { for (const [bad, good] of Object.entries(FIXES)) if (ln.includes(bad)) { fixes_used.push({ date, from: bad, to: good }); ln = ln.replace(bad, good) } last.speaker_raw.push(ln); const i = ln.indexOf(','); if (i > 0) { last.speakers.push(ln.slice(0, i).trim()); last.speaker_orgs.push(ln.slice(i + 1).trim()) } else { last.speakers.push(ln); last.speaker_orgs.push('') } }
    }
  })
}

// per record: checks and the file it would become
const seen = new Set(); const existing = new Set(fs.readdirSync('content/cyberseminars').filter(f => f.endsWith('.md')).map(f => /^slug: (.+)$/m.exec(fs.readFileSync('content/cyberseminars/' + f, 'utf8'))?.[1]?.trim()))
const existingIds = new Set(fs.readdirSync('content/cyberseminars').filter(f => f.endsWith('.md')).map(f => /^youtube_id: "?([^"\n]*)"?$/m.exec(fs.readFileSync('content/cyberseminars/' + f, 'utf8'))?.[1]?.trim()))
const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'its', 'are', 'how', 'what', 'under', 'across', 'using'])
for (const r of records) {
  const y = yt.get(r.video_id) ?? {}
  r.oembed_status = y.oembed_status ?? '(not checked)'; r.youtube_title = y.title ?? ''
  r.title_equals_youtube = y.title ? (norm(r.title) === norm(y.title) ? 'yes' : 'no') : ''
  const TRAIL = new Set(['of', 'in', 'on', 'to', 'at', 'by', 'as', 'is', 'non', 'de', 'united'])   // a cut should not end on these
  const cut = norm(r.title).split(' ').filter(w => w.length >= 2 && !STOP.has(w)).slice(0, 6); while (cut.length > 2 && TRAIL.has(cut[cut.length - 1])) cut.pop()
  const words = cut.join('-')
  let slug = `warr-${r.date.slice(0, 7)}-${words}`.replace(/-+$/, ''), n = 2; while (seen.has(slug) || existing.has(slug)) slug = `warr-${r.date.slice(0, 7)}-${words}-${n++}`
  seen.add(slug); r.slug = slug; r.file = `${r.date.slice(0, 4)}-warr-${slug.replace(/^warr-\d{4}-\d{2}-/, '')}.md`
  r.duplicate_id_in_content = existingIds.has(r.video_id) ? 'yes' : ''
  r.speakers_without_org = r.speaker_orgs.filter(o => !o).length
  r.description = `A Women Advancing River Research webinar on ${MONTHS[+r.date.slice(5, 7) - 1]} ${+r.date.slice(8)}, ${r.date.slice(0, 4)}, with ${list(r.speakers.map((s, i) => s + (r.speaker_orgs[i] ? ` (${r.speaker_orgs[i]})` : '')))}.`
}

fs.mkdirSync('agent/audit', { recursive: true })
const cols = ['date', 'title', 'video_id', 'speakers', 'speaker_orgs', 'oembed_status', 'title_equals_youtube', 'youtube_title', 'slug', 'file', 'duplicate_id_in_content']
fs.writeFileSync('agent/audit/warr-proposal-261106.csv', cols.join(',') + '\n' + records.map(r => csvLine(cols.map(c => Array.isArray(r[c]) ? r[c].join(' | ') : r[c]))).join('\n') + '\n')
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
const numbers = { fixes: fixes_used, records: records.length, by_year: count(records, r => r.year), with_video_id: records.filter(r => r.video_id).length, distinct_video_ids: new Set(records.map(r => r.video_id)).size, oembed: count(records, r => r.oembed_status), title_equals_youtube: count(records, r => r.title_equals_youtube || '(none)'), with_speakers: records.filter(r => r.speakers.length).length, speakers_total: records.reduce((n, r) => n + r.speakers.length, 0), speakers_without_org: records.reduce((n, r) => n + r.speakers_without_org, 0), duplicate_ids_in_content: records.filter(r => r.duplicate_id_in_content).length, distinct_slugs: new Set(records.map(r => r.slug)).size, skipped_headings: skipped.length }
fs.writeFileSync('agent/audit/warr-proposal-261106-numbers.json', JSON.stringify({ numbers, skipped }, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1)); console.log('skipped', JSON.stringify(skipped.slice(0, 6)))

const frontMatter = r => '---\n' + stringify({ title: r.title, slug: r.slug, series: SERIES, series_slug: SERIES_SLUG, date: r.date + 'T00:00:00.000Z', youtube_id: r.video_id, speakers: r.speakers, speaker_orgs: r.speaker_orgs.filter(Boolean), tags: ['women-advancing-river-research'], published: true, description: r.description }, { lineWidth: 80 }).replace(/^date: "?([^"\n]+)"?$/m, 'date: $1') + '---\n'
if (argv.preview) { for (const i of [0, 21, 62]) console.log('--- ' + records[i].file + '\n' + frontMatter(records[i])) }
if (WRITE) {
  let n = 0
  for (const r of records) {
    const target = path.join('content/cyberseminars', r.file)
    if (fs.existsSync(target)) { console.error('exists, not overwritten: ' + target); continue }
    fs.writeFileSync(target, frontMatter(r)); n++
  }
  console.log('written ' + n)
}
