#!/usr/bin/env node
// Site audit, task A3g (org issue 108): is each YouTube video id found by a3g-cyberseminars.mjs still public, and which channel is it on?
//
//   node scripts/parity/a3g-youtube-check.mjs --date 261106 [--audit agent/audit]
//
// Reads a3g-legacy-videos-<d>.csv and a3g-new-<d>.csv, asks YouTube's public oEmbed endpoint about each distinct id (one request, one
// second apart; no key, no login; at most one request per distinct id) and writes a3g-youtube-<d>.csv: id, where found, HTTP status,
// the title and channel name oEmbed returns, and whether the legacy link text equals that title. What an answer means: 200 = oEmbed returned the
// video's details (a public, embeddable video); 401 and 404 are documented as private/non-embeddable and deleted/unknown; 400 and 403 were
// seen in this data (400 for ids of the wrong length) and their meaning is not confirmed. For every id that did not answer 200 the thumbnail
// (img.youtube.com/vi/<id>/mqdefault.jpg) is also requested, with one id that did answer 200 as a control: a public video has a thumbnail.
// The channel's public RSS feed (the 15 latest uploads) is read once, and the channel id is read once from the channel page (--handle).
// Writes a3g-youtube-<d>.csv and a3g-youtube-feed-<d>.csv (id, published, title).
import fs from 'node:fs'
import path from 'node:path'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = String(argv.date || ''), AUDIT = String(argv.audit || path.join('agent', 'audit')), HANDLE = String(argv.handle || '@CUAHSI')
if (!DATE) { console.error('usage: a3g-youtube-check.mjs --date <d>'); process.exit(2) }
function parseCsv(text) {
  const out = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) { const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); out.push(row); row = []; cell = '' } else if (c !== '\r') cell += c }
  if (cell || row.length) { row.push(cell); out.push(row) }
  const rows = out.filter(r => r.length > 1); const head = rows.shift(); return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])))
}
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const legacy = parseCsv(fs.readFileSync(path.join(AUDIT, `a3g-legacy-videos-${DATE}.csv`), 'utf8'))
const items = parseCsv(fs.readFileSync(path.join(AUDIT, `a3g-new-${DATE}.csv`), 'utf8'))
const ids = new Map()
for (const v of legacy) { const e = ids.get(v.video_id) ?? { legacy: [], text: v.link_text, newItem: '' }; e.legacy.push(v.page); ids.set(v.video_id, e) }
for (const i of items) if (i.video_id) { const e = ids.get(i.video_id) ?? { legacy: [], text: '', newItem: '' }; e.newItem = i.slug; ids.set(i.video_id, e) }
const UA = 'CUAHSI3-parity-check/1.0 (CUAHSI website rebuild, read-only; contact jread@cuahsi.org)'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const norm = s => (s ?? '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim()
const rows = []
let control = ''
for (const [id, e] of ids) {
  let status = '', title = '', author = ''
  try {
    const res = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), { headers: { 'User-Agent': UA } })
    status = res.status
    if (res.ok) { const j = await res.json(); title = j.title ?? ''; author = j.author_name ?? '' }
  } catch (err) { status = 'error' }
  let thumb = ''
  if (status !== 200) { try { thumb = (await fetch('https://img.youtube.com/vi/' + id + '/mqdefault.jpg', { headers: { 'User-Agent': UA } })).status } catch { thumb = 'error' } }
  else if (!control) { control = id; try { thumb = (await fetch('https://img.youtube.com/vi/' + id + '/mqdefault.jpg', { headers: { 'User-Agent': UA } })).status } catch { thumb = 'error' } }
  rows.push({ video_id: id, thumbnail_status: thumb, thumbnail_note: thumb === '' ? '' : (status === 200 ? 'control (a video that answered 200)' : 'oEmbed did not answer 200'), on_legacy: e.legacy.length ? 'yes' : '', legacy_pages: e.legacy.length, on_new: e.newItem ? 'yes' : '', new_item: e.newItem, oembed_status: status, title, channel: author, legacy_text_equals_title: e.text && title ? (norm(e.text) === norm(title) ? 'yes' : 'no') : '' })
  await sleep(1000)
}
// channel id and the 15 latest uploads
const page = await (await fetch('https://www.youtube.com/' + HANDLE, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } })).text()
const channelId = /"externalId":"(UC[\w-]{22})"/.exec(page)?.[1] ?? ''
await sleep(1000)
let feed = []
if (channelId) {
  const xml = await (await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId, { headers: { 'User-Agent': UA } })).text()
  feed = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => ({ video_id: /<yt:videoId>([^<]+)/.exec(m[1])?.[1], published: /<published>([^<]+)/.exec(m[1])?.[1]?.slice(0, 10), title: (/<title>([^<]*)/.exec(m[1])?.[1] ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'") }))
}
const fh = ['video_id', 'published', 'title']
fs.writeFileSync(path.join(AUDIT, `a3g-youtube-feed-${DATE}.csv`), fh.join(',') + '\n' + feed.map(r => fh.map(h => csvCell(r[h])).join(',')).join('\n') + '\n')
const head = Object.keys(rows[0])
fs.writeFileSync(path.join(AUDIT, `a3g-youtube-${DATE}.csv`), head.join(',') + '\n' + rows.map(r => head.map(h => csvCell(r[h])).join(',')).join('\n') + '\n')
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
console.log(JSON.stringify({ channel_id: channelId, feed_entries: feed.length, feed_dates: count(feed, f => f.published), feed_ids_on_legacy_pages: feed.filter(f => ids.get(f.video_id)?.legacy.length).length, thumbnails: count(rows.filter(r => r.thumbnail_status !== ''), r => r.thumbnail_note + ': ' + r.thumbnail_status), distinct_ids: rows.length, status: count(rows, r => r.oembed_status), channel: count(rows.filter(r => r.channel), r => r.channel), legacy_text_equals_title: count(rows.filter(r => r.legacy_text_equals_title), r => r.legacy_text_equals_title) }, null, 1))
