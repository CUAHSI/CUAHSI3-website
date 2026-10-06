// Parity stage 7: a proposed fate for each body of work (agent/parity.md "Stage 7").
// Reads agent/parity/{bodies,importance,tier-a-urls,cited-urls,export-unmatched,mapping}.csv (importance and the three after it come from
// stage 6; until stage 6 has merged they are read from .agent/s6-*).
// Writes agent/parity/dispositions.csv (one row per body, plus the URLs outside every body) and dispositions-urls.csv (tier A URLs, every cited URL,
// and the outside-every-body URLs with at least 20 clicks). Every fate is a PROPOSAL (decided_by = proposed) and mine (P6); `inferred` says what
// the proposal rests on that I did not fetch or open. The redirect draft is not generated: it follows Jordan's rulings.
// Run: node scripts/parity/dispositions.mjs
import fs from 'node:fs'
const readCsv = f => { const s = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < s.length; i++) { const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' } else if (c !== '\r') cur += c }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  const [h, ...b] = rows; return b.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))) }
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
const write = (f, cols, rows) => fs.writeFileSync(f, [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
const s6 = f => fs.existsSync('agent/parity/' + f) ? 'agent/parity/' + f : '.agent/s6-' + f
const ORIGIN = 'https://www.cuahsi.org'
const hereStatus = new Map(readCsv('agent/parity/bodies.csv').map(b => [b.body, b.here_status]))
const importance = readCsv(s6('importance.csv')), tierA = readCsv(s6('tier-a-urls.csv')), cited = readCsv(s6('cited-urls.csv')), unmatched = readCsv(s6('export-unmatched.csv'))
const mapping = new Map(readCsv('agent/parity/mapping.csv').map(r => [r.legacy_url.replace(/\/+$/, ''), r]))
const bodyOf = new Map(readCsv('agent/parity/url-bodies.csv').map(r => [r.legacy_url.replace(/\/+$/, ''), r.body]))
const mapped = (type, test) => [...mapping.values()].filter(m => m.page_type === type && ['exact', 'probable'].includes(m.confidence) && test(m.new_route)).length
const nEvents = mapped('event', x => x.startsWith('/community/events/')), nNews = mapped('news post', x => x.startsWith('/community/news/')), nSpot = mapped('newsletter issue', x => x.startsWith('/community/news/'))

// ---- the proposals, one per body. fate in the plan's vocabulary: migrated, merged, redirect, retired, external, undecided ------------------------------
// [fate, target, rule, one-sentence reason, inferred (what I did not open or fetch; empty if nothing)]
const P = {
  'Home page and section landing pages': ['migrated', '/ and /community (same paths)', 'path-preserving: no redirect needed', 'Both pages exist at the same paths; the gaps are content tasks for stage 8, not redirects.', ''],
  'Graduate programs directory': ['migrated', 'one new page, for example /learn-train/graduate-programs', 'the 30 listing pages and 107 stubs redirect to the one page', 'Highest search traffic of any absent body (2,467 of its 2,646 clicks are on the listing pages), and the data is a short list (institution, department, level, website).', 'the 30 listing pages were not opened; the shape of a stub comes from one page read in stage 3'],
  'Job board': ['migrated', '/community/jobs', '/job-board, its category and year pages and the 13 current postings redirect to /community/jobs', 'The function exists here and postings are time-limited, so old postings cannot have a page each.', ''],
  'Programs and research projects': ['migrated', '/learn-train/programs/<slug>; two pages to add (CyberWater, Next-Generation Modeling CI)', 'matched pages redirect by name; the two others redirect to /learn-train (there is no programs index page) until added', 'The Summer Institute and Virtual University pages draw heavy traffic and exist here; the two research projects are small additions.', 'the CyberWater and Next-Generation Modeling CI pages were not read'],
  'Data services and software (tools)': ['merged', '/data-platforms', 'each tool page redirects to /data-platforms', 'One page here covers the section and the tools live on their own sites; per-tool documentation is a content task.', 'the new JupyterHub address (jupyter.cuahsi.org against jupyterhub.cuahsi.org on the legacy site) was not checked; Jordan to say which is right'],
  'Staff directory and profiles': ['migrated', '/about/team and /about/team/<slug>', 'matched by name in stage 4 (22 of 22); a person with no profile page redirects to /about/team', 'The same 22 people are listed; only the profile pages differ.', ''],
  'Workshops and short courses': ['merged', '/learn-train/archive and /learn-train/programs/snow-field-school', 'workshop pages redirect to the archive; Snow School year pages go to their event page where matched (2026, 2027) and otherwise to the Snow School program page', 'Workshops are carried here by events and the archive page, so a page each is not needed.', ''],
  'About, governance, membership and contact': ['migrated', '/about, /about/governance, /about/membership, /contact', 'redirect by page (Who We Are and What We Do to /about)', 'The pages exist here; what is missing (the board roster, how to join, the address) is a content task.', ''],
  'Policies and conduct': ['migrated', 'new pages under /about (for example /about/policies)', 'four pages redirect one for one', 'A code of conduct and a way to report a concern are an obligation, and there is nothing here.', 'the four pages were not opened (about 6,100 words by size)'],
  'Donate': ['merged', '/support', '/donate redirects to /support', 'Both pages embed the same donation form; only the address differs.', ''],
  'Events (upcoming and past)': ['merged', '/community/events', `the ${nEvents} events matched in stage 4 redirect to their page; all other events redirect to /community/events`, 'About 100 old event pages have no use except as history; the list page is the nearest.', 'whether this site\'s list shows past events was not checked'],
  'Cyberseminar archive': ['migrated', '/learn-train/cyberseminars (and later a page per seminar)', 'until migrated, every seminar and series URL redirects to the seminar list', 'Known and deferred by Jordan; the list page is the safe landing in the meantime.', 'the series pages were not opened'],
  'News posts': ['merged', '/community/news', `the ${nNews} posts matched in stage 4 redirect to their news item; the rest redirect to /community/news`, 'Recent news is here; old posts have no use except as history.', 'the dates of the 49 posts come from the inventory; their content was not compared'],
  'Water data portals catalog': ['migrated', 'one catalog page, for example /community/data-portals', 'the 44 entries and 5 listing pages redirect to the one page', 'Searchers find individual entries (80,000 impressions); one table keeps them findable without 44 pages.', 'only one entry page was read; the 44 entries\' fields come from that sample'],
  'Grant and fellowship opportunities': ['migrated', 'one page, for example /learn-train/fellowships', 'the page and its three redirecting URLs go to it', 'One page draws 304 clicks and the fellowships are already mentioned in the newsletters here.', 'the page was not opened'],
  'Document library': ['migrated', 'one reports page that hosts the key documents; the rest redirect to it', 'host annual reports, strategic plans and Summer Institute reports; decide the minutes separately', 'The reports are what funders and members ask for; hosting every minute is not needed.', 'documents are described by title only; none was opened'],
  'e-Newsletters and guest spotlights': ['merged', '/community/newsletter', `the 5 monthly issues redirect to their issue; the ${nSpot} spotlight posts matched to a news item redirect to it; the others to /community/newsletter`, 'Issues from January 2026 are here; 2023 to 2025 posts have no collection.', 'whether the older posts matter to subscribers was not checked'],
  'Guest lecturer database': ['migrated', 'one filterable page without contact details', 'the list and category pages redirect to it; the 69 profile pages redirect to it', 'A short list (name, institution, topics) serves the purpose; the legacy emails are hidden by a script for a reason.', 'whether the list is current, and whether lecturers agreed to a new listing, is unknown'],
  'Other small pages': ['migrated', 'one small page each for Community Awards, Logos, Acknowledging CUAHSI and the authorship agreement; Travel Policy undecided; News & Opportunities redirects to /community/news', 'page by page (see dispositions-urls.csv)', 'Four are short statements this site already points to or will need; one needs a staff decision.', 'the pages were not opened (sizes only)'],
  'Faculty resources': ['merged', 'one "for faculty" page under Learn & Train', 'the four pages redirect to it', 'The Faculty entry point is missing (stage 3) and the pages are short reference lists.', 'the pages were not opened'],
  'Student resources': ['merged', 'one "for students" page under Learn & Train', 'the three pages redirect to it', 'The Students entry point is missing (stage 3) and the pages are short.', 'the pages were not opened'],
  'Research data management guide and FAQ': ['migrated', 'a guide page under Data & Computing', 'both pages redirect to it; until added, to /data-platforms', 'Low traffic but a real guide of about 4,000 words that researchers cite.', 'the guide and FAQ were not opened; size only'],
  'Instrumentation facilities': ['merged', 'one page listing the facilities, for example /community/instrumentation', 'the 11 pages redirect to it', 'The pages are short entries that mostly link out; /community already points at the legacy list.', 'the pages were not opened'],
  'Water Science Exchange': ['merged', '/community/events/water-science-exchange-2026', 'the page and its redirecting event URL go to the event page', 'The events are here; the series page adds little.', ''],
  'Broken or empty legacy URLs': ['retired', 'where the legacy site redirected, the same target; 404 and empty pages retire', 'legacy 302s are re-created here; 404 and empty pages are not', 'Nothing to migrate; the legacy redirects are worth keeping.', '']
}

// the single route a URL in the body lands on when nothing more specific matched (empty: the page is still to be built, so the row says so)
const DEF = { 'Home page and section landing pages': '/', 'About, governance, membership and contact': '/about', 'Job board': '/community/jobs', 'Programs and research projects': '/learn-train', 'Data services and software (tools)': '/data-platforms',
  'Staff directory and profiles': '/about/team', 'Workshops and short courses': '/learn-train/archive', 'Events (upcoming and past)': '/community/events', 'Cyberseminar archive': '/learn-train/cyberseminars', 'News posts': '/community/news',
  'e-Newsletters and guest spotlights': '/community/newsletter', 'Donate': '/support', 'Water Science Exchange': '/community/events/water-science-exchange-2026', 'Research data management guide and FAQ': '/data-platforms' }

// ---- URLs outside every body (traffic in the export, not in the snapshot) ------------------------------------------------------------------------
const pages = unmatched.filter(r => r.kind !== 'file'), files = unmatched.filter(r => r.kind === 'file')
const jobs = pages.filter(r => /\/job-board(\/|$)/.test(r.url)), otherPages = pages.filter(r => !/\/job-board(\/|$)/.test(r.url))
const sum = (a, k = 'clicks') => a.reduce((n, r) => n + (parseInt(r[k], 10) || 0), 0)
const outside = [
  { body_or_url: 'Outside every body: job-board URLs (expired postings and year pages)', urls: jobs.length, clicks: sum(jobs), fate: 'redirect', target: '/community/jobs', tier: '', rule: 'every /job-board/... URL redirects to /community/jobs (the nearest listing)', reason: 'Expired postings have no page here and the list page is where a job seeker belongs.', inferred: 'these are inferred to be old postings from their URLs and clicks; none was fetched' },
  { body_or_url: 'Outside every body: files', urls: files.length, clicks: sum(files), fate: 'migrated', target: 'files this site links or cites, and the annual, strategic-plan and Summer Institute reports, hosted here; the rest redirect to the reports page', tier: '', rule: 'by file name: reports and plans are hosted (needs Jordan\'s approval: public/ files linked from outside, rule 8); every other file redirects to the reports page', reason: 'Search sends people straight to the report PDFs, and this site already links 14 files on the legacy host.', inferred: 'no file was opened; "report" is judged from the file name' },
  { body_or_url: 'Outside every body: other pages (staff, events, news, a campaign page)', urls: otherPages.length, clicks: sum(otherPages), fate: 'redirect', target: 'staff profiles to /about/team; events to /community/events; news to /community/news; /search to the home page; /lets-talk-about-water undecided', tier: '', rule: 'by path prefix', reason: 'Each lands on the nearest list; the one page I have not seen stays undecided.', inferred: 'former-staff status and the campaign page\'s purpose are inferred; none was fetched' }
]

// ---- write dispositions.csv --------------------------------------------------------------------------------------------------------------------------
const order = { A: 0, B: 1, C: 2, '-': 3 }
const rows = importance.slice().sort((a, b) => order[a.tier] - order[b.tier] || b.www_clicks - a.www_clicks).map(b => {
  const p = P[b.body]; if (!p) throw new Error('no proposal for ' + b.body)
  const hs = hereStatus.get(b.body)
  return { body_or_url: b.body, urls: b.legacy_urls, clicks: b.www_clicks, fate: p[0], target: p[1], here_now: { absent: 'to build', partial: 'exists, thin', present: 'exists', different: 'exists, done differently' }[hs] || '', tier: b.tier, rule: p[2], reason: p[3], inferred: p[4], decided_by: 'proposed' } })
for (const o of outside) rows.push({ ...o, decided_by: 'proposed' })
write('agent/parity/dispositions.csv', ['body_or_url', 'urls', 'clicks', 'fate', 'target', 'here_now', 'tier', 'rule', 'reason', 'inferred', 'decided_by'], rows)

// ---- dispositions-urls.csv ---------------------------------------------------------------------------------------------------------------------------
const urlRows = new Map()
const defaultFor = u => { const b = bodyOf.get(u.replace(/\/+$/, '')); const p = b && P[b]; return p ? { fate: p[0], target: DEF[b] ?? '', rule: p[2] + (DEF[b] === undefined && p[0] !== 'retired' ? ' (the target page is still to be built)' : ''), tier: (importance.find(i => i.body === b) || {}).tier || '', body: b } : null }
const SNOW = '/learn-train/programs/snow-field-school'
const add = (u, why, extra = {}) => { const key = u.replace(/\/+$/, ''); if (urlRows.has(key)) { urlRows.get(key).why += '; ' + why; return }
  const d = defaultFor(key) || {}; const m = mapping.get(key)
  const matched = m && ['exact', 'probable'].includes(m.confidence) && m.new_route
  if (!matched && /snow-measurement-field-school/.test(key) && d.body === 'Workshops and short courses') { extra = { ...extra, target: SNOW, rule: 'a year page of the Snow School goes to the Snow School program page' } }
  urlRows.set(key, { legacy_url: key || ORIGIN, body: d.body || extra.body || '', fate: extra.fate || d.fate || 'undecided', target: matched ? m.new_route : (extra.target || d.target || ''), tier: d.tier ?? '', rule: matched ? `matched in stage 4 (${m.confidence}, ${m.matched_by})` : (extra.rule || d.rule || ''), why, decided_by: 'proposed' }) }
for (const r of tierA) add(r.legacy_url, 'tier A body: one of the 40 URLs with most clicks, or in the navigation')
for (const r of cited) add(r.url, 'cited in content/ (' + r.cited_in + '); ' + (r.snapshot_status ? 'snapshot status ' + r.snapshot_status : 'file'),
  r.snapshot_status === 'not in the snapshot' ? { fate: 'undecided', target: '', rule: 'a cited URL that is not in the snapshot: needs a look at the live site, and the entry here that cites it should link to the real posting or be retired, not be sent to the list' } : r.kind === 'file' ? { fate: 'migrated', target: '', rule: 'a file this site cites: hosted here if it is a report or plan (the files rule), otherwise redirected to the reports page; the page is still to be built' } : {})
for (const r of unmatched) if ((parseInt(r.clicks, 10) || 0) >= 20) { const isJob = /\/job-board(\/|$)/.test(r.url), isFile = r.kind === 'file'
  add(r.url, `outside every body: ${r.clicks} clicks`, isJob ? { fate: 'redirect', target: '/community/jobs', rule: 'job-board URLs redirect to the nearest listing' } : isFile ? { fate: 'migrated', target: '', rule: 'files: a hosted copy or the reports page, both still to be built (see the outside-every-body rule)' } : /lets-talk-about-water/.test(r.url) ? { fate: 'undecided', target: '', rule: 'I have not seen this page' } : { fate: 'redirect', target: /our-team/.test(r.url) ? '/about/team' : /news/.test(r.url) ? '/community/news' : /events/.test(r.url) ? '/community/events' : '', rule: 'by path prefix' }) }
const out = [...urlRows.values()].sort((a, b) => a.legacy_url.localeCompare(b.legacy_url))
write('agent/parity/dispositions-urls.csv', ['legacy_url', 'body', 'fate', 'target', 'tier', 'rule', 'why', 'decided_by'], out)
const byFate = {}; for (const r of rows) byFate[r.fate] = (byFate[r.fate] || 0) + 1
fs.writeFileSync('agent/parity/dispositions-numbers.json', JSON.stringify({ rows: rows.length, bodies: importance.length, outside: outside.map(o => ({ what: o.body_or_url, urls: o.urls, clicks: o.clicks })), byFate, urlRows: out.length }, null, 1) + '\n')
console.log(rows.length, 'rows;', out.length, 'URL rows;', JSON.stringify(byFate))
