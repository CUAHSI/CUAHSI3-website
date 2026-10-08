// Parity stage 4, probes: look for matches the mapping rules missed.
// Direction A: every legacy row mapped "none" is compared with EVERY item here (events, news, impact stories, newsletters, seminars incl. unpublished,
//   jobs, programs, team, page titles), whatever its type, by title and by date.
// Direction B: every item here with no legacy counterpart is compared with EVERY legacy row, whatever its type.
// A candidate is: title similarity >= 0.5; or similarity >= 0.3 and dates within 7 days; or all words of the shorter title inside the longer.
// Writes agent/parity/mapping-probe.csv and mapping-probe-numbers.json. Candidates are for reading, not matches.
import fs from 'node:fs'
import { parse as parseYaml } from 'yaml'
const readCsv = f => { const s = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < s.length; i++) { const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' } else if (c !== '\r') cur += c }
  const [h, ...b] = rows; return b.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))) }
const csvCell = v => { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
const STOP = new Set('a an and the of for in on at to with by from as is are be your our cuahsi webinar workshop e newsletter'.split(' '))
const norm = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&amp;/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
const toks = s => new Set(norm(s).split(' ').filter(t => t && !STOP.has(t)))
const jac = (a, b) => { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let i = 0; for (const t of A) if (B.has(t)) i++; return i / (A.size + B.size - i) }
const contained = (a, b) => { const A = toks(a), B = toks(b); const [s, l] = A.size <= B.size ? [A, B] : [B, A]; return s.size >= 3 && [...s].every(t => l.has(t)) }
const days = (a, b) => (a && b) ? Math.abs((Date.parse(a) - Date.parse(b)) / 864e5) : Infinity
const fm = f => { const s = fs.readFileSync(f, 'utf8'); if (!s.startsWith('---')) return null; const e = s.indexOf('\n---', 3); try { return parseYaml(s.slice(3, e)) } catch { return null } }
const d10 = v => v ? String(v instanceof Date ? v.toISOString() : v).slice(0, 10) : ''

const mapping = readCsv('agent/parity/mapping.csv')
const legacy = readCsv('agent/parity/legacy-inventory.csv')
const newInv = readCsv(fs.existsSync('agent/parity/new-inventory.csv') ? 'agent/parity/new-inventory.csv' : '.agent/new-inventory.csv')
const legacyBy = new Map(legacy.map(r => [r.url, r]))

// the pool of things here
const pool = []
for (const [dir, kind, dateKey] of [['events', 'event', 'start'], ['news', 'news', 'date'], ['research', 'impact story', 'date'], ['newsletter', 'newsletter', 'date'], ['cyberseminars', 'seminar', 'date'], ['jobs', 'job', 'posted'], ['programs', 'program', 'next_date']])
  for (const f of fs.readdirSync(`content/${dir}`).filter(f => f.endsWith('.md') && f !== 'README.md')) {
    const x = fm(`content/${dir}/${f}`); if (!x) continue
    pool.push({ kind, title: x.title, date: d10(x[dateKey] || x.date), file: `content/${dir}/${f}`, published: x.published !== false, org: x.organization || '' })
  }
for (const t of JSON.parse(fs.readFileSync('content/team/full-team.json', 'utf8'))) pool.push({ kind: 'person', title: t.name, date: '', file: 'content/team/full-team.json', published: true })
for (const r of newInv) if (['listing', 'landing page', 'static page'].includes(r.page_type)) pool.push({ kind: r.page_type, title: r.title || r.h1, date: '', file: r.source, published: true, route: r.url })

const cand = (a, b) => { const s = jac(a.title, b.title), dd = days(a.date, b.date)
  return (s >= 0.5 || (s >= 0.3 && dd <= 7) || contained(a.title, b.title)) ? { s, dd } : null }
const out = []
let probedA = 0, notProbedA = 0, candA = 0
const noneRows = mapping.filter(r => r.confidence === 'none')
for (const m of noneRows) {
  const l = legacyBy.get(m.legacy_url); const title = (l?.title || '').trim()
  if (!title || l.status !== '200') { notProbedA++; continue }                 // no title to compare (404 and redirect rows)
  probedA++
  const leg = { title, date: l.date }
  const hits = pool.map(p => ({ p, c: cand(leg, p) })).filter(x => x.c).sort((a, b) => b.c.s - a.c.s).slice(0, 3)
  if (hits.length) candA++
  for (const h of hits) out.push({ direction: 'A legacy none -> here', legacy_url: m.legacy_url, legacy_type: m.page_type, legacy_title: title, legacy_date: l.date, here_kind: h.p.kind, here_title: h.p.title, here_date: h.p.date, here_file: h.p.file, similarity: h.c.s.toFixed(2), days_apart: isFinite(h.c.dd) ? Math.round(h.c.dd) : '' })
}
// B: items here with no legacy counterpart
const mapped = new Set(mapping.map(r => r.new_source).filter(Boolean))
let probedB = 0, candB = 0
for (const p of pool) {
  if (!p.file.startsWith('content/') || p.file.endsWith('.json') || mapped.has(p.file)) continue
  probedB++
  const hits = legacy.filter(l => l.status === '200' && l.title).map(l => ({ l, c: cand(p, { title: l.title, date: l.date }) })).filter(x => x.c).sort((a, b) => b.c.s - a.c.s).slice(0, 3)
  if (hits.length) candB++
  for (const h of hits) out.push({ direction: 'B here, no counterpart -> legacy', legacy_url: h.l.url, legacy_type: h.l.page_type, legacy_title: h.l.title, legacy_date: h.l.date, here_kind: p.kind, here_title: p.title, here_date: p.date, here_file: p.file, similarity: h.c.s.toFixed(2), days_apart: isFinite(h.c.dd) ? Math.round(h.c.dd) : '' })
}
const cols = ['direction', 'legacy_url', 'legacy_type', 'legacy_title', 'legacy_date', 'here_kind', 'here_title', 'here_date', 'here_file', 'similarity', 'days_apart']
fs.writeFileSync('agent/parity/mapping-probe.csv', [cols.join(','), ...out.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
fs.writeFileSync('agent/parity/mapping-probe-numbers.json', JSON.stringify({ noneRows: noneRows.length, probedA, notProbedA, rowsWithCandidateA: candA, hereWithoutCounterpart: probedB, hereWithCandidateB: candB, candidateRows: out.length }, null, 1) + '\n')
console.log({ noneRows: noneRows.length, probedA, notProbedA, candA, probedB, candB, rows: out.length })
