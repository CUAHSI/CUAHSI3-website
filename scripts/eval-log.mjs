#!/usr/bin/env node
// Reads the evaluation log: the frozen history in agent/eval-log.md plus the per-branch files in agent/log/ (agent/log/README.md).
//
//   node scripts/eval-log.mjs                 print the merged log (frozen file first, then agent/log/ files by file name)
//   node scripts/eval-log.mjs --tail N        the last N lines of that
//   node scripts/eval-log.mjs --branch NAME   only the lines whose branch field is NAME
//   node scripts/eval-log.mjs --counts        lines by event, defects by where they were caught
//   node scripts/eval-log.mjs --check         format check of the files in agent/log/ (exit 1 on a bad line); verify.sh runs it
//   --root=DIR                                read DIR/agent/ instead of this repository's (to test on a fixture)
//
// A log line is `YYMMDD | branch | event | detail`. In the frozen file only lines after its `---` line count; lines that do not match
// the format there (the header, a wrapped line) are not counted and --counts says how many were skipped.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const flag = n => args.includes(`--${n}`)
const val = n => { const i = args.findIndex(a => a === `--${n}` || a.startsWith(`--${n}=`)); if (i < 0) return undefined; return args[i].includes('=') ? args[i].slice(n.length + 3) : args[i + 1] }
for (const n of ['tail', 'branch', 'root']) { const v = val(n); if (v !== undefined && (v === '' || v.startsWith('--'))) { console.error(`--${n} needs a value`); process.exit(1) } if (v === undefined && args.includes(`--${n}`)) { console.error(`--${n} needs a value`); process.exit(1) } }
const rootArg = val('root')
const ROOT = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EVENTS = ['start', 'intervention', 'defect', 'pr', 'merged', 'abandoned', 'note', 'correction', 'event']
const LINE = /^(\d{6}) \| ([^|]+?) \| ([a-z-]+) \| (.+)$/

const readLines = f => fs.readFileSync(f, 'utf8').split(/\r?\n/)

// ---- check -------------------------------------------------------------------------------------------------------------------
const dir = path.join(ROOT, 'agent', 'log')
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md').sort() : []
if (flag('check')) {
  let bad = 0
  for (const f of files) {
    if (!/^\d{6}-[a-z0-9][a-z0-9._-]*\.md$/.test(f)) { console.log(`agent/log/${f}: the file name must be <YYMMDD>-<branch with / as ->.md`); bad++ }
    readLines(path.join(dir, f)).forEach((l, i) => {
      if (!l.trim()) return
      const m = LINE.exec(l)
      if (!m) { console.log(`agent/log/${f}:${i + 1}: not in the format "YYMMDD | branch | event | detail"`); bad++; return }
      if (!EVENTS.includes(m[3])) { console.log(`agent/log/${f}:${i + 1}: unknown event "${m[3]}" (${EVENTS.join(', ')})`); bad++ }
      if (m[3] === 'defect' && !/\bcaught: (self-check|reviewer|human-review|deploy-preview|production)\b/.test(m[4])) { console.log(`agent/log/${f}:${i + 1}: a defect line's detail must contain "caught: self-check", "reviewer", "human-review", "deploy-preview" or "production"`); bad++ }
    })
  }
  if (bad) { console.log(`${bad} problem(s) in ${files.length} log file(s)`); process.exit(1) }
  console.log(`${files.length} log file(s), all lines in format`)
  process.exit(0)
}

// ---- load ----------------------------------------------------------------------------------------------------------------------
const rows = []; let skipped = 0
const frozen = path.join(ROOT, 'agent', 'eval-log.md')
if (fs.existsSync(frozen)) {
  let past = false
  for (const l of readLines(frozen)) {
    if (!past) { if (l.trim() === '---') past = true; continue }
    if (!l.trim()) continue
    const m = LINE.exec(l)
    if (m) rows.push({ date: m[1], branch: m[2], event: m[3], detail: m[4], from: 'eval-log.md' }); else skipped++
  }
}
for (const f of files) for (const l of readLines(path.join(dir, f))) {
  if (!l.trim()) continue
  const m = LINE.exec(l)
  if (m) rows.push({ date: m[1], branch: m[2], event: m[3], detail: m[4], from: `log/${f}` }); else skipped++
}
const text = r => `${r.date} | ${r.branch} | ${r.event} | ${r.detail}`

// ---- output ------------------------------------------------------------------------------------------------------------------
if (flag('counts')) {
  const by = {}; const caught = {}
  for (const r of rows) {
    by[r.event] = (by[r.event] ?? 0) + 1
    if (r.event === 'defect') { const c = /caught: ([a-z-]+)/.exec(r.detail)?.[1] ?? '(none given)'; caught[c] = (caught[c] ?? 0) + 1 }
  }
  const branches = new Set(rows.map(r => r.branch))
  console.log(`${rows.length} log lines (${rows.filter(r => r.from === 'eval-log.md').length} in the frozen eval-log.md, ${rows.filter(r => r.from !== 'eval-log.md').length} in agent/log/ across ${files.length} file(s)); ${branches.size} distinct branch names; ${skipped} line(s) skipped as not in the format`)
  console.log('\nBy event:')
  for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)
  console.log('\nDefects by where caught (denominator: all defect lines):')
  for (const [k, v] of Object.entries(caught).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)
  process.exit(0)
}
let out = rows
const b = val('branch'); if (b) out = out.filter(r => r.branch === b)
const t = val('tail'); if (t !== undefined) { const n = Number(t); if (!Number.isInteger(n) || n < 0) { console.error('--tail needs a number'); process.exit(1) } out = n === 0 ? [] : out.slice(-n) }
for (const r of out) console.log(text(r))
