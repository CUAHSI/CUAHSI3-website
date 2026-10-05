// Parity stage 4: map every legacy URL to its counterpart on this site.
// Reads: agent/parity/legacy-inventory.csv, agent/parity/new-inventory.csv (stage 2), the saved legacy pages in
// raw/legacy-site/261005/pages (for YouTube ids and job apply links), content/**.
// Writes: agent/parity/mapping.csv, agent/parity/mapping-numbers.json, agent/parity/mapping-least-sure.csv.
// Read-only on both sites. Every row is a claim with its evidence in matched_by and notes (parity.md P3).
// Run: node scripts/parity/mapping.mjs
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const SNAP = 'raw/legacy-site/261005/pages'
const ORIGIN = 'https://www.cuahsi.org'
const readCsv = f => {                                   // small RFC 4180 reader (quoted fields, doubled quotes)
  const s = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
    else if (c !== '\r') cur += c
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  const [h, ...b] = rows; return b.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
}
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }

const legacy = readCsv('agent/parity/legacy-inventory.csv')
const newInv = readCsv(fs.existsSync('agent/parity/new-inventory.csv') ? 'agent/parity/new-inventory.csv' : '.agent/new-inventory.csv')
const rel = u => u.replace(ORIGIN, '') || '/'

// ---- text similarity -------------------------------------------------------------------------------------------------
const STOP = new Set('a an and the of for in on at to with by from as is are be your our cuahsi webinar workshop e newsletter'.split(' '))
const norm = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&amp;/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
const toks = s => new Set(norm(s).split(' ').filter(t => t && !STOP.has(t)))
const jaccard = (a, b) => { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let i = 0; for (const t of A) if (B.has(t)) i++; return i / (A.size + B.size - i) }
const days = (a, b) => (a && b) ? Math.abs((Date.parse(a) - Date.parse(b)) / 864e5) : Infinity

// ---- this site's content items ---------------------------------------------------------------------------------------
const fm = f => { const s = fs.readFileSync(f, 'utf8'); if (!s.startsWith('---')) return null; const e = s.indexOf('\n---', 3); if (e < 0) return null; try { return parseYaml(s.slice(3, e)) } catch { return null } }
const items = dir => fs.readdirSync(`content/${dir}`).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => ({ file: `content/${dir}/${f}`, fm: fm(`content/${dir}/${f}`) })).filter(x => x.fm)
const d10 = v => v ? String(v instanceof Date ? v.toISOString() : v).slice(0, 10) : ''
const routeBySource = (suffix) => newInv.filter(r => r.source.includes(suffix))
const routeOfFile = file => newInv.find(r => r.source.split(' + ').includes(file))?.url || ''

const events = items('events').map(x => ({ ...x, title: x.fm.title, date: d10(x.fm.start), route: routeOfFile(x.file) }))
const news = items('news').map(x => ({ ...x, title: x.fm.title, date: d10(x.fm.date), route: routeOfFile(x.file) }))
const impact = items('research').map(x => ({ ...x, title: x.fm.title, date: d10(x.fm.date), route: routeOfFile(x.file) }))
const newsletters = items('newsletter').map(x => ({ ...x, title: x.fm.title, date: d10(x.fm.date), route: routeOfFile(x.file) }))
const seminars = items('cyberseminars').map(x => ({ ...x, title: x.fm.title, date: d10(x.fm.date), yt: x.fm.youtube_id || '' }))
const jobs = items('jobs').map(x => ({ ...x, title: x.fm.title, url: x.fm.url, org: x.fm.organization }))
const programs = items('programs').map(x => ({ ...x, title: x.fm.title, route: routeOfFile(x.file) }))
const team = JSON.parse(fs.readFileSync('content/team/full-team.json', 'utf8'))

