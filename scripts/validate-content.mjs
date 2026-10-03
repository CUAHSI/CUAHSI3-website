#!/usr/bin/env node
// Validates the files in content/ against scripts/content-schemas.mjs. Read-only.
//
//   npm run validate:content            all collections
//   npm run validate:content -- events  one collection (name as printed in the summary table)
//
// Exit code 0 if nothing failed, 1 if any file or cross-reference check failed.
// Not part of scripts/verify.sh (roadmap task 5 wires it in).
//
// What this checks is the FILES, not what the pages receive. It reads frontmatter with the same
// `yaml` package and the same call as the site's own reader (remark-mdc parseFrontMatter:
// parseDocument(text).toJSON()), so values come out the same: dates stay strings, and so on. Three
// differences, all deliberate:
//   1. The site never looks at document.errors. When the YAML is broken it keeps whatever the
//      parser recovered and carries on. This script reports every error and warning as a "YAML
//      parse failure", a separate category from schema failures.
//   2. The site then runs flat.unflatten() on the keys (a key "a.b" becomes a nested object) and
//      Nuxt Content adds its own fields (_path, _id, and a title made from the file name when
//      there is none). This script does none of that.
//   3. For JSON, the site wraps a top-level array as { body: [...] }. This script reads the array.
//   4. An empty frontmatter block (--- immediately followed by ---) is reported here as a failure;
//      the site just carries on with no fields.
//
// A run limited to one collection skips the cross-reference checks that need other collections.
// It says so (SKIP lines and the last line); a full run treats a skipped check as a failure.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument } from 'yaml'
import { COLLECTIONS } from './content-schemas.mjs'

// --root=DIR reads DIR/content/... instead of this repo's content/ (used to test the checks on a fixture)
const rootArg = process.argv.find(a => a.startsWith('--root='))
const ROOT = rootArg ? path.resolve(rootArg.slice(7)) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
if (!fs.existsSync(ROOT)) {
  console.error(`Not found: ${ROOT}. Nothing was validated.`)
  process.exit(2)
}
process.chdir(ROOT)

const only = process.argv.slice(2).filter(a => !a.startsWith('-'))
const selected = only.length ? COLLECTIONS.filter(c => only.includes(c.name)) : COLLECTIONS
if (only.length && selected.length !== only.length) {
  console.error(`Unknown collection. Known: ${COLLECTIONS.map(c => c.name).join(', ')}`)
  process.exit(2)
}
for (const c of selected) {
  const where = c.dir ?? c.file
  if (!fs.existsSync(where)) {
    console.error(`Not found: ${where} (looking in ${ROOT}). Nothing was validated.`)
    process.exit(2)
  }
}

// ---- frontmatter, mimicking the site's reader ---------------------------------------

function readFrontmatter(text) {
  if (!text.startsWith('---')) return { problems: [{ kind: 'error', text: 'no frontmatter: the file does not start with ---. The site reads no fields from it.' }], data: {} }
  const idx = text.indexOf('\n---')
  if (idx === -1) return { problems: [{ kind: 'error', text: 'frontmatter is never closed: there is no --- line after the opening one. The site reads no fields from the file.' }], data: {} }
  const fm = text.slice(4, idx - (text[idx - 1] === '\r' ? 1 : 0))
  if (!fm) return { problems: [{ kind: 'error', text: 'frontmatter is empty' }], data: {} }
  const doc = parseDocument(fm)
  const where = e => (e.linePos?.[0] ? `line ${e.linePos[0].line + 1}` : '')
  const problems = [
    ...doc.errors.map(e => ({ kind: 'error', text: `${e.code}${where(e) ? ' at ' + where(e) : ''}: ${e.message.split('\n')[0]}` })),
    ...doc.warnings.map(w => ({ kind: 'warning', text: `${w.code}${where(w) ? ' at ' + where(w) : ''}: ${w.message.split('\n')[0]}` })),
  ]
  const data = doc.toJSON()
  return { problems, data: data && typeof data === 'object' && !Array.isArray(data) ? data : {} }
}

