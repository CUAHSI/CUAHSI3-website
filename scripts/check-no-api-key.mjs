// After a build: fails if the built site could carry a USGS (api.data.gov) API key. The key lives only in the Netlify environment
// variable USGS_API_KEY and is added by netlify/edge-functions/gage.ts on the server; the page must never send or hold one. This looks
// for the ways a key is passed to the API ("X-Api-Key" header, "api_key=" or "apikey=" in a URL) in every built file under .output/public
// (the hosted documents are not scanned) and .output/server. The key's own value is searched for only when USGS_API_KEY is set in the environment (as it is in a Netlify build); otherwise this catches the habit, not the value.
// Run: node scripts/check-no-api-key.mjs
import fs from 'node:fs'
import path from 'node:path'
// A Netlify build that has USGS_API_KEY set also has its value searched for. (Locally the variable is not set.)
const value = (process.env.USGS_API_KEY ?? '').trim()
const pattern = /x[-_]api[-_]key|api[-_]?key\s*=/i
const hits = []
let scanned = 0
const walk = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { walk(p); continue }
    if (p.split(path.sep).join('/').startsWith('.output/public/documents/')) continue
    scanned++
    const text = fs.readFileSync(p).toString('utf8')
    if (pattern.test(text) || (value.length >= 8 && text.includes(value))) hits.push(p)
  }
}
walk('.output/public')
if (fs.existsSync('.output/server')) walk('.output/server')
if (scanned < 100) { console.log(`only ${scanned} built files found; the check cannot be trusted`); process.exit(1) }
if (hits.length) { console.log(`${hits.length} built file(s) mention an API key header or parameter:`); hits.forEach(h => console.log('  ' + h)); process.exit(1) }
console.log(`no API key header or parameter in ${scanned} built files`)
