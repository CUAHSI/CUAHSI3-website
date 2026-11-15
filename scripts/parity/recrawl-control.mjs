#!/usr/bin/env node
// Site audit, task A1 (org issue 100): the controls for scripts/parity/recrawl-diff.mjs, run against the live site.
//
//   node scripts/parity/recrawl-control.mjs --date 261106 [--n 10]
//
// Control 1 (stability): n pages the snapshot holds as 200 and that did not change since October are fetched again, and the hash of
// their <main> text is compared with the snapshot's. If a page that nobody edited gets a new hash, "changed" in the diff
// cannot be trusted. Control 1b does the same for 5 pages likely to be dynamic (home, events, news, job board, cyberseminars). Control 2: every URL listed as
// added or removed is requested once and its status printed, for a person to compare with the diff. Requests are one at a time, 2 seconds
// apart, with the crawler's User-Agent: at most n + 5 + 26 requests.
// Run it from the folder that holds raw/ (the main checkout). Reads the diff CSV from agent/audit/ of the folder given by --audit.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = String(argv.date || ''), N = Number(argv.n || 10), AUDIT = String(argv.audit || path.join('agent', 'audit'))
if (!DATE) { console.error('usage: recrawl-control.mjs --date <date> [--n 10] [--audit <folder>]'); process.exit(2) }
const UA = 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)'
const sleep = ms => new Promise(r => setTimeout(r, ms))
function parseCsv(text) {   // the diff quotes a cell that holds a comma, so split(',') would shift the columns
  const out = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); out.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  return out
}
const table = parseCsv(fs.readFileSync(path.join(AUDIT, `recrawl-${DATE}-urls.csv`), 'utf8')).filter(r => r.length > 1)
const col = table.shift()
const rows = table
const get = (r, name) => r[col.indexOf(name)]
const mainHash = html => {
  const $ = cheerio.load(html); const m = $('main').first(); if (!m.length) return ''
  m.find('script, style, svg, noscript').remove()
  return crypto.createHash('sha1').update(m.text().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)
}
// an evenly spaced sample of the unchanged pages, not the first n
const same = rows.filter(r => get(r, 'change') === 'same' && !get(r, 'url').includes('@'))
const sample = Array.from({ length: Math.min(N, same.length) }, (_, i) => same[Math.floor(i * same.length / Math.min(N, same.length))])
let stable = 0
console.log('CONTROL 1: stability of the text hash, ' + sample.length + ' unchanged pages fetched again')
for (const r of sample) {
  const res = await fetch(get(r, 'url'), { headers: { 'User-Agent': UA } })
  const h = res.status === 200 ? mainHash(await res.text()) : 'status ' + res.status
  const ok = h === get(r, 'new_hash'); if (ok) stable++
  console.log((ok ? 'same     ' : 'DIFFERENT') + ' ' + get(r, 'url').replace('https://www.cuahsi.org', '') + ' snapshot ' + get(r, 'new_hash') + ' now ' + h)
  await sleep(2000)
}
console.log('stable: ' + stable + ' of ' + sample.length)

// Control 1b: pages most likely to change from hour to hour (the home page and the listings), fetched again a few hours after the crawl.
const dynamic = ['https://www.cuahsi.org', 'https://www.cuahsi.org/events', 'https://www.cuahsi.org/community/news', 'https://www.cuahsi.org/job-board', 'https://www.cuahsi.org/cyberseminars']
console.log('\nCONTROL 1b: pages likely to be dynamic, fetched again')
for (const u of dynamic) {
  const r = rows.find(x => get(x, 'url') === u); if (!r) continue
  const res = await fetch(u, { headers: { 'User-Agent': UA } })
  const h = res.status === 200 ? mainHash(await res.text()) : 'status ' + res.status
  console.log((h === get(r, 'new_hash') ? 'same     ' : 'DIFFERENT') + ' ' + (u.replace('https://www.cuahsi.org', '') || '/') + ' snapshot ' + get(r, 'new_hash') + ' now ' + h + ' (diff called it ' + get(r, 'change') + ')')
  await sleep(2000)
}

// Control 2: every added URL and every removed URL, status now (at most 16 + 10 requests)
console.log('\nCONTROL 2: status now of every added and every removed URL')
for (const ch of ['added', 'removed']) {
  const list = rows.filter(r => get(r, 'change') === ch && !get(r, 'url').includes('[email-address-as-path]'))
  let n200 = 0, n404 = 0
  for (const r of list) {
    const res = await fetch(get(r, 'url'), { headers: { 'User-Agent': UA }, redirect: 'manual' })
    if (res.status === 200) n200++; else if (res.status === 404) n404++
    console.log(ch + ' ' + res.status + ' ' + get(r, 'url').replace('https://www.cuahsi.org', ''))
    await sleep(2000)
  }
  console.log(ch + ': ' + list.length + ' requested, ' + n200 + ' answer 200, ' + n404 + ' answer 404')
}