// ---- schema issues -> readable lines ------------------------------------------------

function describe(issue) {
  const field = issue.path.length ? issue.path.join('.') : '(whole file)'
  if (issue.code === 'unrecognized_keys') return `${issue.path.length ? issue.path.join('.') + ': ' : ''}unknown key ${issue.keys.map(k => `"${k}"`).join(', ')}`
  if (issue.code === 'invalid_type' && /received undefined/.test(issue.message)) return `${field}: required, missing`
  return `${field}: ${issue.message}`
}

function lines(error) {
  const out = []
  for (const i of error.issues) {
    if (i.code === 'invalid_union' && Array.isArray(i.errors)) {
      // report the closest alternative: the one with the fewest problems
      const best = [...i.errors].sort((a, b) => a.length - b.length)[0] || []
      out.push(`(matches no allowed shape; closest shape has ${best.length} problem${best.length === 1 ? '' : 's'}:)`)
      for (const b of best) out.push('  ' + describe({ ...b, path: [...i.path, ...b.path] }))
    } else {
      out.push(describe(i))
    }
  }
  return out
}

// ---- load and check every collection ------------------------------------------------

const results = []        // one per collection
const skipped = []        // files not validated, with the reason
const refs = {            // collected for the cross-reference section
  slugs: new Map(),       // collection name -> [{ id, slug }]
  people: [],             // { file, value, yamlFailed }
  newsletterSource: [],   // { file, value }
  teamMdSlugs: [],        // { file, slug }
}

for (const c of selected) {
  const r = { name: c.name, total: 0, pass: 0, schemaFail: [], yamlFail: [] }
  results.push(r)

  if (c.kind === 'md') {
    const all = fs.readdirSync(c.dir).filter(f => f.endsWith('.md')).sort()
    for (const f of all.filter(f => f === 'README.md')) skipped.push(`${c.dir}/${f} (README, not content)`)
    for (const f of fs.readdirSync(c.dir, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== 'transcripts')) skipped.push(`${c.dir}/${f.name}/ (subfolder)`)
    for (const f of all.filter(f => f !== 'README.md')) {
      const file = `${c.dir}/${f}`
      r.total++
      const { data, problems } = readFrontmatter(fs.readFileSync(file, 'utf8'))
      const parsed = c.schema.safeParse(data)
      const slugOf = typeof data.slug === 'string' ? data.slug : null
      if (slugOf) (refs.slugs.get(c.name) ?? refs.slugs.set(c.name, []).get(c.name)).push({ id: file, slug: slugOf })
      if (c.name === 'team (.md)' && slugOf) refs.teamMdSlugs.push({ file, slug: slugOf })
      if (c.name === 'newsletter' || c.name === 'research') {
        for (const v of Array.isArray(data.people_mentioned) ? data.people_mentioned : []) refs.people.push({ file, value: v, yamlFailed: problems.length > 0 })
      }
      if (c.name === 'events') {
        for (const v of Array.isArray(data.newsletter_source) ? data.newsletter_source : []) refs.newsletterSource.push({ file, value: v })
      }
      if (problems.length) {
        r.yamlFail.push({ file, problems, siteSees: parsed.success ? [] : lines(parsed.error) })
      } else if (!parsed.success) {
        r.schemaFail.push({ file, issues: lines(parsed.error) })
      } else {
        r.pass++
      }
    }
  } else {
    r.total = 0
    let arr
    try {
      arr = JSON.parse(fs.readFileSync(c.file, 'utf8'))
    } catch (e) {
      r.total = 1
      r.yamlFail.push({ file: c.file, problems: [{ kind: 'error', text: `not valid JSON: ${e.message}` }], siteSees: [] })
      continue
    }
    if (!Array.isArray(arr)) {
      r.total = 1
      r.schemaFail.push({ file: c.file, issues: ['(whole file): expected a JSON array'] })
      continue
    }
    arr.forEach((entry, i) => {
      r.total++
      const label = `${c.file}[${i}]${typeof entry?.slug === 'string' ? ` (${entry.slug})` : typeof entry?.last_name === 'string' ? ` (${entry.first_name} ${entry.last_name})` : ''}`
      const parsed = c.schema.safeParse(entry)
      if (typeof entry?.slug === 'string') (refs.slugs.get(c.name) ?? refs.slugs.set(c.name, []).get(c.name)).push({ id: label, slug: entry.slug })
      if (parsed.success) r.pass++
      else r.schemaFail.push({ file: label, issues: lines(parsed.error) })
    })
  }
}