// ---- the saved legacy page ------------------------------------------------------------------------------------------
const load = url => { const p = path.join(SNAP, (rel(url).replace(/^\//, '') || 'index') + '.html'); return fs.existsSync(p) ? cheerio.load(fs.readFileSync(p, 'utf8')) : null }
const ytIds = $ => {
  const ids = new Set(); if (!$) return ids
  const grab = s => { const m = (s || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/); if (m) ids.add(m[1]) }
  $('main iframe, main a[href], main [data-src]').each((_, e) => { grab($(e).attr('src')); grab($(e).attr('href')); grab($(e).attr('data-src')) })
  return ids
}
const applyLink = $ => { if (!$) return ''; let u = ''; $('main a[href]').each((_, a) => { if (!u && /apply|link to apply/i.test($(a).text())) u = $(a).attr('href') }); return u }
const normUrl = u => { try { const x = new URL(u); return (x.host + x.pathname).replace(/^www\./, '').replace(/\/+$/, '').toLowerCase() } catch { return '' } }

// ---- the mapping ------------------------------------------------------------------------------------------------------
const out = []
const used = new Map()                                                      // new route/source -> legacy urls (for "no legacy counterpart")
const put = (row, usedKey) => { out.push(row); if (usedKey) { used.set(usedKey, (used.get(usedKey) || []).concat(row.legacy_url)) } }
const row = (l, route, source, confidence, by, notes = '') => ({ legacy_url: l.url, page_type: l.page_type, new_route: route, new_source: source, confidence, matched_by: by, notes })

// best match for a dated item among candidates {title,date,route,file}; thresholds are stated in the report
function bestDated(l, cands, win) {
  let best = null
  for (const c of cands) {
    const sim = jaccard(l.title, c.title), dd = days(l.date, c.date)
    const score = sim - Math.min(dd, 365) / 3650
    if (!best || score > best.score) best = { c, sim, dd, score }
  }
  if (!best) return null
  const { sim, dd } = best
  const same = norm(l.title) === norm(best.c.title)
  let conf = 'none'
  if (same && dd <= 3) conf = 'exact'
  else if (sim >= 0.6 && dd <= win) conf = 'probable'
  else if (dd <= 1 && sim >= 0.3) conf = 'weak'   // the same day and some shared words: a title that was reworded
  else if ((sim >= 0.4 && dd <= win) || (sim >= 0.5 && dd <= 3 * win) || (sim >= 0.8 && !isFinite(dd))) conf = 'weak'   // same title but dates more than 3 windows apart is a recurrence, not a match
  return { ...best, conf, same }
}
const dateNote = (b, l) => `title similarity ${b.sim.toFixed(2)}; legacy date ${l.date || '(none)'}, here ${b.c.date || '(none)'}${isFinite(b.dd) ? ` (${Math.round(b.dd)} days apart)` : ''}`

const legacyHtmlTitleStaff = new Map(team.map(t => [norm(t.name), t]))
const bySourceUrl = u => news.find(n => n.fm.source_url && normUrl(n.fm.source_url) === normUrl(u))   // a news file whose source_url is the legacy page: the strongest key there is
const NEWS_WIN = 60, EVENT_WIN = 30

for (const l of legacy) {
  const u = rel(l.url), t = l.page_type
  // ---- 1. people ----
  if (t === 'person' && u.startsWith('/about/our-team/')) {
    const person = legacyHtmlTitleStaff.get(norm(l.title))
    if (person) {
      const route = routeOfFile(`content/team/${person.slug}.md`) || newInv.find(r => r.url === `/about/team/${person.slug}`)?.url
      if (route) put(row(l, route, newInv.find(r => r.url === route).source, 'exact', 'name', `legacy title equals full-team.json name`), route)
      else put(row(l, '/about/team', 'content/team/full-team.json (no profile page)', 'exact', 'name', 'on the team list; has_profile is false so there is no page of its own'), 'person:' + person.slug)
    } else put(row(l, '', '', 'none', 'name', 'no entry with this name in full-team.json'))
    continue
  }
  if (t === 'person') { put(row(l, '', '', 'none', 'type', 'guest lecturer: no collection or page for lecturers here (stage 3, table 2)')); continue }
  // ---- 2. cyberseminars ----
  if (t === 'cyberseminar') {
    const ids = ytIds(load(l.url))
    const byId = [...ids].map(id => seminars.find(s => s.yt === id)).find(Boolean)
    if (byId) { put(row(l, '/learn-train/cyberseminars', byId.file, 'exact', 'youtube id', `YouTube id ${[...ids].find(i => i === byId.yt)} equals youtube_id in the file; listed on the seminars page, no page of its own`), byId.file); continue }
    const b = bestDated(l, seminars, 14)
    if (b && b.conf !== 'none') {
      const listed = b.c.fm.published === true
      const snap = `raw/legacy-site/261005/pages/${rel(l.url).replace(/^\//, '')}.html`
      const yt = ids.size ? (b.c.yt && ids.has(b.c.yt) ? 'the YouTube id agrees' : `DISCREPANCY: legacy page ${[...ids].join(', ')} (https://www.youtube.com/watch?v=${[...ids][0]}), file here ${b.c.yt ? b.c.yt + ' (https://www.youtube.com/watch?v=' + b.c.yt + ')' : '(empty)'}; Jordan to say which is right`) : `no YouTube id found on the legacy page by the pattern (youtube.com/embed/, watch?v= or youtu.be/ in the main content; snapshot file ${snap})`
      put(row(l, listed ? '/learn-train/cyberseminars' : '', b.c.file, b.conf, 'title+date', (listed ? '' : 'matched, unpublished here (published: false); ') + dateNote(b, l) + '; ' + yt), b.c.file); continue
    }
    const be = bestDated(l, events, 14)                           // a seminar announced here as an event
    if (be && be.conf !== 'none') { put(row(l, be.c.route, be.c.file, be.conf === 'exact' ? 'probable' : be.conf, 'title+date (events)', dateNote(be, l) + '; counterpart is an event here, not a seminar'), be.c.file); continue }
    put(row(l, '', '', 'none', 'youtube id, then title+date', ids.size ? 'legacy has a YouTube id; no file here has it' : 'no YouTube id on the legacy page; no title+date match')); continue
  }
  if (t === 'cyberseminar series') { put(row(l, '', '', 'none', 'type', 'no series page or entity here: series is a text field on a seminar (stage 3)')); continue }
  // ---- 3. newsletters (legacy: news posts titled e-Newsletter) ----
  if (t === 'newsletter issue') {
    const su = bySourceUrl(l.url)
    if (su) { put(row(l, su.route, su.file, 'exact', 'source_url', 'the news file names this legacy page as its source_url'), su.file); continue }
    const m = l.title.match(/^CUAHSI e-Newsletter (\w+) (\d{4})$/i)
    const ym = m ? `${m[2]}-${String(new Date(`${m[1]} 1, ${m[2]} 12:00`).getMonth() + 1).padStart(2, '0')}` : (l.date || '').slice(0, 7)
    if (!m) {                                                    // a guest-spotlight post: the better counterpart is a news item here, found by title and date
      const bn = bestDated(l, news, NEWS_WIN)
      if (bn && bn.conf !== 'none') { put(row(l, bn.c.route, bn.c.file, bn.conf === 'weak' ? 'weak' : 'probable', 'title+date', dateNote(bn, l) + '; counterpart is a news item'), bn.c.file); continue }
    }
    const c = newsletters.find(n => n.date.slice(0, 7) === ym)
    if (c) put(row(l, c.route, c.file, m ? 'exact' : 'weak', m ? 'month (title)' : 'month (posted date)', m ? `title names the month, ${ym}` : `a single guest-spotlight post dated ${l.date}; no news item here matches it; the issue for ${ym} may carry it (not compared; stage 5)`), c.file)
    else put(row(l, '', '', 'none', 'month', `no issue here for ${ym}`))
    continue
  }
  // ---- 4. programs ----
  if (t === 'program') {
    const c = programs.map(p => ({ p, s: jaccard(l.title, p.title) })).sort((a, b) => b.s - a.s)[0]
    if (c && c.s >= 0.6) put(row(l, c.p.route, c.p.file, norm(l.title) === norm(c.p.title) ? 'exact' : 'probable', 'name', `title similarity ${c.s.toFixed(2)}`), c.p.file)
    else put(row(l, '', '', 'none', 'name', 'no program here with this name'))
    continue
  }
  // ---- 5. jobs ----
  if (t === 'job') {
    const link = applyLink(load(l.url)); const nu = normUrl(link)
    const byUrl = jobs.find(j => normUrl(j.url) === normUrl(l.url)) || (nu && jobs.find(j => normUrl(j.url) === nu))   // a job here may point at the legacy page itself
    if (byUrl) { put(row(l, '/community/jobs', byUrl.file, 'exact', 'external url', 'apply link equals the job url; listed on the job board, no page of its own'), byUrl.file); continue }
    const b = bestDated(l, jobs.map(j => ({ ...j, date: d10(j.fm.posted) })), 30)
    if (b && b.conf !== 'none' && b.sim >= 0.6) { put(row(l, '/community/jobs', b.c.file, b.conf === 'exact' ? 'probable' : b.conf, 'title+date', dateNote(b, l)), b.c.file); continue }
    put(row(l, '', '', 'none', 'external url, then title', link ? 'apply link matches no job url here; no title match' : 'no apply link found on the legacy page; no title match')); continue
  }
  // ---- 6. events and workshops ----
  if (t === 'event' || t === 'workshop') {
    const b = bestDated(l, events, EVENT_WIN)
    if (b && b.conf !== 'none') put(row(l, b.c.route, b.c.file, b.conf, 'title+date', dateNote(b, l)), b.c.file)
    else put(row(l, '', '', 'none', 'title+date', b ? `best candidate: ${b.c.slug || b.c.fm.slug} (${b.sim.toFixed(2)}, ${isFinite(b.dd) ? Math.round(b.dd) : '?'} days); below the thresholds` : 'no candidate'))
    continue
  }
  // ---- 7. news posts: against news, then impact stories ----
  if (t === 'news post') {
    const su = bySourceUrl(l.url)
    if (su) { put(row(l, su.route, su.file, 'exact', 'source_url', 'the news file names this legacy page as its source_url'), su.file); continue }
    const bn = bestDated(l, news, NEWS_WIN), bi = bestDated(l, impact, NEWS_WIN)
    const pick = [bn && { ...bn, kind: 'news' }, bi && { ...bi, kind: 'impact story' }].filter(Boolean).sort((a, b) => b.score - a.score)[0]
    if (pick && pick.conf !== 'none') put(row(l, pick.c.route, pick.c.file, pick.conf, 'title+date', dateNote(pick, l) + `; counterpart is a ${pick.kind}`), pick.c.file)
    else put(row(l, '', '', 'none', 'title+date', pick ? `best candidate: ${pick.c.fm.slug} (${pick.sim.toFixed(2)}); below the thresholds` : 'no candidate'))
    continue
  }
  // ---- 8. the rest: decided by an explicit table (stage 3, table 1) ----
  put(staticRow(l, u))
}

// pages that map by an explicit, labelled judgment. Everything not listed here is "none".
function staticRow(l, u) {
  const J = (route, conf, by, notes) => row(l, route, (newInv.find(r => r.url === route) || {}).source || '', conf, by, notes)
  const N = (notes, by = 'no counterpart found') => row(l, '', '', 'none', by, notes)
  const base = u.replace(/\/p\d+$/, '')
  if (l.status !== '200') {
    const tgt = l.redirect_target ? rel(l.redirect_target) : ''
    if (tgt) { const tl = legacy.find(r => rel(r.url) === tgt); if (tl && tl.status === '200') { const r2 = staticRow(tl, tgt); return { ...row(l, r2.new_route, r2.new_source, r2.confidence === 'exact' ? 'probable' : r2.confidence, 'redirect target', `legacy redirects (${l.status}) to ${tgt}; the mapping of that page applies`), } } }
    return N(l.status === '404' ? 'legacy returns 404' : `legacy redirects to ${tgt || '(none)'}`, 'status')
  }
  if (l.page_type === 'other') return N('empty legacy page (stage 1)', 'status')
  if (u === '/') return J('/', 'exact', 'home page', 'the legacy home page')
  const M = {
    '/about/about-membership': ['/about/membership', 'probable', 'nav label', 'same label (Membership) in the About section'],
    '/about/contact-us': ['/contact', 'probable', 'nav label', 'both are the contact entry point; the legacy page is a Jotform, this one lists addresses'],
    '/about/governance': ['/about/governance', 'exact', 'path and label', 'same label, same path stem'],
    '/about/who-we-are-2': ['/about', 'weak', 'nav judgment', 'no page of its own here; the About page carries the overview'],
    '/about/what-we-do': ['/about', 'weak', 'nav judgment', 'no page of its own here; the About page carries the overview'],
    '/community': ['/community', 'exact', 'path and label', 'same path and label'],
    '/data-services/solutions': ['/data-platforms', 'probable', 'nav judgment', 'both are the Data section landing page'],
    '/data-services/products': ['/data-platforms', 'weak', 'nav judgment', 'one page here covers the section'],
    '/data-services/hydroshare': ['/data-platforms', 'weak', 'tool named on the page', 'HydroShare is named on /data-platforms (checked); no page of its own'],
    '/data-services/jupyterhub': ['/data-platforms', 'weak', 'tool named on the page', 'JupyterHub is named on /data-platforms (checked); no page of its own'],
    '/data-services/matlab': ['/data-platforms', 'weak', 'tool named on the page', 'MATLAB is named on /data-platforms (checked); no page of its own'],
    '/data-services/hydrologic-information-system': ['/data-platforms', 'weak', 'tool named on the page', '"HIS" appears on /data-platforms (checked); the full name does not'],
    '/donate': ['/support', 'probable', 'function', 'both embed a Zeffy donation form (stage 3, table 3)'],
    '/community/water-science-exchange': ['/community/events/water-science-exchange-2026', 'weak', 'name', 'an event here carries the name; the legacy page describes the series, not one event'],
    '/ongoing-research-projects': ['/about/impact', 'weak', 'nav judgment', 'the nearest here, not the same thing (stage 3, table 1)'],
    '/events': ['/community/events', 'exact', 'nav label', 'same label (Events)'],
    '/cyberseminars': ['/learn-train/cyberseminars', 'probable', 'nav label', 'same content type; different section (Learn & Train)'],
    '/cyberseminars/all-upcoming': ['/learn-train/cyberseminars', 'weak', 'nav judgment', 'a filtered view of the seminar list'],
    '/job-board': ['/community/jobs', 'exact', 'nav label', 'same function'],
    '/community/news': ['/community/news', 'exact', 'path', 'same path'],
    '/about/our-team': ['/about/team', 'exact', 'nav label', 'same function'],
    '/all-programs-services': ['/learn-train', 'weak', 'nav judgment', 'the nearest overview of programs'],
    '/workshops': ['/learn-train/archive', 'probable', 'nav judgment', 'both list past workshops'],
    '/workshops/past-workshops': ['/learn-train/archive', 'probable', 'nav judgment', 'both list past workshops']
  }
  if (M[u]) { const m = M[u]; return J(m[0], m[1] === 'exact' ? 'probable' : m[1], m[2], m[3]) }   // a judgment is never exact (P3)
  if (M[base] && l.page_type === 'listing') { const m = M[base]; return J(m[0], m[1] === 'exact' ? 'probable' : m[1], 'listing root', `pager or category view of ${base}; ${m[3]}`) }
  if (/^\/job-board\//.test(u) && l.page_type === 'listing') return J('/community/jobs', 'probable', 'listing root', 'a category view of the job board; filter chips here do the same')
  if (/^\/cyberseminars\//.test(u) && l.page_type === 'listing') return J('/learn-train/cyberseminars', 'weak', 'listing root', 'a view of the seminar list')
  if (/^\/workshops\//.test(u) && l.page_type === 'listing') return J('/learn-train/archive', 'weak', 'listing root', 'a view of the workshops list')
  if (l.page_type === 'listing') return N(`no counterpart for the ${base} listing (its items have none either)`, 'listing root')
  return N({ landing: 'no entry point of this kind here (stage 3, table 1)' }[l.page_type.split(' ')[0]] || 'no page here covers this; see stage 3 table 1')
}

// ---- matches found by the probes (scripts/parity/mapping-probe.mjs) and read by hand ------------------------------------------
// Each was a "none" from the rules above. Only a row still at none is changed; a rule match is never overridden.
// [legacy path, file here, confidence, note]. A seminar file has no page, so its route is the seminar list.
const PROBE_REVIEW = [
  ['/events/webinar-an-introduction-to-cuahsi-compute-services', 'content/cyberseminars/2024-intro-compute-services-july.md', 'probable', 'a legacy event page for a webinar that is a seminar here: same title words, same day (2024-07-09)'],
  ['/events/free-webinar-an-introduction-to-cuahsi-cloud-computing', 'content/cyberseminars/2024-intro-hydroshare-may.md', 'probable', 'a legacy event page whose title reads "An Introduction to HydroShare", same day (2024-05-14) as the seminar here; the legacy URL says "cloud computing" while the legacy page title says HydroShare; Jordan to check'],
  ['/workshops/stakeholder-informed-spatial-modeling-for-hydrologic-sciences', 'content/research/2025-spatial-modeling-workshop.md', 'probable', 'the legacy workshop page and an impact story here have the same title and dates one day apart (2025-08-18, 2025-08-19); the counterpart is a story, not an event'],
  ['/events/application-deadline-stakeholder-informed-spatial-modeling-for-hydrologic-sciences', 'content/research/2025-spatial-modeling-workshop.md', 'weak', 'an application-deadline notice for the same workshop; no legacy date'],
  ['/events/cuahsi-virtual-open-house', 'content/news/251022-virtual-open-house.md', 'weak', 'same day (2025-10-22); the news item here is a recap, not an event'],
  ['/cyberseminars/series/changes-coming-to-usgs-water-data-apis', 'content/cyberseminars/2025-usgs-water-data-apis.md', 'weak', 'the legacy series page of the same talk (title similarity 0.86)'],
  ['/cyberseminars/series/post-field-season-data-practices-for-research-success', 'content/cyberseminars/2025-post-field-data-practices.md', 'weak', 'the legacy series page of the same talk (title similarity 0.88)'],
  ['/cyberseminars/series/integrating-hydrology-and-geophysics', 'content/events/260101-earthscope-geophysics.md', 'weak', 'a series here titled "Webinar Series: Integrating Hydrology and Geophysics"; no legacy date'],
  ['/cyberseminars/series/water-data-forum', 'content/events/260630-water-data-forum.md', 'weak', 'an event here titled "Water Data Forum: ..."; no legacy date'],
  ['/cyberseminars/series/synthesis-workshop-series-perceptual-models-of-dominant-hydrologic-processes-across-north-america', 'content/research/2025-perceptual-models.md', 'weak', 'an impact story with a similar title (0.67); no legacy date'],
  ['/workshops/snow-measurement-field-school-january-2022', 'content/programs/snow-field-school.md', 'weak', 'a year instance of the field school; the program here is the series, not one year'],
  ['/workshops/snow-measurement-field-school-2023', 'content/programs/snow-field-school.md', 'weak', 'a year instance of the field school; the program here is the series, not one year'],
  ['/workshops/snow-measurement-field-school-2024-2', 'content/programs/snow-field-school.md', 'weak', 'a year instance of the field school; the program here is the series, not one year'],
  ['/workshops/snow-measurement-field-school-2025', 'content/programs/snow-field-school.md', 'weak', 'a year instance of the field school; the program here is the series, not one year'],
  ['/events/deadline-to-submit-application-for-snow-measurement-field-school-2024', 'content/programs/snow-field-school.md', 'weak', 'an application deadline for a year of the field school'],
  ['/community/news/snow-measurement-field-school-2025-recap', 'content/programs/snow-field-school.md', 'weak', 'a recap of a year of the field school'],
  ['/events/watersofthack', 'content/programs/watersofthack.md', 'weak', 'the 2025 event page for the program that is a program page here'],
  ['/events/application-deadline-watersofthack-2026', 'content/events/260701-watersofthack.md', 'weak', 'an application-deadline notice; no legacy date; two files here describe the 2026 event (a duplicate pair)'],
  ['/news-opportunities', '', 'weak', 'the nearest here is the news list, /community/news']
]
for (const [lp, file, conf, note] of PROBE_REVIEW) {
  const r = out.find(x => x.legacy_url === ORIGIN + lp)
  if (!r) throw new Error('probe review: no such legacy row ' + lp)
  if (r.confidence !== 'none') continue
  const item = file ? [...events, ...news, ...impact, ...seminars, ...programs].find(x => x.file === file) : null
  const route = !file ? '/community/news' : file.includes('/cyberseminars/') ? '/learn-train/cyberseminars' : (item?.route || routeOfFile(file))
  Object.assign(r, { new_route: route, new_source: file || newInv.find(n => n.url === route)?.source || '', confidence: conf, matched_by: 'probe review', notes: note })
}

// ---- the types with no counterpart by design ------------------------------------------------------------------------
// (data portal entry, graduate program, document or file) fall through to staticRow, which returns none. Say why.
for (const r of out) if (r.confidence === 'none' && !r.notes) r.notes = { 'data portal entry': 'no collection or page for data portals here (stage 3)', 'graduate program': 'no collection or page for graduate programs here (stage 3)', 'document or file': 'no library here; documents are not hosted (stage 3)' }[r.page_type] || ''

// ---- write ------------------------------------------------------------------------------------------------------------
const cols = ['legacy_url', 'page_type', 'new_route', 'new_source', 'confidence', 'matched_by', 'notes']
out.sort((a, b) => a.legacy_url.localeCompare(b.legacy_url))
fs.writeFileSync('agent/parity/mapping.csv', [cols.join(','), ...out.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')

const byType = {}
for (const r of out) { (byType[r.page_type] ??= { legacy: 0, exact: 0, probable: 0, weak: 0, none: 0 }); byType[r.page_type].legacy++; byType[r.page_type][r.confidence]++ }
const perTarget = {}
for (const r of out) if (r.new_source.startsWith('content/') && r.new_source.endsWith('.md')) perTarget[r.new_source] = (perTarget[r.new_source] || 0) + 1
const dupTargets = Object.entries(perTarget).filter(([, n]) => n > 1).map(([target, legacy]) => ({ target, legacy })).sort((a, b) => b.legacy - a.legacy || a.target.localeCompare(b.target))   // counts every row, probe review included, any confidence
// new routes (item pages and listed items) with no legacy counterpart
const itemsHere = [
  ...events.map(e => ['events', e.file]), ...news.map(e => ['news', e.file]), ...impact.map(e => ['research', e.file]), ...newsletters.map(e => ['newsletter', e.file]),
  ...seminars.filter(s => s.fm.published).map(e => ['cyberseminars', e.file]), ...jobs.map(e => ['jobs', e.file]), ...programs.map(e => ['programs', e.file])
]
const mappedSources = new Set(out.map(r => r.new_source).filter(Boolean))
const hereWithout = {}
for (const [c, f] of itemsHere) { (hereWithout[c] ??= { items: 0, withoutLegacy: 0 }); hereWithout[c].items++; if (!mappedSources.has(f)) hereWithout[c].withoutLegacy++ }
const staffMapped = out.filter(r => r.page_type === 'person' && r.confidence === 'exact').length
fs.writeFileSync('agent/parity/mapping-numbers.json', JSON.stringify({ total: out.length, byType, hereWithout, staffMapped, newTargetsWithMoreThanOneLegacy: dupTargets }, null, 1) + '\n')

// ten least-sure probable matches: lowest title similarity among 'probable' rows that carry one
// a probable match made by judgment (nav label, function) counts as 0.5; pager, category and redirect rows are left out (their uncertainty is inherited)
const sim = r => { const m = r.notes.match(/title similarity (\d\.\d+)/); return m ? parseFloat(m[1]) : 0.5 }
const probable = out.filter(r => r.confidence === 'probable' && !['listing root', 'redirect target'].includes(r.matched_by)).sort((a, b) => sim(a) - sim(b) || a.legacy_url.localeCompare(b.legacy_url)).slice(0, 10)
fs.writeFileSync('agent/parity/mapping-least-sure.csv', [cols.join(','), ...probable.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
console.log('mapped', out.length, JSON.stringify(Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, `${v.legacy}: ${v.exact}/${v.probable}/${v.weak}/${v.none}`]))))
