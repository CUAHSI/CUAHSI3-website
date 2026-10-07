#!/usr/bin/env node
// Newsletter extraction (P2.5a). Read-only: collects what a newsletter editor would want to see for one issue from content/ and
// writes it as Markdown or JSON. It drafts nothing. The bundle is meant to be pasted into a chat with an LLM by a human.
//
//   node scripts/newsletter-extract.mjs --month 2026-09 [--format json|md] [--out path] [--as-of YYYY-MM-DD] [--root=DIR]
//
// Exit 0 on success, even for a thin month. Exit 1 on a hard error: bad arguments, or a content file whose frontmatter cannot be
// read at all (missing, never closed, empty, or a YAML error). A file that reads but fails its schema is skipped and reported in the
// gaps section; so is a content file that is absent. Exit 2 when --root does not exist.
//
// Reading: the same schemas as the validator (scripts/content-schemas.mjs, COLLECTIONS) and the same `yaml` call as the validator and
// the site (parseDocument(text).toJSON()). The validator does not export its reader (readFrontmatter lives inside the script), so the
// ten lines below repeat it; making it a shared module is a change to the validator and is not done here.
//
// Dates are compared as written: the first ten characters (the calendar date in the file, in the time zone the file's own offset
// implies). Nothing is converted to the viewer's or the editor's time zone.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument } from 'yaml'
import { COLLECTIONS } from './content-schemas.mjs'

// ---- arguments ----------------------------------------------------------------------

const args = process.argv.slice(2)
const fail = (msg) => { console.error(`newsletter-extract: ${msg}`); process.exit(1) }
function opt(name) {
  const i = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (i === -1) return undefined
  if (args[i].includes('=')) return args[i].slice(name.length + 3)
  const v = args[i + 1]
  if (v === undefined || v.startsWith('--')) fail(`--${name} needs a value`)
  return v
}
const known = ['month', 'format', 'out', 'as-of', 'root']
for (const a of args) if (a.startsWith('--') && !known.includes(a.slice(2).split('=')[0])) fail(`unknown option ${a.split('=')[0]}`)
const month = opt('month')
if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) fail('--month is required, as YYYY-MM (for example 2026-09)')
const format = opt('format') ?? 'md'
if (!['md', 'json'].includes(format)) fail('--format must be md or json')
const outPath = opt('out')
const localToday = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
const asOf = opt('as-of') ?? localToday   // the machine's local date
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) fail('--as-of must be YYYY-MM-DD')
const rootArg = opt('root')
const ROOT = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
if (!fs.existsSync(ROOT)) { console.error(`Not found: ${ROOT}`); process.exit(2) }

// ---- month arithmetic (on YYYY-MM strings) ---------------------------------------------