// transcripts are listed so it is clear they were not read
if (!only.length && fs.existsSync('content/cyberseminars/transcripts')) {
  const n = fs.readdirSync('content/cyberseminars/transcripts').length
  skipped.push(`content/cyberseminars/transcripts/ (${n} files, not validated)`)
}

// ---- cross-references ---------------------------------------------------------------

const xref = []   // { title, checked, problems: [] }
const skippedXref = []
const dupes = []
for (const [name, list] of refs.slugs) {
  const by = new Map()
  for (const { id, slug } of list) by.set(slug, [...(by.get(slug) ?? []), id])
  for (const [slug, ids] of by) if (ids.length > 1) dupes.push(`${name}: slug "${slug}" is used by ${ids.length} entries: ${ids.join(', ')}`)
}
xref.push({
  title: 'Slugs are unique within each collection',
  checked: `${[...refs.slugs.values()].reduce((a, l) => a + l.length, 0)} slugs in ${refs.slugs.size} collection(s): ${[...refs.slugs.keys()].join(', ')}`,
  problems: dupes,
})

const teamSlugs = new Set((refs.slugs.get('team/full-team.json') ?? []).map(x => x.slug))
if (teamSlugs.size && refs.people.length) {
  const bad = new Map()
  for (const p of refs.people) if (!teamSlugs.has(p.value)) bad.set(p.value, [...(bad.get(p.value) ?? []), p.file + (p.yamlFailed ? ' (file has a YAML parse failure)' : '')])
  xref.push({
    title: 'Every people_mentioned value is a staff slug in team/full-team.json (newsletter and research)',
    checked: `${refs.people.length} references in ${new Set(refs.people.map(p => p.file)).size} files, ${new Set(refs.people.map(p => p.value)).size} distinct values, against ${teamSlugs.size} staff slugs`,
    problems: [...bad].map(([v, files]) => `"${v}" is not a staff slug; used in ${files.join(', ')}`),
  })
} else {
  skippedXref.push('people_mentioned values vs staff slugs: needs team/full-team.json and newsletter or research, and found none of one or the other')
}
if (teamSlugs.size && refs.teamMdSlugs.length) {
  const mdBad = refs.teamMdSlugs.filter(t => !teamSlugs.has(t.slug))
  xref.push({
    title: 'Also checked: every content/team/*.md slug exists in team/full-team.json',
    checked: `${refs.teamMdSlugs.length} files`,
    problems: mdBad.map(t => `${t.file}: slug "${t.slug}" is not in full-team.json`),
  })
} else {
  skippedXref.push('team .md slugs vs full-team.json: needs both "team (.md)" and team/full-team.json, and found none of one or the other')
}
const nlSlugs = new Set((refs.slugs.get('newsletter') ?? []).map(x => x.slug))
if (nlSlugs.size && refs.newsletterSource.length) {
  const bad = new Map()
  for (const p of refs.newsletterSource) if (!nlSlugs.has(p.value)) bad.set(p.value, [...(bad.get(p.value) ?? []), p.file])
  xref.push({
    title: 'Every events newsletter_source value is a newsletter slug',
    checked: `${refs.newsletterSource.length} references in ${new Set(refs.newsletterSource.map(p => p.file)).size} files, ${new Set(refs.newsletterSource.map(p => p.value)).size} distinct values, against ${nlSlugs.size} newsletter slugs`,
    problems: [...bad].map(([v, files]) => `"${v}" is not a newsletter slug; used in ${files.join(', ')}`),
  })
} else {
  skippedXref.push('events newsletter_source values vs newsletter slugs: needs both newsletter and events, and found none of one or the other')
}

