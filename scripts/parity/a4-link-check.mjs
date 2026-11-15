#!/usr/bin/env node
// Site audit, task A4 (org issue 109), step 2 of 3: the only part that uses the network. HEAD requests (GET only when a server refuses HEAD), nothing is sent or posted.
//
//   node scripts/parity/a4-link-check.mjs [--date 261106] [--out agent/audit] [--limit N]        check every address in a4-links-<d>.csv and the 20 control addresses
//   node scripts/parity/a4-link-check.mjs --recheck 100 [--seed 1]                               check a random sample of the finished results again (stability)
//   node scripts/parity/a4-link-check.mjs --youtube                                              ask YouTube's oEmbed endpoint about the legacy videos that have no counterpart here
//
// Politeness: one request per host per second (requests to one host are queued and spaced 1 s apart; different hosts run at the same time, 24 at once).
// A redirect is followed only while it stays on the same host (http to https, a trailing slash, 5 hops at most). When it goes to ANOTHER host it is not followed:
// the status of the first answer is recorded with the host it points to, so a request is never made to a host outside the one-per-second queue.
// For doi.org that means "the DOI is registered and points to a publisher"; the publisher's page is not requested.
// HEAD that answers 400, 403, 404, 405 or 501 is repeated once as a GET (the body is not read) because some servers do not support HEAD; `method` says which answered.
// Verdicts: ok (2xx), redirect (3xx to another host, not followed), dead (404, 410, or the name does not exist), blocked (401, 403, 429), error (5xx, timeout, a refused connection,
// anything else). "blocked" and "error" say nothing about whether the page exists. "ok" says the address answers, not that the page says what the link text says.
// Writes agent/audit/a4-check-<d>.csv (one row per address, written as it goes; a rerun continues where it stopped) and, with --recheck, a4-recheck-<d>.csv.
import fs from 'node:fs'
import path from 'node:path'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106'), LIMIT = argv.limit ? Number(argv.limit) : 0
const CTL = path.join(OUT, 'a4-control-urls-261109.csv')
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
const HEADER = ['url', 'host', 'verdict', 'status', 'head_status', 'method', 'hops', 'redirect_host', 'final_path_changed', 'note']
const UA = 'Mozilla/5.0 (compatible; CUAHSI-site-audit; read-only link check; one request per host per second)'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function once(url, method) {
  const res = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA, accept: '*/*' } })
  try { await res.body?.cancel() } catch { /* the body is not read */ }
  return res
}
async function probe(url) {
  let cur = url, hops = 0, headStatus = '', method = 'HEAD'
  const host0 = new URL(url).hostname
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      for (;;) {
        let res = await once(cur, 'HEAD')
        if (hops === 0 && !headStatus) headStatus = res.status
        if ([400, 403, 404, 405, 501].includes(res.status)) { await sleep(1000); res = await once(cur, 'GET'); method = 'GET' }
        if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
          const next = new URL(res.headers.get('location'), cur)
          if (next.hostname !== host0) return { status: res.status, headStatus, method, hops, redirect_host: next.hostname, verdict: 'redirect', final_path_changed: '', note: '' }
          hops++; if (hops > 5) return { status: res.status, headStatus, method, hops, redirect_host: '', verdict: 'error', final_path_changed: '', note: 'more than 5 redirects' }
          cur = next.href; await sleep(1000); continue
        }
        const s = res.status
        const verdict = s >= 200 && s < 300 ? 'ok' : s === 404 || s === 410 ? 'dead' : [401, 403, 429].includes(s) ? 'blocked' : 'error'
        const strip = x => x.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase()
        return { status: s, headStatus, method, hops, redirect_host: '', verdict, final_path_changed: hops && strip(cur) !== strip(url) ? 'yes' : '', note: '' }
      }
    } catch (e) {
      const code = String(e?.cause?.code || e?.name || 'error')
      if (/ENOTFOUND/.test(code)) return { status: '', headStatus, method, hops, redirect_host: '', verdict: 'dead', final_path_changed: '', note: 'DNS: name does not exist' }
      if (attempt === 0) { await sleep(5000); continue }
      return { status: '', headStatus, method, hops, redirect_host: '', verdict: 'error', final_path_changed: '', note: code }
    }
  }
}
// one queue per host, 24 hosts at once
async function run(urls, onRow) {
  const byHost = new Map()
  for (const u of urls) { const h = new URL(u).hostname; byHost.set(h, [...(byHost.get(h) || []), u]) }
  const queue = [...byHost.entries()].sort((a, b) => b[1].length - a[1].length)
  await Promise.all(Array.from({ length: 24 }, async () => {
    while (queue.length) {
      const [host, list] = queue.shift()
      for (const u of list) { const r = await probe(u); onRow({ url: u, host, verdict: r.verdict, status: r.status, head_status: r.headStatus, method: r.method, hops: r.hops, redirect_host: r.redirect_host, final_path_changed: r.final_path_changed, note: r.note }); await sleep(1000) }
    }
  }))
}
if (argv.youtube) {
  // The YouTube videos on legacy pages that have no counterpart here: is each still public? YouTube's public oEmbed endpoint, one request per id, one second apart.
  // 200 = the video's details were returned (public, embeddable); 401 and 404 = private/non-embeddable and deleted/unknown (YouTube's documentation); anything else is "unchecked".
  const emb = readCsv(path.join(OUT, `a4-legacy-embeds-${DATE}.csv`)).filter(r => r.youtube_id && r.counterpart === 'none')
  const ids = [...new Set(emb.map(r => r.youtube_id))].sort(), rows = []
  for (const id of ids) {
    let status = '', title = '', channel = ''
    try { const res = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), { signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA } }); status = res.status; if (res.ok) { const j = await res.json(); title = j.title || ''; channel = j.author_name || '' } } catch (e) { status = 'error' }
    rows.push({ video_id: id, oembed_status: status, public: status === 200 ? 'yes' : [401, 404].includes(status) ? 'no' : 'unchecked', channel, title, legacy_pages: [...new Set(emb.filter(r => r.youtube_id === id).map(r => r.page))].join(' ; ') })
    await sleep(1000)
  }
  const h = ['video_id', 'oembed_status', 'public', 'channel', 'title', 'legacy_pages']
  fs.writeFileSync(path.join(OUT, `a4-youtube-${DATE}.csv`), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n')
  console.log('youtube', rows.length, JSON.stringify(rows.reduce((o, r) => ((o[r.public] = (o[r.public] || 0) + 1), o), {})))
  process.exit(0)
}
const resultsFile = path.join(OUT, `a4-check-${DATE}.csv`)
const done = fs.existsSync(resultsFile) ? readCsv(resultsFile) : []

