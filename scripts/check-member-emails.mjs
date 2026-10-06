// After a build: fails if any member representative's email address (content/members/reps.json) appears anywhere in .output/public (and
// .output/server when it exists), in plain, percent-encoded (%40) or HTML-entity (&#64;) form, or if a published row still carries an email
// key next to an institution (the shape of a leaked rep row). The hosted documents (.output/public/documents/, PDFs of board minutes and
// reports) are not scanned: Jordan ruled on 6 October 2026 that personal data in the reports and minutes stays as published (one
// representative's address is in a minutes PDF, as a mailto link).
// @nuxt/content writes whole content files into the static output (/api/_content/...), so a page that merely does not show an address
// can still publish it; server/plugins/strip-rep-emails.ts removes the field, and this check proves it. Prints counts only, never an address.
// Run: node scripts/check-member-emails.mjs
import fs from 'node:fs'
import path from 'node:path'
const emails = [...new Set(JSON.parse(fs.readFileSync('content/members/reps.json', 'utf8')).map(r => String(r.email ?? '').toLowerCase()).filter(Boolean))]
if (emails.length < 50) { console.log(`only ${emails.length} addresses read from content/members/reps.json; the check cannot be trusted`); process.exit(1) }
const forms = a => [a, a.replace('@', '%40'), a.replace('@', '&#64;'), a.replace('@', '&#x40;')]
const leakedRow = /"institution"\s*:[^{}]*"email"\s*:|"email"\s*:[^{}]*"institution"\s*:/i
const hits = []
let scanned = 0, skipped = 0
const walk = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { walk(p); continue }
    if (p.split(path.sep).join('/').startsWith('.output/public/documents/')) { skipped++; continue }
    scanned++
    const text = fs.readFileSync(p).toString('utf8').toLowerCase()
    const n = emails.filter(a => forms(a).some(f => text.includes(f))).length
    if (n || leakedRow.test(text)) hits.push(`${p} (${n} address${n === 1 ? '' : 'es'}${leakedRow.test(text) ? ', a row with an email key' : ''})`)
  }
}
walk('.output/public')
if (fs.existsSync('.output/server')) walk('.output/server')
if (hits.length) { console.log(`${hits.length} built file(s) contain member email addresses:`); hits.forEach(h => console.log('  ' + h)); process.exit(1) }
console.log(`member emails: none of ${emails.length} addresses appear in ${scanned} built files (${skipped} hosted document files not scanned)`)
