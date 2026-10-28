// The logic of .github/workflows/publish-reviewed.yml: a comment "/publish 2 5" (or "/publish all") on a jobs-agent PR publishes
// those rows of its review table. The agent writes the review files, in row order, in the PR body as
//   <!-- review-files: ["a.md", "b.md"] -->
// This script turns the comment and that line into the files to change, and sets `published: false` to `true` in each.
// Pure functions are exported and tested by scripts/test-publish-reviewed.mjs. The command line part reads only its arguments.
//   node scripts/publish-reviewed.mjs --comment-file c.txt --body-file b.txt --dir work   (writes result.md next to --out)
// Safe by construction: the comment is read from a file (never put in a shell command), only its first line counts and must match
// the one command pattern, only files named in the PR body's list change, a file name must be a plain .md name (no path), and
// only the front matter's `published: false` line is touched.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE_NAME = /^[0-9a-z][0-9a-z._-]*\.md$/
const COMMAND = /^\/publish[ \t]+(all|[0-9]+(?:[ \t,]+[0-9]+)*)[ \t]*$/

export function parseCommand(comment) {
  const first = String(comment ?? '').split(/\r?\n/, 1)[0].trim()
  if (!/^\/publish([ \t]|$)/.test(first)) return { ok: false, silent: true }
  const m = COMMAND.exec(first)
  if (!m) return { ok: false, reason: 'I did not understand that. Use `/publish all` or `/publish 1 3 5` (row numbers from the review table).' }
  if (m[1] === 'all') return { ok: true, all: true, numbers: [] }
  return { ok: true, all: false, numbers: [...new Set(m[1].split(/[ \t,]+/).map(Number))] }
}

export function manifestFromBody(body) {
  const m = /<!-- review-files: (\[.*?\]) -->/s.exec(String(body ?? ''))
  if (!m) return null
  let list
  try { list = JSON.parse(m[1]) } catch { return null }
  if (!Array.isArray(list) || list.some(n => typeof n !== 'string' || !FILE_NAME.test(n))) return null
  return list
}

export function selectFiles(manifest, cmd) {
  if (cmd.all) return { files: [...manifest], errors: [] }
  const errors = cmd.numbers.filter(n => n < 1 || n > manifest.length).map(n => `row ${n} is not in the review table (1 to ${manifest.length})`)
  return { files: errors.length ? [] : cmd.numbers.map(n => manifest[n - 1]), errors }
}

// Only the front matter (between the first two --- lines) is searched, and only a line that is exactly `published: false`.
export function flipPublished(text) {
  const lines = text.split('\n')
  if (lines[0].trim() !== '---') return { text, status: 'no-front-matter' }
  const end = lines.indexOf('---', 1)
  if (end < 0) return { text, status: 'no-front-matter' }
  const i = lines.slice(1, end).findIndex(l => /^published:[ \t]*(true|false)[ \t]*$/.test(l))
  if (i < 0) return { text, status: 'no-published-line' }
  if (/true/.test(lines[i + 1])) return { text, status: 'already' }
  lines[i + 1] = 'published: true'
  return { text: lines.join('\n'), status: 'published' }
}

export function titleOf(text) {
  const m = /^title:[ \t]*(.*)$/m.exec(text.split(/\n---/, 1)[0])
  return m ? m[1].trim().replace(/^"|"$/g, '') : '(no title)'
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = n => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : undefined }
  const out = arg('out') ?? 'result.md'
  const finish = (changed, message) => {
    fs.writeFileSync(out, message ? message + '\n' : '')   // empty stays empty: the workflow posts a reply only when the file has content
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
    console.log(message)
  }
  const cmd = parseCommand(fs.readFileSync(arg('comment-file'), 'utf8'))
  if (!cmd.ok) { if (cmd.silent) { finish(0, ''); process.exit(0) } finish(0, cmd.reason); process.exit(0) }
  const manifest = manifestFromBody(fs.readFileSync(arg('body-file'), 'utf8'))
  if (!manifest || !manifest.length) { finish(0, 'This PR has no list of review jobs to publish.'); process.exit(0) }
  const { files, errors } = selectFiles(manifest, cmd)
  if (errors.length) { finish(0, errors.join('; ') + '.'); process.exit(0) }
  const dir = path.resolve(arg('dir') ?? '.')
  const done = [], notes = []
  for (const name of files) {
    const p = path.join(dir, 'content', 'jobs', name)
    if (!FILE_NAME.test(name) || !fs.existsSync(p) || fs.lstatSync(p).isSymbolicLink()) { notes.push(`\`${name}\` is not on this branch`); continue }
    const r = flipPublished(fs.readFileSync(p, 'utf8'))
    if (r.status === 'published') { fs.writeFileSync(p, r.text); done.push(`- ${titleOf(r.text)} (\`${name}\`)`) }
    else notes.push(`\`${name}\`: ${r.status === 'already' ? 'already published' : 'could not read its published line'}`)
  }
  const msg = (done.length ? `Published ${done.length} job${done.length === 1 ? '' : 's'} on this branch:\n${done.join('\n')}\n\nMerging this PR now publishes them with the others. The \`verify\` check does not re-run on this commit; it changes only \`published:\` lines.` : 'Nothing changed.') +
    (notes.length ? `\n\nNot changed: ${notes.join('; ')}.` : '')
  finish(done.length, msg)
}
