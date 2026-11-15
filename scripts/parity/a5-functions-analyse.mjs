#!/usr/bin/env node
// Site audit, task A5 (org issue 110), the analysis. Offline: reads the files the three earlier steps and A4 wrote, plus content/ and public/_redirects.
//
//   node scripts/parity/a5-functions-analyse.mjs [--out agent/audit] [--date 261106]
//
// Reads a5-legacy-signals-<d>.csv and a5-new-signals-<d>.csv (a5-functions-extract.mjs), a5-behaviour-new-<d>.json (a5-behaviour-new.mjs), a5-forms-live-<d>.csv (a5-forms-live.mjs),
// a4-check-<d>.csv, a4-link-pages-<d>.csv and a4-legacy-embeds-<d>.csv (A4), content/events/*.md, content/jobs/*.md and the built pages' e-mail links
// (.output/public, counted, never written). Writes agent/audit/:
//   a5-services-<d>.csv         per outside service: legacy pages and addresses, this site's pages and addresses, A4's verdicts for this site's addresses
//   a5-forms-pages-<d>.csv      each form address with the pages that link it, on each side
//   a5-analyse-numbers-<d>.json the figures every row uses, so the report can be checked against one file
// The function table itself (a5-functions-table-<d>.csv, one row per function) is written by hand from these figures and from the hand reads in the report; it is not generated.
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
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
const J = f => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'))
const sig = { legacy: readCsv(path.join(OUT, `a5-legacy-signals-${DATE}.csv`)), new: readCsv(path.join(OUT, `a5-new-signals-${DATE}.csv`)) }
const nums = { legacy: J(`a5-legacy-numbers-${DATE}.json`), new: J(`a5-new-numbers-${DATE}.json`) }
const beh = J(`a5-behaviour-new-${DATE}.json`)
// pages with a signal: the pages are not stored per row beyond three examples, so the per-signal figure comes from the numbers file; per (signal, where, target) from the rows
const pagesOf = (side, signal) => (nums[side].signals[signal] || { pages: 0 }).pages
const rows = (side, signal, where, re) => sig[side].filter(r => r.signal === signal && (!where || r.where === where) && (!re || re.test(r.target)))
const sumPages = rs => rs.reduce((n, r) => n + Number(r.pages), 0) // the sum over targets; equals distinct pages only when a page has one such target
const maxPages = rs => rs.reduce((n, r) => Math.max(n, Number(r.pages)), 0)
const N = { legacy_pages: nums.legacy.html_files, new_pages: nums.new.html_files }

// ---- outside services
const A4 = new Map(readCsv(path.join(OUT, `a4-check-${DATE}.csv`)).map(r => [r.url, r]))
const A4pages = new Map(); for (const p of readCsv(path.join(OUT, `a4-link-pages-${DATE}.csv`))) A4pages.set(p.url, [...(A4pages.get(p.url) || []), p.page])
const SERVICES = [
  ['mailchimp', /(^|\.)(list-manage\.com|campaign-archive\.com|eepurl\.com|mailchi\.mp|mailchimp\.com)$/], ['constant-contact', /constantcontact\.com$/], ['jotform', /jotform\.com$/], ['zoom', /(^|\.)zoom\.us$/], ['cvent', /cvent\.com$/],
  ['qualtrics', /qualtrics\.com$/], ['google-forms', /^(forms\.gle|docs\.google\.com)$/], ['eventbrite', /eventbrite\.com$/], ['zeffy', /zeffy\.com$/], ['youtube', /(youtube\.com|youtu\.be|youtube-nocookie\.com)$/], ['hydroshare', /hydroshare\.org$/], ['github', /github\.com$/],
]
const svcRows = SERVICES.map(([name, re]) => {
  const lg = rows('legacy', 'link-to-service:' + name), nw = rows('new', 'link-to-service:' + name)
  const here = [...A4.values()].filter(r => re.test(r.host.replace(/^www\./, '')) && A4pages.has(r.url))
  const v = here.reduce((o, r) => ((o[r.verdict] = (o[r.verdict] || 0) + 1), o), {})
  return { service: name, legacy_pages_with_link: pagesOf('legacy', 'link-to-service:' + name), legacy_distinct_targets: lg.length, pages_here_with_link: pagesOf('new', 'link-to-service:' + name), distinct_targets_here: nw.length, a4_addresses_here: here.length, a4_verdicts_here: Object.entries(v).map(([k, n]) => `${k} ${n}`).join('; ') }
})
writeCsv(`a5-services-${DATE}.csv`, svcRows)
const svc = Object.fromEntries(svcRows.map(r => [r.service, r]))

