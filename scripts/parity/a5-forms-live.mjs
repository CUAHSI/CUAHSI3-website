#!/usr/bin/env node
// Site audit, task A5 (org issue 110), step 3 of 3: the form and registration services the two sites hand a visitor to. The only part that uses the network.
//
//   node scripts/parity/a5-forms-live.mjs [--out agent/audit] [--date 261106] [--limit N]
//
// Which addresses: every address of a form or registration service that A4 found on a legacy page (agent/audit/a4-legacy-embeds-<d>.csv, kind "form, map, event or
// donation link" or "iframe") or on a page of this site (a4-links-<d>.csv with a4-link-pages-<d>.csv), when its host is Jotform, Google Forms, Qualtrics, Cvent, Eventbrite,
// Zeffy, Mailchimp's subscribe address, Constant Contact's opt-in, Microsoft Forms, Calendly, Typeform, SurveyMonkey, HubSpot or Airtable. Zoom (one meeting link per event) is
// counted in a5-functions-analyse.mjs and not requested again here: A4 already checked the Zoom addresses of this site.
// What is sent: one plain GET per address, the first 96 KB of the answer read for its <title>, nothing posted, nothing typed, no cookie kept. One request per host name per
// second; a redirect is followed only while it stays on the same host (5 hops at most); a redirect to another host is recorded, not followed.
// A page title that holds an e-mail address is written with the address replaced by "(e-mail removed)" (C11).
// Query strings are dropped from what is written (a Mailchimp subscribe address keeps nothing after the "?"; its list id is not a secret but is not needed).
// Writes agent/audit/a5-forms-live-<d>.csv (one row per address, as it goes; a rerun continues where it stopped).
import fs from 'node:fs'
import path from 'node:path'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), LIMIT = argv.limit ? Number(argv.limit) : 0
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
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
const SERVICES = [
  ['jotform', /(^|\.)jotform\.com$/], ['google-forms', /^(forms\.gle|docs\.google\.com)$/], ['qualtrics', /(^|\.)qualtrics\.com$/], ['cvent', /(^|\.)cvent\.com$/],
  ['eventbrite', /(^|\.)eventbrite\.com$/], ['zeffy', /(^|\.)zeffy\.com$/], ['mailchimp', /(^|\.)(list-manage\.com|mailchi\.mp|eepurl\.com)$/], ['constant-contact', /(^|\.)(constantcontact\.com)$/],
  ['microsoft-forms', /^(forms\.office\.com|forms\.microsoft\.com)$/], ['calendly', /(^|\.)(calendly\.com)$/], ['typeform-surveymonkey-hubspot-airtable', /(^|\.)(typeform\.com|surveymonkey\.com|hsforms\.com|airtable\.com)$/],
]
const serviceOf = h => (SERVICES.find(([, re]) => re.test(h)) || [])[0]
const strip = u => { try { const x = new URL(u); return x.origin + x.pathname.replace(/\/$/, '') } catch { return u } }

// the addresses and where they are
const where = new Map() // stripped address -> {service, full (first full address, used for the request), legacy:Set, here:Set}
const touch = (full, side, page) => {
  let h; try { h = new URL(full).hostname.replace(/^www\./, '') } catch { return }
  const s = serviceOf(h); if (!s) return
  if (s === 'google-forms' && h === 'docs.google.com' && !/\/forms\//.test(full)) return
  const k = strip(full); let r = where.get(k); if (!r) where.set(k, (r = { service: s, full, legacy: new Set(), here: new Set() }))
  r[side].add(page)
}
for (const r of readCsv(path.join(OUT, `a4-legacy-embeds-${DATE}.csv`))) if (r.kind !== 'video link') touch(r.address, 'legacy', r.page)
const pages = new Map(); for (const p of readCsv(path.join(OUT, `a4-link-pages-${DATE}.csv`))) pages.set(p.url, [...(pages.get(p.url) || []), p.page])
for (const [u, ps] of pages) for (const p of ps) touch(u, 'here', p)

const file = path.join(OUT, `a5-forms-live-${DATE}.csv`), HEADER = ['service', 'address', 'legacy_pages', 'pages_here', 'status', 'title', 'note']
const done = fs.existsSync(file) ? new Set(readCsv(file).map(r => r.address)) : new Set()
if (!fs.existsSync(file)) fs.writeFileSync(file, HEADER.join(',') + '\n')
const UA = 'Mozilla/5.0 (compatible; CUAHSI-site-audit; read-only form check; one request per host per second)'
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function get(full) {
  let cur = full, host0 = new URL(full).hostname
  for (let hop = 0; hop <= 5; hop++) {
    const res = await fetch(cur, { redirect: 'manual', signal: AbortSignal.timeout(25000), headers: { 'user-agent': UA, accept: 'text/html,*/*' } })
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), cur)
      if (next.hostname !== host0) { try { await res.body?.cancel() } catch {} ; return { status: res.status, title: '', note: 'redirects to ' + next.hostname } }
      cur = next.href; try { await res.body?.cancel() } catch {} ; await sleep(1000); continue
    }
    let body = ''; try { const reader = res.body.getReader(); let n = 0; for (;;) { const { done: d, value } = await reader.read(); if (d) break; body += Buffer.from(value).toString('utf8'); n += value.length; if (n > 96 * 1024) { await reader.cancel(); break } } } catch {}
    const m = body.match(/<title[^>]*>([^<]*)/i)
    return { status: res.status, title: m ? m[1].replace(/\s+/g, ' ').replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '(e-mail removed)').trim().slice(0, 120) : '', note: hop ? 'same-host redirect' : '' }
  }
  return { status: '', title: '', note: 'more than 5 redirects' }
}
const todo = [...where.entries()].filter(([k]) => !done.has(k)).slice(0, LIMIT || undefined)
console.log('addresses', where.size, 'to check', todo.length)
const byHost = new Map(); for (const e of todo) { const h = new URL(e[1].full).hostname; byHost.set(h, [...(byHost.get(h) || []), e]) }
const queue = [...byHost.entries()]
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const [, list] = queue.shift()
    for (const [k, r] of list) {
      let out; try { out = await get(r.full) } catch (e) { out = { status: '', title: '', note: /ENOTFOUND/.test(String(e?.cause?.code)) ? 'DNS: name does not exist' : String(e?.cause?.code || e?.name || 'error') } }
      const row = { service: r.service, address: k, legacy_pages: r.legacy.size, pages_here: r.here.size, ...out }
      fs.appendFileSync(file, HEADER.map(c => csvCell(row[c])).join(',') + '\n'); await sleep(1000)
    }
  }
}))
const all = readCsv(file); console.log('finished', all.length, JSON.stringify(all.reduce((o, r) => ((o[r.service + ' ' + (r.status || r.note)] = (o[r.service + ' ' + (r.status || r.note)] || 0) + 1), o), {})))
