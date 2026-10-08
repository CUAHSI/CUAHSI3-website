#!/usr/bin/env node
// Phase 2 branch checks (CLAUDE.md rules 3 and 4, content rules C1, C5 and C6). Called by scripts/verify.sh.
//   node scripts/check-content-branch.mjs <baseRef>
// Prints one line per result, prefixed ok: FAIL: WARN: or INFO:, and exits 0 (verify.sh reads the prefixes).
//
// What kind of branch this is comes from what the diff changes, not from its name, so it works in CI, where the
// checkout has no branch name (the name is then read from GITHUB_HEAD_REF). Locally the name is also checked
// against the diff.
//   content branch: the diff touches content/. It may also touch agent/, public/ (assets belonging to a content item),
//                   visual/baseline/ (images).
//   code branch:    the diff touches anything else and not content/.
// Also checked on any branch: nothing under content/ is deleted or renamed, the slug of a published item does not
// change, a new people_mentioned value matches a profile file, and the known-failures list is not recreated.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { parseDocument } from 'yaml'

const KF = 'scripts/validate-content.known-failures.txt'
const baseRef = process.argv[2] || 'main'
const out = []
const say = (kind, msg) => out.push(`${kind}: ${msg}`)

const git = (...a) => { try { return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }) } catch { return null } }

let base = git('merge-base', baseRef, 'HEAD')
if (base === null) { say('WARN', `no merge-base with ${baseRef}; the branch checks were skipped`); finish() }
base = base.trim()

// --- what changed: tracked changes against the merge-base (staged or not) plus new files
const status = (git('diff', '--name-status', '-M', base) || '').split('\n').filter(Boolean).map(l => {
  const p = l.split('\t'); return { s: p[0][0], a: p[1], b: p[2] ?? p[1] }
})
for (const f of (git('ls-files', '--others', '--exclude-standard') || '').split('\n').filter(Boolean)) status.push({ s: 'A', a: f, b: f })
const files = status.map(x => x.b)
const isContent = f => f.startsWith('content/')
const isAllowedExtra = f => f.startsWith('agent/') || f.startsWith('public/') || f.startsWith('visual/baseline/')
const contentFiles = files.filter(isContent)
const nonContent = files.filter(f => !isContent(f))
const outsideAllowed = nonContent.filter(f => !isAllowedExtra(f))
const kind = contentFiles.length ? 'content' : (nonContent.filter(f => !f.startsWith('agent/')).length ? 'code' : 'neutral')

// --- branch name: git locally, GITHUB_HEAD_REF in CI
const name = (git('branch', '--show-current') || '').trim() || process.env.GITHUB_HEAD_REF || ''
const prefix = name.startsWith('content/') ? 'content/' : name.startsWith('task/') ? 'task/' : ''

if (kind === 'content') {
  if (outsideAllowed.length) say('FAIL', `a content branch changes only content/ (plus agent/, public/ and visual/baseline/), but this one also changes ${outsideAllowed.length} other file(s): ${outsideAllowed.slice(0, 6).join(', ')}${outsideAllowed.length > 6 ? ', ...' : ''} (rule 3: a branch changes content or code, never both)`)
  else say('ok', `content branch: ${contentFiles.length} content file(s) changed, nothing else but allowed extras`)
} else if (kind === 'code') say('ok', 'code branch: content/ untouched')
else say('ok', 'content/ untouched')

if (name && prefix === 'task/' && kind === 'content') say('FAIL', `branch ${name} changes content/; content work goes on a content/short-name branch (rule 3)`)
if (name && prefix === 'content/' && kind === 'code') say('FAIL', `branch ${name} is named content/ but its diff changes code, not content/ (rule 3: the name and the diff must agree)`)
if (!name) say('INFO', 'no branch name available; the kind was decided from the diff alone')

// --- on a content branch, list the extras the PR description must account for
if (kind === 'content') {
  const imgs = files.filter(f => f.startsWith('visual/baseline/'))
  const pub = files.filter(f => f.startsWith('public/'))
  if (imgs.length) say('INFO', `baseline images changed (the PR must say which and why): ${imgs.join(', ')}`)
  if (pub.length) say('INFO', `public/ files changed (the PR must name the content item each belongs to): ${pub.join(', ')}`)
}

