#!/usr/bin/env node
// Site audit, task A3f (org issue 107): the only part that uses the network. Plain GET requests, nothing is sent and nothing is posted.
//
//   node scripts/parity/a3f-live-check.mjs --snapshot ../CUAHSI3-website/raw/legacy-site/261106/pages [--out agent/audit] [--date 261106]
//
// Writes agent/audit/:
//   a3f-links-<d>.csv    the posting link (`url`) of each of the job files in content/jobs/ (149): HTTP status, where it ended, a verdict
//   a3f-cited-<d>.csv    the eight addresses on the legacy site that this site's content cites and the October snapshot did not hold:
//                        6 old job postings, /apply/watersofthack and /register/open-house: status, where it ended, the page's title and first heading
//   a3f-legacy-apply-<d>.csv  the "Link to Apply" of each job page the legacy board still shows (14 pages, those that have one): status, where it ended, a verdict
// The verdict: live (a 2xx page), moved (ends on another address, 2xx), dead (404, 410, or a DNS failure), blocked (401, 403, 429), error (5xx, timeout, other).
// "blocked" and "error" say nothing about whether the posting exists; they are listed as unchecked. A page that answers 200 may still say the job is closed:
// only the status is read here, plus the title of the page for the eight cited addresses.
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, rows) => { const h = Object.keys(rows[0]); fs.writeFileSync(path.join(OUT, file), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n') }
const UA = 'Mozilla/5.0 (compatible; CUAHSI-site-audit; read-only link check)'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function probe(url) {
  const t0 = Date.now()
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA, accept: 'text/html,*/*' } })
    let title = '', h1 = ''
    if (res.ok && /html/i.test(res.headers.get('content-type') || '')) {
      const t = (await res.text()).slice(0, 400000)
      title = ((t.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim().slice(0, 140)
      h1 = ((t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140)
    }
    const norm = x => x.split('#')[0].replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase()
    const same = (a, b) => norm(a) === norm(b)
    const bot = /perfdrive|captcha|challenge|px-cloud/i.test(new URL(res.url).hostname)
    const verdict = res.status === 404 || res.status === 410 ? 'dead' : bot ? 'blocked' : res.ok ? (same(res.url, url) ? 'live' : 'moved') : [401, 403, 429].includes(res.status) ? 'blocked' : 'error'
    const fin = (() => { try { const u = new URL(res.url); return u.origin + u.pathname } catch { return res.url } })()
    return { status: res.status, final_url: fin, verdict, title, h1, ms: Date.now() - t0 }
  } catch (e) {
    const code = String(e?.cause?.code || e?.name || 'error')
    return { status: '', final_url: '', verdict: /ENOTFOUND/.test(code) ? 'dead' : 'error', title: '', h1: '', ms: Date.now() - t0, note: code }
  }
}

// requests to one host are spaced 1.5 s apart; different hosts run at the same time (6 workers)
async function run(items) {
  const byHost = new Map(), results = new Map()
  for (const it of items) { const h = (() => { try { return new URL(it.url).hostname } catch { return 'bad' } })(); byHost.set(h, [...(byHost.get(h) || []), it]) }
  const queue = [...byHost.values()]
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const group = queue.shift()
      for (const it of group) { results.set(it, await probe(it.url)); await sleep(1500) }
    }
  }))
  return items.map(it => ({ it, r: results.get(it) }))
}

fs.mkdirSync(OUT, { recursive: true })
const JD = path.join('content', 'jobs')
const jobs = fs.readdirSync(JD).filter(f => f.endsWith('.md')).sort().map(f => {
  const y = parseYaml(fs.readFileSync(path.join(JD, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1])
  return { file: f, url: String(y.url || ''), published: y.published === true, source: y.source || '', posted: y.posted instanceof Date ? y.posted.toISOString().slice(0, 10) : String(y.posted || ''), deadline: y.deadline instanceof Date ? y.deadline.toISOString().slice(0, 10) : String(y.deadline || '') }
})
const CITED = ['/apply/watersofthack', '/register/open-house', '/job-board/field-ecohydrologist', '/job-board/planner-project-manager', '/job-board/river-spill-response-fellow', '/job-board/stormwater-management-research-postdoctoral-scholar', '/job-board/water-resources-fellow', '/job-board/water-resources-planning-intern'].map(p => ({ url: 'https://www.cuahsi.org' + p, path: p }))
const cited = await run(CITED)
writeCsv(`a3f-cited-${DATE}.csv`, cited.map(({ it, r }) => ({ path: it.path, status: r.status, verdict: r.verdict, final_url: r.final_url, title: r.title, h1: r.h1, note: r.note || '' })))
const SNAP = argv.snapshot ? String(argv.snapshot) : ''
let legacyApply = []
if (SNAP) {
  const JB = path.join(SNAP, 'job-board')
  const items = []
  for (const f of fs.readdirSync(JB).filter(f => f.endsWith('.html') && !['p2', 'graduate-assistantship', 'permanent-position', 'post-doc'].includes(f.replace(/\.html$/, '')))) {
    const $ = cheerio.load(fs.readFileSync(path.join(JB, f), 'utf8')); const href = $('div.jobs.detail dt:contains("Link to Apply")').next('dd').find('a').attr('href') || ''
    if (href) items.push({ url: href, slug: f.replace(/\.html$/, '') })
  }
  legacyApply = await run(items)
  writeCsv(`a3f-legacy-apply-${DATE}.csv`, legacyApply.map(({ it, r }) => ({ legacy_slug: it.slug, status: r.status, verdict: r.verdict, host: (() => { try { return new URL(it.url).hostname } catch { return '' } })(), moved_to_other_host: r.final_url && (() => { try { return new URL(r.final_url).hostname !== new URL(it.url).hostname ? 'yes' : '' } catch { return '' } })() ? 'yes' : '', note: r.note || '' })))
}
const results = await run(jobs.filter(j => j.url))
writeCsv(`a3f-links-${DATE}.csv`, results.map(({ it, r }) => ({ file: it.file, published: it.published, source: it.source, posted: it.posted, deadline: it.deadline, url: it.url, status: r.status, verdict: r.verdict, final_url: r.final_url === it.url ? '' : r.final_url, note: r.note || '' })))
const tally = rows => rows.reduce((o, r) => ((o[r.r.verdict] = (o[r.r.verdict] || 0) + 1), o), {})
console.log('legacy apply', legacyApply.length, JSON.stringify(tally(legacyApply)), 'cited', JSON.stringify(tally(cited)), 'job links', results.length, JSON.stringify(tally(results)))