const addMonths = (ym, n) => {
  const [y, m] = ym.split('-').map(Number)
  const t = y * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`
}
const inRange = (iso, from, toExclusive) => typeof iso === 'string' && iso.slice(0, 7) >= from && iso.slice(0, 7) < toExclusive
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function human(iso) {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}))?/.exec(iso)
  if (!m) return iso
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  const day = `${WEEKDAYS[d.getUTCDay()]} ${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}`
  return `${day}${m[4] ? `, ${m[5]}:${m[6]}` : ''} (${iso})`
}

// ---- reading files ---------------------------------------------------------------------

const hard = []       // hard errors: the frontmatter cannot be read
const skipped = []    // read, but failed the schema
const absent = []     // collection files not present

function readFile(file) {
  const text = fs.readFileSync(file, 'utf8')
  if (!text.startsWith('---')) return { problem: 'no frontmatter: the file does not start with ---' }
  const idx = text.indexOf('\n---')
  if (idx === -1) return { problem: 'frontmatter is never closed' }
  const fm = text.slice(4, idx - (text[idx - 1] === '\r' ? 1 : 0))
  if (!fm) return { problem: 'frontmatter is empty' }
  const doc = parseDocument(fm)
  if (doc.errors.length) return { problem: `YAML error: ${doc.errors[0].message.split('\n')[0]}` }
  const data = doc.toJSON()
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { problem: 'frontmatter is not a mapping' }
  const rest = text.slice(idx + 4)
  return { data, body: rest.slice(rest.indexOf('\n') + 1) }
}

function schemaLines(error) {
  return error.issues.slice(0, 4).map(i => `${i.path.join('.') || '(whole file)'}: ${i.message.split('\n')[0]}`)
}

// every entry that read and passed its schema, per collection name: { file, data, body }
function load(name) {
  const c = COLLECTIONS.find(x => x.name === name)
  const out = []
  if (c.kind === 'md') {
    const dir = path.join(ROOT, c.dir)
    if (!fs.existsSync(dir)) { absent.push(c.dir); return out }
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md').sort()) {
      const rel = `${c.dir}/${f}`
      const r = readFile(path.join(dir, f))
      if (r.problem) { hard.push(`${rel}: ${r.problem}`); continue }
      const v = c.schema.safeParse(r.data)
      if (!v.success) { skipped.push({ file: rel, problems: schemaLines(v.error) }); continue }
      out.push({ file: rel, data: r.data, body: r.body })
    }
  } else {
    const file = path.join(ROOT, c.file)
    if (!fs.existsSync(file)) { absent.push(c.file); return out }
    let arr
    try { arr = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) { hard.push(`${c.file}: not valid JSON (${e.message.split('\n')[0]})`); return out }
    if (!Array.isArray(arr)) { hard.push(`${c.file}: expected a JSON array`); return out }
    arr.forEach((e, i) => {
      const v = c.schema.safeParse(e)
      if (!v.success) skipped.push({ file: `${c.file} entry ${i + 1}`, problems: schemaLines(v.error) })
      else out.push({ file: c.file, data: e, body: '' })
    })
  }
  return out
}

// ---- text helpers ----------------------------------------------------------------------

function firstWords(body, n = 80) {
  const plain = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>*\-\s`|]+/gm, ' ')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return ''
  const w = plain.split(' ')
  return w.length > n ? `${w.slice(0, n).join(' ')} …` : plain
}
// excerpt, else the first ~80 words of the body, else the schema's own short text field (description or summary)
function blurb(e) {
  const d = e.data
  const words = n => firstWords(e.body, n)
  if (d.excerpt) return { text: d.excerpt, from: 'excerpt' }
  const b = words(80)
  if (b) return { text: b, from: 'body' }
  if (d.description) return { text: d.description, from: 'description' }
  if (d.summary) return { text: d.summary, from: 'summary' }
  return { text: '', from: 'none' }
}

// ---- people ------------------------------------------------------------------------------

const team = load('team/full-team.json')
const staff = new Map(team.map(t => [t.data.slug, t.data]))
const profileSlugs = new Set()
for (const name of ['board', 'community']) for (const e of load(name)) { profileSlugs.add(e.data.slug); profileSlugs.add(path.basename(e.file, '.md')) }
const warnings = []
function people(entry, slugs) {
  return (slugs ?? []).map(s => {
    const t = staff.get(s)
    if (t) return { slug: s, name: t.name, role: t.role }
    warnings.push(`${entry.file}: people_mentioned "${s}" is not a staff slug in full-team.json${profileSlugs.has(s) ? ' (it matches a board or community profile, which are not staff)' : ' and matches no profile file'}`)
    return { slug: s, name: null, role: null }
  })
}

// ---- sections ------------------------------------------------------------------------------

const next2 = addMonths(month, 2)
const next3 = addMonths(month, 3)
const monthStart = `${month}-01`
const findings = []   // { section, file, text }
const note = (section, file, text) => findings.push({ section, file, text })
const common = (e, extra) => {
  const b = blurb(e)
  return { file: e.file, slug: e.data.slug, title: e.data.title, ...extra, text: b.text, text_from: b.from }
}

// Upcoming events: start in [M, M+2 months)
const events = load('events')
  .filter(e => e.data.published === true && inRange(e.data.start, month, next2))
  .sort((a, b) => a.data.start.localeCompare(b.data.start))
  .map(e => {
    const d = e.data
    const entry = common(e, {
      type: d.type, start: d.start, end: d.end ?? null, timezone: d.timezone,
      location: { mode: d.location.mode, city: d.location.city ?? null, url: d.location.url ?? null },
      audience: d.audience, registration: d.registration ?? null, tags: d.tags, featured: d.featured ?? false,
      already_started: d.start.slice(0, 10) < asOf,
    })
    if (!d.registration) note('events', e.file, 'has no registration block at all, so the editor cannot tell whether registration is needed')
    else if (d.registration.required && !d.registration.url) note('events', e.file, 'registration is required but has no registration.url')
    if (d.location.mode !== 'in-person' && !d.location.url && !d.registration?.url) note('events', e.file, `is ${d.location.mode} but has neither location.url nor registration.url, so there is no link to give`)
    if (!d.end) note('events', e.file, 'has no end date')
    if (!d.timezone) note('events', e.file, 'has no timezone')
    if (entry.already_started) note('events', e.file, `started before the run date (${asOf}), so it is not upcoming if the issue goes out now`)
    return entry
  })

