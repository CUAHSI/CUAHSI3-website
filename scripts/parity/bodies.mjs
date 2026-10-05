// Parity stage 5a: group every legacy URL into one body of work (agent/parity.md "Stage 5").
// Reads agent/parity/legacy-inventory.csv and agent/parity/mapping.csv. Writes agent/parity/bodies.csv (one row per body),
// agent/parity/url-bodies.csv (one row per legacy URL) and agent/parity/bodies-numbers.json.
// The grouping rules, audience, "here" status and the known_to_jordan flag are my judgments (P6); each body says why in `notes`.
// Run: node scripts/parity/bodies.mjs
import fs from 'node:fs'
const ORIGIN = 'https://www.cuahsi.org'
const readCsv = f => { const s = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < s.length; i++) { const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' } else if (c !== '\r') cur += c }
  const [h, ...b] = rows; return b.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))) }
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
const legacy = readCsv('agent/parity/legacy-inventory.csv')
const mapping = new Map(readCsv('agent/parity/mapping.csv').map(r => [r.legacy_url, r]))

// ---- the bodies, in the order the rules are tried ------------------------------------------------------------------------
// test(path, row) -> boolean. path has no origin and no trailing slash ("/" for the home page).
const starts = (...p) => path => p.some(x => path === x || path.startsWith(x + '/'))
const B = [
  { name: 'Home page and section landing pages', test: (p, r) => p === '/' || p === '/community' || p === '/about', audience: 'every visitor',
    here: 'partial', equivalent: '/, /about, /community, /learn-train, /data-platforms, /hire-cuahsi', notes: 'The home page and the section front pages. Present but thinner (stage 5b: pairs 7 and 8 are partial: the news carousel, education cards, Community Awards and Water Science Exchange sections are absent). Organised differently (five sections here, six on the legacy site).' },
  { name: 'Donate', test: starts('/donate'), audience: 'donors', here: 'present', equivalent: '/support', notes: 'Both embed the same Zeffy donation form (stage 3). Stage 5b (pair 4): the wording differs in small ways that are facts (a donor quote reworded, a headcount dropped, a new claim); the substance is present.' },
  { name: 'Policies and conduct', test: starts('/about/policies-and-conduct'), audience: 'staff, members, anyone reporting a concern; an organisational obligation',
    here: 'absent', equivalent: '', notes: 'Code of conduct, a conduct concern report form, an investigation and consequences policy guide (about 6,100 words). No page, link or mention here (stage 3).' },
  { name: 'Document library', test: (p, r) => starts('/about/library', '/library')(p) || r.page_type === 'document or file', audience: 'members, funders, researchers',
    here: 'absent', equivalent: '', notes: 'Annual reports, board and membership minutes, strategic plans, technical reports: 76 document pages, 5 empty category pages and the listings. Here 4 PDFs are linked from About and Governance, all 4 hosted on the legacy domain. 105 PDFs are linked from the legacy site (stage 1).' },
  { name: 'Staff directory and profiles', test: starts('/about/our-team'), audience: 'visitors, partners', here: 'partial', equivalent: '/about/team (22 people listed, 6 with a profile page)', notes: 'Both pages list the same 22 people. The legacy page shows a biography, fun fact and external profile links per person in the page; here only 6 people have a profile page (stage 5b, pair 9; bios on those pages not read). One staff member\'s role differs between the sites.' },
  { name: 'About, governance, membership and contact', test: starts('/about'), audience: 'prospective members, partners, funders', here: 'partial', equivalent: '/about, /about/governance, /about/membership, /contact',
    notes: 'Who We Are, What We Do, Governance, Membership, Contact Us. The pages exist but substance is missing (stage 5b, pairs 1, 2, 3 and 13): the board and committee rosters, how to join (categories, fees, application form), the member representatives information and the office address.' },
  { name: 'Graduate programs directory', test: starts('/students/graduate-programs-in-water-science', '/students/graduate-programs-in-water-science-dev'), audience: 'prospective graduate students',
    here: 'absent', equivalent: '', notes: '30 listing pages (master\'s, PhD, undergraduate, other) and 107 `-dev` stubs (institution, department, website). Jordan noted the stubs at stage 1.' },
  { name: 'Student resources', test: (p) => starts('/students', '/resources-for-undergraduate-students', '/new-grad-guide')(p), audience: 'students',
    here: 'absent', equivalent: '', notes: 'The Students section front page, undergraduate resources and a first-year graduate guide. No Students entry point here (stage 3).' },
  { name: 'Guest lecturer database', test: starts('/faculty/guest-lecturer-database'), audience: 'faculty looking for guest speakers',
    here: 'absent', equivalent: '', notes: '69 lecturers (institution and lecture topics) with category filters. No collection or page here.' },
  { name: 'Faculty resources', test: starts('/faculty'), audience: 'faculty', here: 'absent', equivalent: '', notes: 'Teaching resources, professional resources, resources for online education and the Faculty front page. No Faculty entry point here (stage 3).' },
  { name: 'Water data portals catalog', test: starts('/community/water-data-portals'), audience: 'researchers looking for data',
    here: 'absent', equivalent: '', notes: '44 catalog entries (owner, scope, access, API, export formats, contact) and their listing pages. No collection or page here; **/community links to the legacy catalog page** (www.cuahsi.org/community/water-data-portals), so it is reachable only while the legacy site stays up.' },
  { name: 'Instrumentation facilities', test: starts('/hydrologic-instrumentation-facilities'), audience: 'researchers needing field equipment', here: 'absent', equivalent: '', notes: 'A list of 10 national facilities. The phrase appears on one page here, which **links to the legacy page** (www.cuahsi.org/hydrologic-instrumentation-facilities); no page of its own.' },
  { name: 'Cyberseminar archive', test: starts('/cyberseminars'), audience: 'researchers and students learning', here: 'partial', equivalent: '/learn-train/cyberseminars (15 seminar files, 11 published)',
    notes: '67 seminar pages and 20 series pages with recordings, speakers and registration. Known and deferred (Jordan, 5 Oct 2026: "I\'m aware the seminars are missing, we just haven\'t focused on getting them added yet"). The home page here says 350+ recordings.', known: 'yes' },
  { name: 'Workshops and short courses', test: starts('/workshops'), audience: 'researchers and students learning', here: 'different', equivalent: '/learn-train/archive and 11 workshop events (/community/events)',
    notes: '20 workshop pages (instructors, overview, dates), the past-workshops list and a propose-a-workshop page. Here workshops are events plus the archive page.' },
  { name: 'Events (upcoming and past)', test: starts('/events'), audience: 'the community', here: 'partial', equivalent: '/community/events (40 events)',
    notes: 'About 118 event pages, most of them past. Here 40 events, most current. Whether the old events are kept is a policy decision, not a content gap.' },
  { name: 'e-Newsletters and guest spotlights', test: (p, r) => r.page_type === 'newsletter issue', audience: 'members, subscribers', here: 'partial', equivalent: '/community/newsletter (9 issues from January 2026)',
    notes: 'On the legacy site these are news posts (19, 2023 to 2026). Here newsletters are their own collection, from January 2026.' },
  { name: 'News posts', test: starts('/community/news'), audience: 'the community', here: 'partial', equivalent: '/community/news (12 items)',
    notes: '49 news posts plus pager pages and 3 broken email-address URLs (counted under "Broken or empty legacy URLs").' },
  { name: 'Job board', test: starts('/job-board', '/community/job-board'), audience: 'job seekers, employers', here: 'present', equivalent: '/community/jobs (29 jobs)',
    notes: 'Present: the function exists on both sites, and the 5b verdict for this body is partial only because the two lists hold different postings (and the legacy date filter, pager and category pages have no equivalent). None of the 13 legacy postings match one of the 29 here (stage 4); 6 jobs here link to legacy job pages absent from the snapshot. The function is present on both sites. Stage 5b (pair 10): the lists are different postings, as expected; the legacy date filter, pager and category pages have no equivalent.' },
  { name: 'Data services and software (tools)', test: (p) => starts('/data-services', '/data-models')(p) && !/research-data-management-guide|frequently-asked-questions/.test(p), audience: 'researchers using CUAHSI tools', here: 'partial', equivalent: '/data-platforms (one page)',
    notes: 'Solutions, Products, HydroShare, JupyterHub, MATLAB, HIS, the model domain subsetter. Here one page that names some of the tools.' },
  { name: 'Research data management guide and FAQ', test: starts('/data-services/research-data-management-guide', '/data-services/frequently-asked-questions'), audience: 'researchers', here: 'absent', equivalent: '', notes: 'A guide of about 4,000 words and a 600-word FAQ.' },
  { name: 'Programs and research projects', test: (p, r) => r.page_type === 'program' && !p.startsWith('/grant-opportunities') || p === '/ongoing-research-projects' || p === '/all-programs-services', audience: 'funders, partners, participants', here: 'partial',
    equivalent: '/learn-train/programs (4 programs: Summer Institute, Virtual University, Snow Field School, WaterSoftHack)', notes: 'CyberWater, Next-Generation Modeling CI, the Summer Institute, Virtual University and the research projects list. The first two have no page here; /community links to the legacy research projects page, and the legacy URLs for CyberWater2 training and the Virtual University are linked from here.' },
  { name: 'Grant and fellowship opportunities', test: starts('/grant-opportunities'), audience: 'graduate students, researchers', here: 'absent', equivalent: '', notes: 'A grant opportunities page; three further URLs (Pathfinder Fellowship, Hydroinformatics Innovation Fellowship, Instrumentation Discovery Travel Grant) redirect to it and are counted under broken or redirected URLs. The newsletters here mention them; no page of their own.' },
  { name: 'Water Science Exchange', test: (p) => p === '/community/water-science-exchange' || p.startsWith('/events/cuahsi-water-science-exchange'), audience: 'the community', here: 'partial', equivalent: 'events only (3 Water Science Exchange events)', notes: 'A page for the series (one redirecting event URL is counted under broken or redirected URLs). Here only event entries.' },
  { name: 'Other small pages', test: (p) => ['/community-awards', '/travel-policy', '/logos', '/acknowledging-cuahsi', '/news-opportunities'].includes(p) || p.startsWith('/authorship-agreement'), audience: 'staff, members, authors',
    here: 'absent', equivalent: '', notes: 'Community Awards, Travel Policy, Logos & Usage Standards, Acknowledging CUAHSI, News & Opportunities, the Summer Institute authorship agreement.' },
  { name: 'Broken or empty legacy URLs', test: (p, r) => r.status !== '200' || r.page_type === 'other', audience: 'nobody', here: 'n/a', equivalent: '', notes: '4 not-found URLs (3 are email addresses written as links), redirects, and empty pages. Nothing to migrate.' }
]
const UNASSIGNED = 'Unassigned'