// ---- events, jobs, e-mail links here
const front = f => { const t = fs.readFileSync(f, 'utf8'); const m = t.match(/^---\n([\s\S]*?)\n---/); return m ? YAML.parse(m[1]) : null }
const events = fs.readdirSync('content/events').filter(f => f.endsWith('.md')).map(f => front(path.join('content/events', f))).filter(e => e && e.published !== false)
const evReg = events.filter(e => e.registration && e.registration.url)
const evRegSvc = evReg.reduce((o, e) => { let h = ''; try { h = new URL(e.registration.url).hostname.replace(/^www\./, '') } catch {} const s = (SERVICES.find(([, re]) => re.test(h)) || ['other'])[0]; o[s] = (o[s] || 0) + 1; return o }, {})
const evRegVerdict = evReg.reduce((o, e) => { const r = A4.get(e.registration.url); const v = r ? r.verdict : 'not in A4 list'; o[v] = (o[v] || 0) + 1; return o }, {})
const TODAY = '2026-11-11'  // the date of the audit; an event is not over when its end (or start) is on or after it
const upcoming = events.filter(e => String(e.end || e.start) >= TODAY)
const hostOfReg = e => { try { return new URL(e.registration.url).hostname.replace(/^www\./, '') } catch { return '' } }
const regHosts = evReg.reduce((o, e) => { const h = hostOfReg(e); const k = /cvent\.me$|cvent\.com$/.test(h) ? 'cvent' : /zoom\.us$/.test(h) ? 'zoom' : /jotform\.com$/.test(h) ? 'jotform' : /cuahsi\.org$/.test(h) ? 'cuahsi.org (the legacy site)' : 'organiser or other site'; o[k] = (o[k] || 0) + 1; return o }, {})
const jobs = fs.existsSync('content/jobs') ? fs.readdirSync('content/jobs').filter(f => f.endsWith('.md')).map(f => front(path.join('content/jobs', f))).filter(Boolean) : []
const jobsPub = jobs.filter(j => j.published !== false)
const emails = new Map()
{ const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === '_nuxt' || e.name === 'pagefind' ? [] : walk(path.join(d, e.name))) : e.name.endsWith('.html') ? [path.join(d, e.name)] : [])
  for (const f of walk('.output/public')) for (const m of fs.readFileSync(f, 'utf8').matchAll(/mailto:([^"'?#<> ]+)/gi)) { const a = decodeURIComponent(m[1]).toLowerCase(); emails.set(a, (emails.get(a) || new Set()).add(f)) } }
const ROLE = new Set(['help', 'membership', 'info', 'contact', 'training', 'engagement', 'education', 'communications', 'jobs', 'webmaster', 'cuahsi'])
const roleAddr = [...emails.keys()].filter(a => ROLE.has(a.split('@')[0]) && /@cuahsi\.org$/.test(a)).map(a => a.split('@')[0]).sort()
const forms = readCsv(path.join(OUT, `a5-forms-live-${DATE}.csv`))
// where each form address is linked: the pages (legacy: A4's embeds; here: A4's link list, plus the Zeffy iframe, which is an iframe and not a link, so A4's list and the forms-live count (pages_here 0) miss it)
{
  const stripU = u => { try { const x = new URL(u); return x.origin + x.pathname.replace(/\/$/, '') } catch { return u } }
  const leg = new Map(); for (const r of readCsv(path.join(OUT, `a4-legacy-embeds-${DATE}.csv`))) if (r.kind !== 'video link') leg.set(stripU(r.address), [...(leg.get(stripU(r.address)) || []), r.page])
  const here = new Map(); for (const [u, ps] of A4pages) here.set(stripU(u), [...(here.get(stripU(u)) || []), ...ps])
  const out = []
  for (const f of forms) {
    for (const pg of [...new Set(leg.get(f.address) || [])].sort()) out.push({ address: f.address, side: 'legacy', page: pg, note: '' })
    for (const pg of [...new Set(here.get(f.address) || [])].sort()) out.push({ address: f.address, side: 'here', page: pg, note: '' })
    if (f.service === 'zeffy') for (const r of rows('new', 'iframe', null, /zeffy/)) for (const pg of r.example_pages.split(' ; ')) out.push({ address: f.address, side: 'here', page: pg, note: 'iframe, not a link: not in A4 list' })
  }
  writeCsv(`a5-forms-pages-${DATE}.csv`, out)
}
const formsBy = rs => rs.reduce((o, r) => { const k = r.status === '200' && /unavailable|no longer accepting|has ended|reached (a )?capacity/i.test(r.title) ? 'answers but says closed or unavailable' : r.status === '200' ? 'answers' : r.status === '302' ? 'redirects to cuahsi.jotform.com' : r.status === '404' ? '404' : r.status ? 'status ' + r.status : 'no answer'; o[k] = (o[k] || 0) + 1; return o }, {})
const formsHere = forms.filter(r => Number(r.pages_here) > 0), formsLegacy = forms.filter(r => Number(r.legacy_pages) > 0)
const formsOnlyLegacy = forms.filter(r => Number(r.legacy_pages) > 0 && Number(r.pages_here) === 0)

const numbers = {
  denominators: N,
  services: svcRows,
  search: { legacy_forms_pages: sumPages(rows('legacy', 'form', 'chrome', /^search/)), here: beh['search desktop 1280'].queries, here_phone_has_button: beh['search phone 390'].visible_button, here_phone_menu_has_search: beh['search phone 390'].search_in_mobile_menu, results_cap: 8 },
  legacy_filters: { selects_pages: pagesOf('legacy', 'select'), select_kinds: rows('legacy', 'select').map(r => `${r.target}: ${r.pages} pages`) },
  legacy_pager: { pages_with_pager_links: pagesOf('legacy', 'pager-link'), list_families: rows('legacy', 'pager-link').length },
  events_here: { published: events.length, with_registration_url: evReg.length, by_service_hosts: regHosts, not_over_on_audit_date: upcoming.length, not_over_with_registration_url: upcoming.filter(e => e.registration && e.registration.url).length, not_over_without: upcoming.filter(e => !(e.registration && e.registration.url)).map(e => e.slug), by_service: evRegSvc, a4_verdict_of_registration_urls: evRegVerdict },
  jobs_here: { files: jobs.length, published: jobsPub.length, published_with_url: jobsPub.filter(j => j.url).length },
  mailto_here: { distinct_addresses: emails.size, pages_with_mailto: pagesOf('new', 'mailto-link'), role_addresses_at_cuahsi: roleAddr },
  forms_checked: { addresses: forms.length, on_legacy_pages: formsLegacy.length, on_pages_here: formsHere.length, legacy_only: formsOnlyLegacy.length, here_status: formsBy(formsHere), legacy_only_status: formsBy(formsOnlyLegacy) },
  signals: { legacy: Object.fromEntries(Object.entries(nums.legacy.signals).map(([k, v]) => [k, v.pages])), new: Object.fromEntries(Object.entries(nums.new.signals).map(([k, v]) => [k, v.pages])) },
}
fs.writeFileSync(path.join(OUT, `a5-analyse-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify({ services: svcRows, events_here: numbers.events_here, jobs_here: numbers.jobs_here, mailto_here: numbers.mailto_here, forms_checked: numbers.forms_checked, legacy_filters: numbers.legacy_filters, legacy_pager: numbers.legacy_pager, search: numbers.search }, null, 1))