// Recent outcomes (research): date in M
const staffNames = [...staff.values()].map(t => ({ slug: t.slug, name: t.name }))
const research = load('research')
  .filter(e => e.data.published === true && inRange(e.data.date, month, addMonths(month, 1)))
  .map(e => {
    const d = e.data
    const entry = common(e, {
      date: d.date, category: d.category, tags: d.tags, funding: d.funding ?? null, partners: d.partners ?? [],
      people: people(e, d.people_mentioned),
    })
    if (!d.funding) note('research', e.file, 'has no funding')
    const named = staffNames.filter(s => (e.body.includes(s.name) || (d.excerpt ?? '').includes(s.name)) && !(d.people_mentioned ?? []).includes(s.slug))
    if (named.length) note('research', e.file, `names ${named.map(s => s.name).join(', ')} in its text but not in people_mentioned`)
    else if (!(d.people_mentioned ?? []).length) note('research', e.file, 'people_mentioned is empty (no staff name was found in its text either)')
    return entry
  })

// News: date in M
const news = load('news')
  .filter(e => e.data.published === true && inRange(e.data.date, month, addMonths(month, 1)))
  .map(e => {
    const d = e.data
    if (!d.source_url) note('news', e.file, 'has no source_url')
    return common(e, { date: d.date, tags: d.tags, source_url: d.source_url ?? null, author: d.author ?? null })
  })

// New jobs: posted in M
const jobs = load('jobs')
  .filter(e => e.data.published === true && inRange(e.data.posted, month, addMonths(month, 1)))
  .map(e => {
    const d = e.data
    const passed = d.deadline ? d.deadline.slice(0, 10) < asOf : null
    if (!d.deadline) note('jobs', e.file, 'has no deadline (null), so the editor cannot say when it closes')
    else if (passed) note('jobs', e.file, `deadline ${d.deadline.slice(0, 10)} has passed as of the run date (${asOf})`)
    return common(e, {
      organization: d.organization, location: d.location, type: d.type, posted: d.posted, deadline: d.deadline,
      deadline_passed: passed, url: d.url, tags: d.tags, source: d.source ?? null,
    })
  })

// Recordings: date in M
const recordings = load('cyberseminars')
  .filter(e => e.data.published === true && inRange(e.data.date, month, addMonths(month, 1)))
  .map(e => {
    const d = e.data
    const hasVideo = d.youtube_id !== ''
    if (!hasVideo) note('recordings', e.file, 'has no youtube_id (the card renders without the video)')
    if (!d.has_transcript) note('recordings', e.file, d.has_transcript === false ? 'has_transcript is false' : 'has_transcript is not set')
    return common(e, {
      series: d.series, date: d.date, speakers: d.speakers, speaker_orgs: d.speaker_orgs, tags: d.tags,
      has_youtube_id: hasVideo, has_transcript: d.has_transcript ?? null,
    })
  })

// Programs. Heuristic, see PROGRAM_NOTE. The `season` text names months or seasons; a program's own shape may instead carry next_date.
const PROGRAM_NOTE =
  'Heuristic. A program matches when (a) its season text names months or a range of months ("June–July", "September–December", "Early January") and any of them falls in the window ' +
  `${month} to ${addMonths(month, 2)}, or (b) it has a next_date in the window. A season word with no months ("Fall") is only an uncertain match. ` +
  '"season" is when the program runs, not when its applications open, so a match means the program or its call is nearby, not that applications are open.'
