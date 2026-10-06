// Builds content/data-portals/portals.json from .agent/portals-extract.json (see portals-extract.mjs). Cleaning only.
// Columns: name, owner, scope, url, and last_reviewed only where a person at CUAHSI has reviewed the row (DataStream and Aquastat so far).
import fs from 'node:fs'
const ex = JSON.parse(fs.readFileSync('.agent/portals-extract.json', 'utf8'))
// file order = the order the page shows: scope "global" first, then "USA", then other scopes A to Z (no scope last), then by name
const same = (a, b) => (a ?? '').localeCompare(b ?? '', 'en', { sensitivity: 'base' })
const rank = s => { const t = (s ?? '').trim().toLowerCase(); return t === 'global' ? 0 : t === 'usa' ? 1 : t ? 2 : 3 }
const rows = ex.entries.map(e => {
  const owner = e.dl['Site Owner']?.text ?? ''; const scope = e.dl['Geographical Scope']?.text ?? ''; const w = e.dl['Website']
  const url = (w?.href || w?.text || '').trim()
  if (!/^https?:\/\//.test(url)) throw new Error('no web address for ' + e.name)
  const out = { name: e.name }
  if (owner) out.owner = owner
  if (scope) out.scope = scope
  out.url = url
  return out
}).map(r => {
  // Jordan's edits (6 Oct 2026): a typo fixed, a person's name dropped from one owner, two rows marked reviewed
  if (r.name === 'International Centre for Water Resourses and Global Change') r.name = 'International Centre for Water Resources and Global Change'
  if (r.name === 'Waterisotopes.org') r.owner = 'IsoMAP group'
  if (r.name === 'DataStream' || r.name === 'Aquastat') r.last_reviewed = '2026-10-06'
  return r
}).sort((a, b) => rank(a.scope) - rank(b.scope) || (rank(a.scope) === 2 ? same(a.scope, b.scope) : 0) || same(a.name, b.name))
fs.mkdirSync('content/data-portals', { recursive: true })
fs.writeFileSync('content/data-portals/portals.json', JSON.stringify(rows, null, 2) + '\n')
console.log(rows.length, 'rows;', rows.filter(r => !r.owner).length, 'without an owner;', rows.filter(r => !r.scope).length, 'without a scope')