// ---- assign every URL ----------------------------------------------------------------------------------------------------
const pathOf = u => { const p = u.replace(ORIGIN, '').replace(/\/+$/, ''); return p || '/' }
const assign = new Map(); const members = new Map(B.map(b => [b.name, []]))
members.set(UNASSIGNED, [])
for (const r of legacy) {
  const p = pathOf(r.url)
  let body = B.find(b => b.test(p, r))
  // every non-200 URL (404 or redirect) goes to the broken body, even when its path belongs to a section
  if (r.status !== '200') body = B.find(b => b.name === 'Broken or empty legacy URLs')
  const name = body ? body.name : UNASSIGNED
  assign.set(r.url, name); members.get(name).push(r)
}

// ---- write ---------------------------------------------------------------------------------------------------------------
const spot = new Map()
for (const r of readCsv('agent/parity/spot-checks.csv')) spot.set(r.body, (spot.get(r.body) || []).concat(`${r.pair}:${r.verdict_final}`))
const cols = ['body', 'audience', 'legacy_urls', 'legacy_words', 'in_nav', 'here_equivalent', 'here_status', 'known_to_jordan', 'mapped_exact', 'mapped_probable', 'mapped_weak', 'mapped_none', 'spot_checks', 'notes']
const rows = []
for (const b of [...B, { name: UNASSIGNED, audience: '', here: '', equivalent: '', notes: 'URLs that fit no rule' }]) {
  const m = members.get(b.name); if (b.name === UNASSIGNED && !m.length) continue
  const conf = c => m.filter(r => (mapping.get(r.url)?.confidence) === c).length
  rows.push({ body: b.name, audience: b.audience, legacy_urls: m.length, legacy_words: m.reduce((n, r) => n + (parseInt(r.word_count, 10) || 0), 0), in_nav: m.filter(r => r.in_nav === 'true').length,
    here_equivalent: b.equivalent, here_status: b.here, known_to_jordan: b.known || 'no', mapped_exact: conf('exact'), mapped_probable: conf('probable'), mapped_weak: conf('weak'), mapped_none: conf('none'), spot_checks: (spot.get(b.name) || []).join(' '), notes: b.notes })
}
rows.sort((a, b) => b.legacy_words - a.legacy_words)
fs.writeFileSync('agent/parity/bodies.csv', [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
fs.writeFileSync('agent/parity/url-bodies.csv', ['legacy_url,body', ...legacy.map(r => [r.url, assign.get(r.url)].map(csvCell).join(','))].join('\n') + '\n')
const total = rows.reduce((n, r) => n + r.legacy_urls, 0)
fs.writeFileSync('agent/parity/bodies-numbers.json', JSON.stringify({ legacyUrls: legacy.length, assigned: total, unassigned: members.get(UNASSIGNED).length, bodies: rows.length, byStatus: Object.fromEntries(rows.reduce((m, r) => m.set(r.here_status, (m.get(r.here_status) || 0) + r.legacy_urls), new Map())) }, null, 1) + '\n')
console.log(`bodies ${rows.length}, urls ${total} of ${legacy.length}, unassigned ${members.get(UNASSIGNED).length}`)