const monthIdx = s => MONTHS.findIndex(m => m.toLowerCase() === s.toLowerCase())
function seasonMonths(text) {
  const re = new RegExp(`\\b(${MONTHS.join('|')})\\b(?:\\s*[–—-]\\s*\\b(${MONTHS.join('|')})\\b)?`, 'gi')
  const set = new Set(); let m
  while ((m = re.exec(text))) {
    const a = monthIdx(m[1]); const b = m[2] ? monthIdx(m[2]) : a
    for (let i = a; ; i = (i + 1) % 12) { set.add(i + 1); if (i === b) break }
  }
  return set
}
const windowMonths = [0, 1, 2].map(n => +addMonths(month, n).slice(5))
const SEASONS = { fall: [9, 10, 11], autumn: [9, 10, 11], winter: [12, 1, 2], spring: [3, 4, 5], summer: [6, 7, 8] }
const programs = []
for (const e of load('programs').filter(e => e.data.published === true)) {
  const d = e.data
  let how = null; let uncertain = false
  if (d.next_date) {
    if (inRange(d.next_date, month, next3)) how = `next_date ${d.next_date.slice(0, 10)} is in the window`
  } else if (d.season) {
    const ms = seasonMonths(d.season)
    if ([...ms].some(m => windowMonths.includes(m))) how = `season "${d.season}" names a month in the window`
    else if (!ms.size) {
      const w = Object.entries(SEASONS).find(([k]) => d.season.toLowerCase().includes(k))
      if (w && w[1].some(m => windowMonths.includes(m))) { how = `season "${d.season}" is a season word with no months`; uncertain = true }
    }
  }
  if (!how) {
    if (d.season && !seasonMonths(d.season).size && !Object.keys(SEASONS).some(k => d.season.toLowerCase().includes(k))) {
      note('programs', e.file, `season "${d.season}" names no month or season, so the heuristic could not place it (not matched)`)
    }
    continue
  }
  const entry = common(e, {
    type: d.type ?? 'program', status: d.status ?? null, frequency: d.frequency ?? null, season: d.season ?? null, next_date: d.next_date ?? null,
    location: d.location ?? null, apply_url: d.apply_url ?? null, audience: d.audience, partners: d.partners ?? [],
    funding: d.funding ?? null, tags: d.tags, match: how, uncertain,
  })
  if (uncertain) note('programs', e.file, `matched only on a season word (${how})`)
  if (!d.apply_url) note('programs', e.file, 'has no apply_url, so the editor has no application link')
  programs.push(entry)
}

// ---- gaps --------------------------------------------------------------------------------------

const sections = [
  ['events', 'Upcoming events', events],
  ['research', 'Recent outcomes', research],
  ['news', 'News', news],
  ['jobs', 'New job postings', jobs],
  ['recordings', 'Recordings', recordings],
  ['programs', 'Programs with an open window', programs],
]
const counts = Object.fromEntries(sections.map(([k, , v]) => [k, v.length]))
const text_sources = Object.fromEntries(sections.map(([k, , v]) => [k, v.reduce((m, e) => ({ ...m, [e.text_from]: (m[e.text_from] ?? 0) + 1 }), {})]))
for (const [k, , v] of sections) for (const e of v) if (e.text_from === 'none') note(k, e.file, 'has no excerpt, description, summary or body text, so the drafter has nothing to say about it')
const bundle = {
  month, as_of: asOf,
  window: { events: `${month} to ${addMonths(month, 1)} inclusive`, programs: `${month} to ${addMonths(month, 2)} inclusive` },
  programs_note: PROGRAM_NOTE,
  sections: Object.fromEntries(sections.map(([k, , v]) => [k, v])),
  gaps: { counts, text_sources, events_by_type: Object.fromEntries(events.reduce((m, e) => m.set(e.type, (m.get(e.type) ?? 0) + 1), new Map())), findings, warnings, skipped, absent },
}
if (hard.length) { for (const h of hard) console.error(`newsletter-extract: cannot read ${h}`); process.exit(1) }

// ---- output --------------------------------------------------------------------------------------