// ---- print --------------------------------------------------------------------------

const pad = (s, n) => String(s).padEnd(n)
console.log('Content validation (read-only). Frontmatter parsed with yaml 2.9.0, as the site does; see the header of scripts/validate-content.mjs for the differences.\n')
console.log(`${pad('Collection', 24)}${pad('Checked', 9)}${pad('Pass', 7)}${pad('Schema fail', 13)}YAML parse fail`)
for (const r of results) console.log(`${pad(r.name, 24)}${pad(r.total, 9)}${pad(r.pass, 7)}${pad(r.schemaFail.length, 13)}${r.yamlFail.length}`)
const tot = results.reduce((a, r) => ({ n: a.n + r.total, p: a.p + r.pass, s: a.s + r.schemaFail.length, y: a.y + r.yamlFail.length }), { n: 0, p: 0, s: 0, y: 0 })
console.log(`${pad('Total', 24)}${pad(tot.n, 9)}${pad(tot.p, 7)}${pad(tot.s, 13)}${tot.y}`)
console.log('(Checked = files for markdown collections, array entries for the JSON files. A file with a YAML parse failure is not also counted as a schema failure.)')

const yamlRows = results.flatMap(r => r.yamlFail.map(f => ({ ...f, name: r.name })))
console.log(`\n== YAML parse failures: ${yamlRows.length} ==`)
if (!yamlRows.length) console.log('none')
for (const f of yamlRows) {
  console.log(`${f.file}`)
  for (const p of f.problems) console.log(`  ${p.kind}: ${p.text}`)
  if (f.siteSees.length) {
    console.log('  What was recovered from this file would also fail the schema:')
    for (const l of f.siteSees.slice(0, 4)) console.log(`    ${l}`)
    if (f.siteSees.length > 4) console.log(`    ... and ${f.siteSees.length - 4} more`)
  }
}

const schemaRows = results.flatMap(r => r.schemaFail.map(f => ({ ...f, name: r.name })))
console.log(`\n== Schema failures: ${schemaRows.length} ==`)
if (!schemaRows.length) console.log('none')
for (const r of results) {
  if (!r.schemaFail.length) continue
  console.log(`${r.name}: ${r.schemaFail.length} of ${r.total} fail`)
  for (const f of r.schemaFail) {
    console.log(`  ${f.file}`)
    for (const l of f.issues) console.log(`    ${l}`)
  }
}

console.log('\n== Cross-references ==')
let xrefFail = 0
for (const x of xref) {
  console.log(`${x.problems.length ? 'FAIL' : 'ok  '}  ${x.title} (${x.checked})`)
  for (const p of x.problems) console.log(`        ${p}`)
  xrefFail += x.problems.length
}
for (const s of skippedXref) console.log(`SKIP  ${s}`)

if (skipped.length) {
  console.log('\n== Not validated ==')
  for (const s of skipped) console.log(`  ${s}`)
  console.log('  Markdown bodies are never validated, only frontmatter.')
}

// A limited run may skip checks that need other collections; that is reported, not failed. A full run
// that skipped a check read no staff or newsletter slugs at all, which is a failure.
const skippedFail = only.length ? 0 : skippedXref.length
const failed = tot.s + tot.y + xrefFail + skippedFail
console.log(`\n${failed ? 'FAILED' : 'OK'}: ${tot.y} YAML parse failure(s), ${tot.s} schema failure(s), ${xrefFail} cross-reference problem(s)` +
  (skippedXref.length ? `, ${skippedXref.length} cross-reference check group(s) SKIPPED${only.length ? ' (this was a partial run; run without a collection name for the full check)' : ''}.` : '.'))
process.exit(failed ? 1 : 0)
