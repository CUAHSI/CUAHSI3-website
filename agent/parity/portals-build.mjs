// Builds content/data-portals/portals.json from .agent/portals-extract.json (see portals-extract.mjs). Cleaning only.
// Columns: name, owner, scope, url. No review date is set: no person at CUAHSI has reviewed these rows yet. Sorted by name.
import fs from 'node:fs'
const ex = JSON.parse(fs.readFileSync('.agent/portals-extract.json', 'utf8'))
const rows = ex.entries.map(e => {
  const owner = e.dl['Site Owner']?.text ?? ''; const scope = e.dl['Geographical Scope']?.text ?? ''; const w = e.dl['Website']
  const url = (w?.href || w?.text || '').trim()
  if (!/^https?:\/\//.test(url)) throw new Error('no web address for ' + e.name)
  const out = { name: e.name }
  if (owner) out.owner = owner
  if (scope) out.scope = scope
  out.url = url
  return out
}).sort((a, b) => a.name.localeCompare(b.name))
fs.mkdirSync('content/data-portals', { recursive: true })
fs.writeFileSync('content/data-portals/portals.json', JSON.stringify(rows, null, 2) + '\n')
console.log(rows.length, 'rows;', rows.filter(r => !r.owner).length, 'without an owner;', rows.filter(r => !r.scope).length, 'without a scope')