function renderMd() {
  const L = []
  L.push(`# Newsletter extraction: ${MONTHS[+month.slice(5) - 1]} ${month.slice(0, 4)} (${month})`, '')
  L.push(`Generated from content/ as of ${asOf}. Events are those starting ${month} to ${addMonths(month, 1)}; research, news, jobs and recordings are those dated or posted in ${month}; ` +
    'only published items. Dates are as written in the files (no time zone conversion). Full bodies are not included; open the file path for more.', '')
  const kv = (k, v) => { if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return; L.push(`- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`) }
  const head = (e, label) => { L.push(`### ${e.title}`, ''); kv('file', e.file); kv('slug', e.slug); label?.() }
  const tail = e => { kv(e.text_from === 'none' ? 'text' : `text (${e.text_from})`, e.text || '(none)'); L.push('') }
  const peopleLine = e => { if (e.people?.length) kv('people', e.people.map(p => (p.name ? `${p.name} (${p.role}) [${p.slug}]` : `${p.slug} [UNRESOLVED]`))) }
  for (const [key, title, items] of sections) {
    L.push(`## ${title}`, '')
    if (key === 'programs') L.push(`Matching logic: ${PROGRAM_NOTE}`, '')
    if (!items.length) { L.push('(none for this month)', ''); continue }
    for (const e of items) {
      head(e, () => {
        if (key === 'events') {
          kv('starts', human(e.start)); kv('ends', human(e.end)); kv('timezone', e.timezone); kv('type', e.type)
          kv('location', `${e.location.mode}${e.location.city ? `, ${e.location.city}` : ''}${e.location.url ? ` (${e.location.url})` : ''}`)
          kv('registration', e.registration ? `${e.registration.required ? 'required' : 'not required'}${e.registration.cost ? `, cost ${e.registration.cost}` : ''}${e.registration.url ? `, ${e.registration.url}` : ''}` : null)
          kv('audience', e.audience); kv('tags', e.tags); kv('featured', e.featured ? 'yes' : null)
          kv('already started at run date', e.already_started ? 'yes' : null)
        } else if (key === 'research') {
          kv('date', human(e.date)); kv('category', e.category); kv('tags', e.tags); kv('funding', e.funding); kv('partners', e.partners); peopleLine(e)
        } else if (key === 'news') {
          kv('date', human(e.date)); kv('tags', e.tags); kv('source_url', e.source_url); kv('author', e.author)
        } else if (key === 'jobs') {
          kv('organization', e.organization); kv('location', e.location); kv('type', e.type); kv('posted', human(e.posted))
          kv('deadline', e.deadline ? `${human(e.deadline)}${e.deadline_passed ? ' (already passed)' : ' (not yet passed)'}` : 'none given'); kv('url', e.url); kv('source', e.source); kv('tags', e.tags)
        } else if (key === 'recordings') {
          kv('series', e.series); kv('date', human(e.date)); kv('speakers', e.speakers.map((s, i) => (e.speaker_orgs[i] ? `${s} (${e.speaker_orgs[i]})` : s)))
          kv('youtube_id present', e.has_youtube_id ? 'yes' : 'no'); kv('has_transcript', e.has_transcript === null ? 'not set' : e.has_transcript ? 'yes' : 'no'); kv('tags', e.tags)
        } else {
          kv('type', e.type); kv('status', e.status); kv('frequency', e.frequency); kv('season', e.season); kv('next_date', human(e.next_date)); kv('location', e.location)
          kv('apply_url', e.apply_url); kv('audience', e.audience); kv('partners', e.partners); kv('funding', e.funding)
          kv('matched because', e.match); kv('uncertain', e.uncertain ? 'yes' : null)
        }
      })
      tail(e)
    }
  }
  L.push('## Gaps and findings', '', 'These are findings about what the content model does and does not capture for this month, not errors.', '')
  L.push('### Count per section', '')
  for (const [key, title] of sections) L.push(`- ${title}: ${counts[key]}`)
  L.push('')
  const byType = {}; for (const e of events) byType[e.type] = (byType[e.type] ?? 0) + 1
  if (events.length) L.push(`- Events by type: ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')} (a "deadline" is a date to remind readers of, not an event to attend)`, '')
  L.push('### Where each entry\'s text came from', '')
  for (const [key, title] of sections) L.push(`- ${title}: ${Object.entries(text_sources[key]).map(([k, v]) => `${k} ${v}`).join(', ') || '(no entries)'}`)
  L.push('', 'Events, jobs and recordings have no excerpt field: events and recordings carry a description, jobs only a body.', '')
  L.push('### Entries with fields the drafter would want', '')
  if (!findings.length) L.push('(none found)')
  for (const f of findings) L.push(`- ${f.file}: ${f.text}`)
  L.push('', '### Unresolved people_mentioned', '')
  if (!warnings.length) L.push('(none)')
  for (const w of warnings) L.push(`- ${w}`)
  L.push('', '### Files skipped (failed schema validation)', '')
  if (!skipped.length) L.push('(none)')
  for (const s of skipped) L.push(`- ${s.file}: ${s.problems.join('; ')}`)
  if (absent.length) { L.push('', '### Content files not found', ''); for (const a of absent) L.push(`- ${a}`) }
  return L.join('\n') + '\n'
}

const result = format === 'json' ? JSON.stringify(bundle, null, 2) + '\n' : renderMd()
if (outPath) { try { fs.writeFileSync(outPath, result) } catch (e) { fail(`cannot write ${outPath}: ${e.message}`) } }
else process.stdout.write(result)