if (argv.recheck) {
  const n = Number(argv.recheck), seed = Number(argv.seed || 1)
  let x = seed; const rnd = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const pool = done.filter(r => r.method !== undefined).slice(); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  const sample = pool.slice(0, n), old = new Map(sample.map(r => [r.url, r])), rows = []
  await run(sample.map(r => r.url), r => rows.push({ ...r, first_verdict: old.get(r.url).verdict, first_status: old.get(r.url).status, same_verdict: old.get(r.url).verdict === r.verdict ? 'same' : 'DIFFERENT' }))
  const h = [...HEADER, 'first_verdict', 'first_status', 'same_verdict']
  fs.writeFileSync(path.join(OUT, `a4-recheck-${DATE}.csv`), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n')
  console.log('recheck', rows.length, 'same', rows.filter(r => r.same_verdict === 'same').length, 'different', rows.filter(r => r.same_verdict !== 'same').length)
  process.exit(0)
}

const links = readCsv(path.join(OUT, `a4-links-${DATE}.csv`)).map(r => r.url)
const control = readCsv(CTL).map(r => r.url)
const want = [...new Set([...control, ...links])]
const have = new Set(done.map(r => r.url))
const todo = want.filter(u => !have.has(u)).slice(0, LIMIT || undefined)
if (!fs.existsSync(resultsFile)) fs.writeFileSync(resultsFile, HEADER.join(',') + '\n')
let n = 0
console.log('to check', todo.length, 'of', want.length, '(already done', have.size + ')')
await run(todo, r => { fs.appendFileSync(resultsFile, HEADER.map(k => csvCell(r[k])).join(',') + '\n'); if (++n % 100 === 0) console.log(n, 'done') })
const all = readCsv(resultsFile)
console.log('finished', all.length, JSON.stringify(all.reduce((o, r) => ((o[r.verdict] = (o[r.verdict] || 0) + 1), o), {})))
