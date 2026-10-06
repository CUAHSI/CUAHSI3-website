// Builds content/graduate-programs/programs.json from agent/parity/grad-programs-extract.json (see grad-programs-extract.mjs).
// Cleaning only: no text is written by hand. URLs in the free text are removed (the website is its own field), an empty
// "[]" left by a removed link is dropped, repeated program lines are dropped, and one very long entry (the University of
// Kansas, 5,746 characters) is cut after its second sentence, which names the four units. Rows are sorted by institution.
// `last_reviewed` is the date the saved legacy list was read (2026-10-05), not a staff review: staff have not reviewed these rows yet.
import fs from 'node:fs'
const ex = JSON.parse(fs.readFileSync('agent/parity/grad-programs-extract.json', 'utf8'))
const URLISH = /(https?:\/\/|www\.)[^\s)\];,]+/g
function cleanText(t) {
  return t
    .replace(/\(([^()]*)\)/g, (m, inner) => URLISH.test(inner) ? (inner.replace(URLISH, '').replace(/^[\s,;]+|[\s,;]+$/g, '') ? `(${inner.replace(URLISH, '').replace(/^[\s,;]+|[\s,;]+$/g, '')})` : '') : m)
    .replace(/\[\s*\]/g, '').replace(URLISH, ';').replace(/\s*;\s*;+/g, ';').replace(/\s+;/g, ';')
    .replace(/\s*\b[a-z0-9-]+(\.[a-z0-9-]+)+\.(edu|org|com|net|gov)\b(\/\S*)?/g, '')   // a bare web address left in the text (a link's own text)
    .replace(/\s+-(?=\s*;|\s*$)/g, '').replace(/\s{2,}/g, ' ').trim().replace(/^;+|;+$/g, '').trim()
}
const rows = ex.final.map(r => {
  let parts = r.programs.split('; ').map(cleanText).filter(Boolean)
  parts = parts.map(p => p.replace(/\.\s*;/g, ';').replace(/\)\.$/, ')')).filter(Boolean)
  parts = parts.filter((p, i) => parts.indexOf(p) === i)
  // lines are joined with '; ', except after a sentence or a colon, where the next line continues the text
  let programs = parts.reduce((acc, p, i) => i === 0 ? p : acc + (/(:|[a-z]\.)$/.test(acc) ? ' ' : '; ') + p, '')
  if (r.institution === 'University of Kansas') programs = programs.split(/(?<=\.)\s+/).slice(0, 2).join(' ')
  // exactly two institutions appear on none of the four degree lists but say their degrees in their own program text
  const FROM_TEXT = { 'Brigham Young University': ['masters', 'phd'], 'Universitat Politècnica de Catalunya': ['masters'] }
  const degrees = !r.degrees.length && FROM_TEXT[r.institution] ? FROM_TEXT[r.institution] : r.degrees
  const out = { institution: r.institution, programs, degrees }
  if (r.url) out.url = r.url
  out.last_reviewed = '2026-10-05'
  return out
}).sort((a, b) => a.institution.localeCompare(b.institution))
fs.mkdirSync('content/graduate-programs', { recursive: true })
fs.writeFileSync('content/graduate-programs/programs.json', JSON.stringify(rows, null, 2) + '\n')
console.log(rows.length, 'rows;', rows.filter(r => !r.degrees.length).length, 'without degrees (2 filled from their own program text);', rows.filter(r => !r.url).length, 'without a website;', rows.filter(r => r.programs.length > 300).length, 'over 300 characters')
