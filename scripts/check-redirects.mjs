// After a build: checks public/_redirects against .output/public. Every rule is "source target 301"; sources are unique; every target
// is a file or page in the built site (so no redirect lands on a 404); no source is itself a built page (Netlify would serve the page
// and ignore the redirect); and the built site carries the _redirects file. Exit 1 on any problem. Run: node scripts/check-redirects.mjs
import fs from 'node:fs'
const OUT = '.output/public'
const exists = p => { const f = OUT + p; return (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(f + '/index.html') || fs.existsSync(f + '.html') }
const problems = []
const seen = new Set()
let n = 0
const lines = fs.readFileSync('public/_redirects', 'utf8').split('\n')
lines.forEach((line, i) => {
  if (!line.trim() || line.startsWith('#')) return
  const parts = line.trim().split(/\s+/)
  if (parts.length !== 3 || parts[2] !== '301' || !parts[0].startsWith('/') || !parts[1].startsWith('/')) { problems.push(`line ${i + 1}: not "/source /target 301": ${line}`); return }
  const [from, to] = parts
  n++
  if (seen.has(from)) problems.push(`line ${i + 1}: source repeated: ${from}`)
  seen.add(from)
  if (!exists(to)) problems.push(`line ${i + 1}: target is not in the built site: ${to}`)
  if (exists(from)) problems.push(`line ${i + 1}: source is a page that exists here, so the redirect would never apply: ${from}`)
})
if (!fs.existsSync(OUT + '/_redirects')) problems.push('the built site has no _redirects file')
if (problems.length) { console.log(`${problems.length} redirect problem(s)`); problems.forEach(p => console.log('  ' + p)); process.exit(1) }
console.log(`redirects: ${n} rules, ${new Set(lines.filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim().split(/\s+/)[1])).size} distinct targets, all resolve`)
