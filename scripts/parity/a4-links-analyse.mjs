#!/usr/bin/env node
// Site audit, task A4 (org issue 109): the outward-link results, counted. Offline: reads the files the two earlier steps wrote.
//
//   node scripts/parity/a4-links-analyse.mjs [--out agent/audit] [--date 261106]
//
// Reads a4-links-<d>.csv (every address on the built site), a4-link-pages-<d>.csv (each address with each page that has it), a4-check-<d>.csv (the answers),
// a4-control-urls-261109.csv (10 live and 10 dead addresses known beforehand) and a4-recheck-<d>.csv. Writes agent/audit/:
//   a4-dead-links-<d>.csv     every address that answered 404/410 or a missing name, with every page that has it; also the blocked and the errors, labelled
//   a4-hosts-<d>.csv          per host: addresses, and how many answered ok / redirect / dead / blocked / error
//   a4-redirects-<d>.csv      the addresses that answered a permanent redirect (301, 308) to another host, and the host they point to
//   a4-links-control-<d>.csv  the control against the answers
//   a4-links-numbers-<d>.json
// doi.org: a 3xx to a publisher means the DOI is registered; the publisher's page was not requested (one request per host per second, and a redirect to another host is not followed).
import fs from 'node:fs'
import path from 'node:path'

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
const tally = (rows, f) => rows.reduce((o, r) => { const k = typeof f === 'function' ? f(r) : r[f]; o[k] = (o[k] || 0) + 1; return o }, {})
const links = readCsv(path.join(OUT, `a4-links-${DATE}.csv`)), pairs = readCsv(path.join(OUT, `a4-link-pages-${DATE}.csv`)), checks = readCsv(path.join(OUT, `a4-check-${DATE}.csv`))
const control = readCsv(path.join(OUT, 'a4-control-urls-261109.csv'))
const chk = new Map(checks.map(c => [c.url, c]))
const siteSet = new Set(links.map(l => l.url))
const site = links.map(l => ({ ...l, ...(chk.get(l.url) || { verdict: 'NOT CHECKED' }) }))
const numbers = {}
numbers.addresses_on_site = links.length
numbers.addresses_checked = site.filter(r => r.verdict !== 'NOT CHECKED').length
numbers.not_checked = site.filter(r => r.verdict === 'NOT CHECKED').map(r => r.url)
numbers.verdicts = tally(site, 'verdict')
numbers.occurrences_on_pages = pairs.length
numbers.verdicts_by_occurrence = (() => { const o = {}; for (const p of pairs) { const v = (chk.get(p.url) || {}).verdict || 'NOT CHECKED'; o[v] = (o[v] || 0) + 1 } return o })()
numbers.method = tally(site, 'method')
numbers.head_refused_then_get_ok = site.filter(r => r.method === 'GET' && r.head_status && r.verdict === 'ok').length
numbers.head_said_404_get_said_ok = site.filter(r => r.head_status === '404' && r.verdict === 'ok').map(r => r.host)
numbers.status_codes = tally(site, r => r.status || (r.note || 'none'))
numbers.hosts = new Set(site.map(r => r.host)).size
numbers.hosts_with_a_dead_link = new Set(site.filter(r => r.verdict === 'dead').map(r => r.host)).size
numbers.redirect_kinds = tally(site.filter(r => r.verdict === 'redirect'), r => (r.host === 'doi.org' ? 'doi.org' : 'other host') + ' ' + r.status)
numbers.doi = { addresses: site.filter(r => r.host === 'doi.org').length, verdicts: tally(site.filter(r => r.host === 'doi.org'), 'verdict') }
numbers.http_not_https = { addresses: site.filter(r => r.url.startsWith('http:')).length, verdicts: tally(site.filter(r => r.url.startsWith('http:')), 'verdict') }
const nonDoi = site.filter(r => r.host !== 'doi.org')
numbers.non_doi = { addresses: nonDoi.length, verdicts: tally(nonDoi, 'verdict') }
numbers.non_doi_redirects_permanent = nonDoi.filter(r => r.verdict === 'redirect' && ['301', '308'].includes(r.status)).length
numbers.hosts_top_by_addresses = Object.entries(tally(site, 'host')).sort((a, b) => b[1] - a[1]).slice(0, 12)
const LEGACY = r => /^(www\.)?cuahsi\.org$/.test(r.host)
numbers.links_to_the_legacy_host = { addresses: site.filter(LEGACY).length, verdicts: tally(site.filter(LEGACY), 'verdict'), uploads: site.filter(r => LEGACY(r) && /\/uploads\//.test(r.url)).length }
numbers.links_to_cuahsi_service_subdomains = { addresses: site.filter(r => /\.cuahsi\.org$/.test(r.host) && r.host !== 'www.cuahsi.org').length, verdicts: tally(site.filter(r => /\.cuahsi\.org$/.test(r.host) && r.host !== 'www.cuahsi.org'), 'verdict'), hosts: [...new Set(site.filter(r => /\.cuahsi\.org$/.test(r.host) && r.host !== 'www.cuahsi.org').map(r => r.host))] }
numbers.links_to_the_legacy_host_pages = new Set(pairs.filter(p => /^https?:\/\/(www\.)?cuahsi\.org(\/|$)/.test(p.url)).map(p => p.page)).size

// dead, blocked, errors, each with every page
const pagesBy = new Map(); for (const p of pairs) pagesBy.set(p.url, [...(pagesBy.get(p.url) || []), p.page])
const problems = site.filter(r => ['dead', 'blocked', 'error'].includes(r.verdict)).sort((a, b) => ({ dead: 0, blocked: 1, error: 2 }[a.verdict] - { dead: 0, blocked: 1, error: 2 }[b.verdict]) || a.host.localeCompare(b.host) || a.url.localeCompare(b.url))
numbers.dead_pages_affected = new Set(problems.filter(r => r.verdict === 'dead').flatMap(r => pagesBy.get(r.url) || [])).size
numbers.dead_dns_by_page_group = tally(problems.filter(r => r.verdict === 'dead' && /^DNS/.test(r.note)), r => ((pagesBy.get(r.url) || [''])[0].split('/')[1] || '') + '/' + ((pagesBy.get(r.url) || [''])[0].split('/')[2] || ''))
numbers.dead_by_host = tally(problems.filter(r => r.verdict === 'dead'), 'host')
numbers.dead_occurrences = problems.filter(r => r.verdict === 'dead').reduce((n, r) => n + (pagesBy.get(r.url) || []).length, 0)
numbers.dead_on_published_pages_of_kind = tally(problems.filter(r => r.verdict === 'dead').flatMap(r => (pagesBy.get(r.url) || [])), p => '/' + (p.split('/')[1] || ''))
numbers.blocked_by_host = tally(problems.filter(r => r.verdict === 'blocked'), 'host')
numbers.error_notes = tally(problems.filter(r => r.verdict === 'error'), r => (r.status || r.note))
writeCsv(`a4-dead-links-${DATE}.csv`, problems.length ? problems.map(r => ({ verdict: r.verdict, status: r.status, note: r.note, host: r.host, url: r.url, pages: (pagesBy.get(r.url) || []).length, page_list: (pagesBy.get(r.url) || []).slice(0, 10).join(' ; '), checked_by: r.method })) : [{ verdict: '(none)' }])
const hostRows = Object.entries(site.reduce((o, r) => { (o[r.host] = o[r.host] || { host: r.host, addresses: 0, ok: 0, redirect: 0, dead: 0, blocked: 0, error: 0 }); o[r.host].addresses++; o[r.host][r.verdict]++; return o }, {})).map(([, v]) => v).sort((a, b) => b.addresses - a.addresses)
writeCsv(`a4-hosts-${DATE}.csv`, hostRows)
const perm = nonDoi.filter(r => r.verdict === 'redirect' && ['301', '308'].includes(r.status))
writeCsv(`a4-redirects-${DATE}.csv`, perm.length ? perm.map(r => ({ status: r.status, host: r.host, redirects_to_host: r.redirect_host, url: r.url, pages: (pagesBy.get(r.url) || []).length })) : [{ status: '(none)' }])

// control
const ctl = control.map(c => { const r = chk.get(c.url); const got = r ? (r.verdict === 'ok' ? 'live' : r.verdict === 'dead' ? 'dead' : r.verdict) : 'NOT CHECKED'; return { url: c.url, known_label: c.known_label, script_verdict: r ? r.verdict : 'NOT CHECKED', script_status: r ? r.status : '', head_status: r ? r.head_status : '', method: r ? r.method : '', same: got === c.known_label ? 'same' : 'DIFFER', how_known: c.how_known } })
writeCsv(`a4-links-control-${DATE}.csv`, ctl)
numbers.control = { live_known: control.filter(c => c.known_label === 'live').length, dead_known: control.filter(c => c.known_label === 'dead').length, found: ctl.filter(c => c.same === 'same').length, of: ctl.length, differ: ctl.filter(c => c.same !== 'same').map(c => c.url), head_wrong_get_right: ctl.filter(c => c.head_status && c.head_status !== c.script_status && c.same === 'same').map(c => c.url.slice(0, 50) + ' HEAD ' + c.head_status + ' GET ' + c.script_status) }
numbers.control_addresses_also_on_the_site = control.filter(c => siteSet.has(c.url)).length

// recheck
if (fs.existsSync(path.join(OUT, `a4-recheck-${DATE}.csv`))) { const rc = readCsv(path.join(OUT, `a4-recheck-${DATE}.csv`)); numbers.recheck = { sample: rc.length, same_verdict: rc.filter(r => r.same_verdict === 'same').length, different: rc.filter(r => r.same_verdict !== 'same').map(r => r.url + ' ' + r.first_verdict + ' -> ' + r.verdict), by_host: tally(rc, 'host') , verdicts_in_sample: tally(rc, 'verdict') } }

fs.writeFileSync(path.join(OUT, `a4-links-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(JSON.stringify(numbers, null, 1))
