// Parity stage 6: how much each body of work matters (agent/parity.md "Stage 6").
// Reads agent/parity/{bodies,url-bodies,legacy-inventory}.csv, raw/search-console/261005_pages_all.csv (not committed) and content/**.
// Writes agent/parity/{importance,tier-a-urls,cited-urls,export-unmatched}.csv and importance-numbers.json.
// The cost of absence (who is hurt) and the tier rules are my judgments (P6); every input is shown separately.
// Run: node scripts/parity/importance.mjs
import fs from 'node:fs'
import path from 'node:path'
const readCsv = f => { const s = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < s.length; i++) { const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' } else if (c !== '\r') cur += c }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  const [h, ...b] = rows; return b.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))) }
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
const write = (f, cols, rows) => fs.writeFileSync(f, [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
const ORIGIN = 'https://www.cuahsi.org'
const norm = u => { u = u.split('#')[0].split('?')[0].replace(/^http:\/\//, 'https://').replace('https://cuahsi.org', ORIGIN); return u.replace(/\/+$/, '') }

const bodies = readCsv('agent/parity/bodies.csv')
const urlBody = new Map(readCsv('agent/parity/url-bodies.csv').map(r => [norm(r.legacy_url), r.body]))
const inv = new Map(readCsv('agent/parity/legacy-inventory.csv').map(r => [norm(r.url), r]))
const exportRows = readCsv('raw/search-console/261005_pages_all.csv')

// ---- the cost of absence: who is hurt if the body is missing (mine) -----------------------------------------------------------
// High: a visitor, member or funder would notice at once, or it carries an obligation or a revenue path.
// Medium: worth having; a defined audience would miss it. Low: long tail.
const COST = {
  'Home page and section landing pages': ['High', 'Every visitor lands here; the front page of the site.'],
  'Donate': ['High', 'The giving path: low traffic, direct revenue.'],
  'Policies and conduct': ['High', 'A code of conduct and a concern-reporting process are an organisational obligation; people who need to report a concern have nowhere to go.'],
  'About, governance, membership and contact': ['High', 'How to join (dues are revenue), who governs the organisation, how to reach it.'],
  'Graduate programs directory': ['High', 'Second-largest body by search clicks (a single listing page alone had 1,359); prospective graduate students are a core audience.'],
  'Job board': ['High', 'Heavy search traffic (the board page alone is the second-largest single page by clicks); employers and job seekers.'],
  'Programs and research projects': ['High', 'The Summer Institute and Virtual University pages draw heavy search traffic; funders and participants.'],
  'Data services and software (tools)': ['High', 'The tools are the organisation\'s main offer; heavy search traffic and in the main navigation.'],
  'Staff directory and profiles': ['Medium', 'Partners and visitors look for people; present here.'],
  'Workshops and short courses': ['Medium', 'Training is a core activity; here it is carried by events and an archive page.'],
  'Events (upcoming and past)': ['Medium', 'Current events matter; the old ones are history (a policy call).'],
  'Cyberseminar archive': ['Medium', 'A large learning resource; known and deferred (Jordan).'],
  'News posts': ['Medium', 'The record of announcements; recent ones matter most.'],
  'e-Newsletters and guest spotlights': ['Medium', 'Subscriber-facing; recent issues matter most.'],
  'Water data portals catalog': ['Medium', 'A catalog researchers search for; modest clicks, large impressions.'],
  'Guest lecturer database': ['Medium', 'Faculty looking for speakers; a niche audience with a clear use.'],
  'Document library': ['Medium', 'Annual reports, minutes and strategic plans are what funders and members ask for; low web traffic.'],
  'Grant and fellowship opportunities': ['Medium', 'Fellowships and travel grants for students; 300 clicks for one page.'],
  'Research data management guide and FAQ': ['Low', 'A defined audience (researchers managing data) but the pages are reference text that drew few clicks (46); in the navigation, so a reader would find it missing. Low by traffic, not by principle.'],
  'Faculty resources': ['Low', 'Faculty are a defined audience but the four pages are short reference lists that drew 90 clicks; absence would be noticed by few. Low by traffic.'],
  'Student resources': ['Low', 'Three short pages with 31 clicks and little else; the missing Students entry point is the larger structural issue (stage 3), not these pages. Low by traffic.'],
  'Instrumentation facilities': ['Low', 'A list of 10 external facilities; the pages are short and mostly link out (34 clicks); this site already links to the legacy page.'],
  'Water Science Exchange': ['Low', 'One series page (44 clicks); the events themselves are here.'],
  'Other small pages': ['Low', 'Awards, travel policy, logos and acknowledgement text; 146 clicks across six pages. Community Awards is linked from the /community page here.'],
  'Broken or empty legacy URLs': ['n/a', 'Not content.']
}

// ---- Search Console: clicks and impressions by body ---------------------------------------------------------------------------
const clicks = new Map(), impr = new Map(), exportUrls = new Map()
const other = { rows: 0, clicks: 0, impressions: 0 }, www = { rows: 0, clicks: 0, impressions: 0 }, unmatchedWww = []
for (const r of exportRows) {
  const raw = r['Top pages']; const c = parseInt(r.Clicks, 10) || 0, i = parseInt(r.Impressions, 10) || 0
  if (!/^https?:\/\/(www\.)?cuahsi\.org(\/|$)/.test(raw)) { other.rows++; other.clicks += c; other.impressions += i; continue }
  www.rows++; www.clicks += c; www.impressions += i
  const u = norm(raw); const b = urlBody.get(u)
  exportUrls.set(u, (exportUrls.get(u) || { c: 0, i: 0 })); const e = exportUrls.get(u); e.c += c; e.i += i
  if (b) { clicks.set(b, (clicks.get(b) || 0) + c); impr.set(b, (impr.get(b) || 0) + i) }
  else unmatchedWww.push({ url: u, clicks: c, impressions: i, kind: u.includes('/uploads/') ? 'file' : 'page not in the snapshot' })
}

// ---- URLs cited in content/ (the newsletters, news, events, programs, jobs): never trust that nothing outside depends on them -------
const pat = /https?:\/\/(?:www\.)?cuahsi\.org(\/[^\s\]"'<>,;]*)?/g   // a URL may contain (); a closing ) with no opening ( is trimmed in clean()
const clean = u => { let prev; do { prev = u; u = u.replace(/[\/.*_:!?]+$/, ''); if (u.endsWith(')') && (u.match(/\(/g) || []).length < (u.match(/\)/g) || []).length) u = u.slice(0, -1) } while (u !== prev); return u }   // trailing punctuation and a closing ) with no opening ( are not part of the URL
const cited = new Map()
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
for (const f of walk('content').filter(f => /\.(md|json|ya?ml)$/.test(f) && !f.includes('members/reps'))) {
  const t = fs.readFileSync(f, 'utf8'); const coll = f.split('/')[1]
  for (const m of t.matchAll(pat)) { const u = clean(ORIGIN + (m[1] || '')); const o = cited.get(u) || {}; o[coll] = (o[coll] || 0) + 1; cited.set(u, o) }
}
const citedRows = [...cited].sort().map(([u, o]) => { const r = inv.get(u); const file = u.includes('/uploads/')
  return { url: u, kind: file ? 'file' : 'page', snapshot_status: file ? '' : (r ? r.status : 'not in the snapshot'), body: urlBody.get(u) || '', cited_in: Object.entries(o).map(([k, v]) => `${k}:${v}`).join(' '), clicks: exportUrls.get(u)?.c ?? '' } })
write('agent/parity/cited-urls.csv', ['url', 'kind', 'snapshot_status', 'body', 'cited_in', 'clicks'], citedRows)

// ---- per body ---------------------------------------------------------------------------------------------------------------
const legacy = readCsv('agent/parity/legacy-inventory.csv')
const members = new Map(); for (const r of legacy) { const b = urlBody.get(norm(r.url)); if (!members.has(b)) members.set(b, []); members.get(b).push(r) }
const rows = []
const A_SHARE = 0.05, B_SHARE = 0.01
for (const b of bodies) {
  const m = members.get(b.body) || []; const [cost, why] = COST[b.body] || ['Low', 'no cost entry']
  const share = (clicks.get(b.body) || 0) / www.clicks
  const dates = m.map(r => r.date).filter(Boolean).sort()
  const citedHere = citedRows.filter(c => c.body === b.body && c.snapshot_status === '200').length
  const citedMissing = 0
  let tier, rule
  if (cost === 'n/a') { tier = '-'; rule = 'not content' }
  else if (cost === 'High') { tier = 'A'; rule = 'cost of absence High (mine)' + (share >= A_SHARE ? ` and ${(share * 100).toFixed(1)}% of www clicks` : '') }
  else if (share >= A_SHARE) { tier = 'A'; rule = `${(share * 100).toFixed(1)}% of www clicks (at least 5%)` }
  else if (cost === 'Medium') { tier = 'B'; rule = 'cost of absence Medium (mine)' + (share >= B_SHARE ? ` and ${(share * 100).toFixed(1)}% of www clicks` : '') }
  else if (share >= B_SHARE) { tier = 'B'; rule = `${(share * 100).toFixed(1)}% of www clicks (at least 1%)` }
  else { tier = 'C'; rule = `cost Low (mine) and ${(share * 100).toFixed(1)}% of www clicks (under 1%)` }
  rows.push({ body: b.body, legacy_urls: m.length, www_clicks: clicks.get(b.body) || 0, click_share: (share * 100).toFixed(1) + '%', www_impressions: impr.get(b.body) || 0,
    internal_links_in: m.reduce((n, r) => n + (parseInt(r.internal_links_in, 10) || 0), 0), in_nav: b.in_nav, newest_dated_page: dates.length ? dates[dates.length - 1] : '', cited_urls_200: citedHere,
    cost_of_absence: cost, cost_reason: why, here_status: b.here_status, spot_checks: b.spot_checks, known_to_jordan: b.known_to_jordan, tier, tier_rule: rule })
}
const order = { A: 0, B: 1, C: 2, '-': 3 }
rows.sort((a, b) => order[a.tier] - order[b.tier] || b.www_clicks - a.www_clicks)
write('agent/parity/importance.csv', ['body', 'tier', 'tier_rule', 'cost_of_absence', 'cost_reason', 'legacy_urls', 'www_clicks', 'click_share', 'www_impressions', 'internal_links_in', 'in_nav', 'newest_dated_page', 'cited_urls_200', 'here_status', 'spot_checks', 'known_to_jordan'], rows)

// ---- URLs inside tier A bodies: the few that matter most (the 40 with the most clicks, every cited one, every one in the navigation) ----
const tierA = new Set(rows.filter(r => r.tier === 'A').map(r => r.body))
const urlRows = legacy.filter(r => tierA.has(urlBody.get(norm(r.url)))).map(r => { const u = norm(r.url); const e = exportUrls.get(u)
  return { legacy_url: r.url, body: urlBody.get(u), clicks: e?.c || 0, impressions: e?.i || 0, in_nav: r.in_nav, cited_in_content: cited.has(u) ? 'yes' : '', status: r.status } })
urlRows.sort((a, b) => b.clicks - a.clicks)
const keep = urlRows.filter((r, i) => i < 40 || r.cited_in_content || r.in_nav === 'true')
write('agent/parity/tier-a-urls.csv', ['legacy_url', 'body', 'clicks', 'impressions', 'in_nav', 'cited_in_content', 'status'], keep)

// ---- traffic to www URLs that are not in the snapshot (retired or never linked): candidates for a redirect ---------------------------
unmatchedWww.sort((a, b) => b.clicks - a.clicks)
write('agent/parity/export-unmatched.csv', ['url', 'kind', 'clicks', 'impressions'], unmatchedWww)

const tierSum = {}
for (const r of rows) { const t = tierSum[r.tier] ||= { bodies: 0, urls: 0, clicks: 0 }; t.bodies++; t.urls += r.legacy_urls; t.clicks += r.www_clicks }
fs.writeFileSync('agent/parity/importance-numbers.json', JSON.stringify({ exportRows: exportRows.length, www, other, wwwMatchedClicks: [...clicks.values()].reduce((a, b) => a + b, 0), unmatchedWww: { rows: unmatchedWww.length, clicks: unmatchedWww.reduce((n, r) => n + r.clicks, 0), files: unmatchedWww.filter(r => r.kind === 'file').length },
  cited: { distinct: citedRows.length, pages: citedRows.filter(c => c.kind === 'page').length, files: citedRows.filter(c => c.kind === 'file').length, status200: citedRows.filter(c => c.snapshot_status === '200').length, redirect302: citedRows.filter(c => c.snapshot_status === '302').length, notInSnapshot: citedRows.filter(c => c.snapshot_status === 'not in the snapshot').length },
  tiers: tierSum, thresholds: { A_share: A_SHARE, B_share: B_SHARE } }, null, 1) + '\n')
console.log(JSON.stringify(tierSum), 'www clicks', www.clicks, 'other-property clicks', other.clicks)