// --- deletions and renames under content/ (C5)
const gone = status.filter(x => (x.s === 'D' && isContent(x.a)) || (x.s === 'R' && isContent(x.a)))
if (gone.length) {
  const renames = gone.filter(x => x.s === 'R'), dels = gone.filter(x => x.s === 'D')
  if (dels.length) say('FAIL', `content file(s) deleted: ${dels.map(x => x.a).join(', ')} (C5: a published file is never deleted; set published: false and ask Jordan)`)
  if (renames.length) {
    if (process.env.VERIFY_ALLOW_CONTENT_RENAME === '1') say('WARN', `content file(s) renamed at Jordan's request: ${renames.map(x => `${x.a} -> ${x.b}`).join(', ')}`)
    else say('FAIL', `content file(s) renamed: ${renames.map(x => `${x.a} -> ${x.b}`).join(', ')} (existing files are not renamed unless Jordan asks; if he did, run with VERIFY_ALLOW_CONTENT_RENAME=1 and say so in the PR)`)
  }
}

// --- helpers to read a file at the base and now
const atBase = f => git('show', `${base}:${f}`)
const now = f => { try { return fs.readFileSync(f, 'utf8') } catch { return null } }
function front(text) {
  if (text === null || !text.startsWith('---')) return null
  const lines = text.split('\n'); const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (end < 0) return null
  const doc = parseDocument(lines.slice(1, end).join('\n'))
  if (doc.errors.length) return null
  return doc.toJS() ?? {}
}

// --- slug of a published item must not change (C5); new people_mentioned values must match a profile (C6)
const profileSlugs = new Set()
try {
  const team = JSON.parse(fs.readFileSync('content/team/full-team.json', 'utf8')); const arr = Array.isArray(team) ? team : team.body ?? []
  for (const e of arr) if (e.slug) profileSlugs.add(e.slug)
} catch { /* no team file: the check below reports every new value */ }
for (const dir of ['team', 'board', 'community']) {
  const d = path.join('content', dir)
  if (!fs.existsSync(d)) continue
  for (const n of fs.readdirSync(d)) {
    if (!n.endsWith('.md') || /^README/i.test(n)) continue
    profileSlugs.add(n.replace(/\.md$/, ''))
    const fm = front(now(path.join(d, n))); if (fm?.slug) profileSlugs.add(fm.slug)
  }
}
const slugProblems = [], mentionProblems = [], jsonSlugProblems = []
for (const x of status) {
  const f = x.b
  if (!isContent(f) || x.s === 'D') continue
  if (f.endsWith('.md') && !/(^|\/)README/i.test(f)) {
    const nowFm = front(now(f)); const baseFm = x.s === 'A' ? null : front(atBase(x.a))
    if (baseFm && nowFm && baseFm.published === true && baseFm.slug !== undefined && nowFm.slug !== baseFm.slug) slugProblems.push(`${f}: ${baseFm.slug} -> ${nowFm.slug}`)
    if (nowFm) {
      const before = new Set(Array.isArray(baseFm?.people_mentioned) ? baseFm.people_mentioned : [])
      for (const v of Array.isArray(nowFm.people_mentioned) ? nowFm.people_mentioned : []) if (!before.has(v) && !profileSlugs.has(v)) mentionProblems.push(`${f}: ${v}`)
    }
  } else if (f.endsWith('.json') && x.s !== 'A') {
    try {
      const b = JSON.parse(atBase(x.a)), n = JSON.parse(now(f))
      const sl = j => new Set((Array.isArray(j) ? j : j?.body ?? []).filter(e => e && typeof e === 'object' && e.slug).map(e => e.slug))
      const bs = sl(b), ns = sl(n)
      for (const s of bs) if (!ns.has(s)) jsonSlugProblems.push(`${f}: slug ${s} removed or changed`)
    } catch { /* not a JSON array with slugs */ }
  }
}
if (slugProblems.length || jsonSlugProblems.length) say('FAIL', `slug of an existing item changed (it drives the URL; C5): ${[...slugProblems, ...jsonSlugProblems].join('; ')}`)
else if (contentFiles.length) say('ok', 'no slug of an existing published item changed, no content file deleted or renamed')
if (mentionProblems.length) say('FAIL', `new people_mentioned value(s) that match no profile file in team, board or community (C6): ${mentionProblems.join('; ')}`)
else if (contentFiles.length) say('ok', 'every new people_mentioned value matches a profile file')

// --- the known-failures list is gone (C1): the validator must exit 0, so a list that tolerates failures must not come back
if (fs.existsSync(KF)) say('FAIL', `${KF} exists (C1: the list was deleted once the validator reached 0 failures; the validator must exit 0, fix the file instead)`)

finish()
function finish() { console.log(out.join('\n')); process.exit(0) }
