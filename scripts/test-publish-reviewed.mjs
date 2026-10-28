// Checks for scripts/publish-reviewed.mjs (the /publish comment on a jobs-agent PR). No network. Not part of verify.sh.
// Run: node scripts/test-publish-reviewed.mjs   (exit 1 if anything below fails)
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { parseCommand, manifestFromBody, selectFiles, flipPublished, titleOf } from './publish-reviewed.mjs'
let failures = 0
const check = (ok, label, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ' | ' + detail : ''}`) }

console.log('-- the comment')
check(parseCommand('/publish all').all === true, 'all')
check(JSON.stringify(parseCommand('/publish 1 3 5').numbers) === '[1,3,5]', 'numbers with spaces')
check(JSON.stringify(parseCommand('/publish 2, 4,6').numbers) === '[2,4,6]', 'numbers with commas')
check(JSON.stringify(parseCommand('/publish 3 3 1').numbers) === '[3,1]', 'repeats removed')
check(JSON.stringify(parseCommand('/publish 2\nthanks, this one looks fine').numbers) === '[2]', 'only the first line counts')
check(parseCommand('looks good, /publish 2').silent === true, 'ordinary comment: ignored without a reply')
check(parseCommand('/publisher 2').silent === true, '/publisher is not the command: ignored without a reply')
for (const bad of ['/publish', '/publish 0 x', '/publish all 2', '/publish 1;rm -rf', '/publish $(id)', '/publish `id`', '/publish 1 && echo', '/publish ../../x', '/publish -1', '/publish 1.5']) {
  const r = parseCommand(bad); check(r.ok === false && !r.silent && typeof r.reason === 'string', `refused with a reply: ${bad}`)
}
check(parseCommand(undefined).silent === true && parseCommand('').silent === true, 'empty comment ignored')

console.log('-- the list in the PR body')
const names = ['261026-a.md', '261027-b-c.md', '261027-d.md']
const body = `text\n<!-- review-files: ${JSON.stringify(names)} -->\nmore`
check(JSON.stringify(manifestFromBody(body)) === JSON.stringify(names), 'read')
check(manifestFromBody('no list here') === null, 'no list: null')
check(manifestFromBody('<!-- review-files: [1,2] -->') === null, 'not strings: null')
check(manifestFromBody('<!-- review-files: ["../x.md"] -->') === null, 'a path is refused')
check(manifestFromBody('<!-- review-files: ["a/b.md"] -->') === null, 'a slash is refused')
check(manifestFromBody('<!-- review-files: ["a.sh"] -->') === null, 'not .md is refused')
check(manifestFromBody('<!-- review-files: [bad json -->') === null, 'bad json: null')
check(JSON.stringify(manifestFromBody('<!-- review-files: [] -->')) === '[]', 'an empty list reads as empty (the script then says there is nothing to publish)')

console.log('-- which files')
check(JSON.stringify(selectFiles(names, parseCommand('/publish all')).files) === JSON.stringify(names), 'all')
check(JSON.stringify(selectFiles(names, parseCommand('/publish 3 1')).files) === JSON.stringify([names[2], names[0]]), 'numbers map to rows, in the order asked')
const bad = selectFiles(names, parseCommand('/publish 1 4'))
check(bad.files.length === 0 && /row 4/.test(bad.errors[0]), 'one row out of range: nothing is published', bad.errors[0])
check(selectFiles(names, parseCommand('/publish 0')).errors.length === 1, 'row 0 is out of range')

console.log('-- the file edit')
const fm = (pub, extra = '') => `---\ntitle: "T"\npublished: ${pub}\n${extra}---\n\nbody\npublished: false\n`
let r = flipPublished(fm('false'))
check(r.status === 'published' && r.text === fm('true'), 'false becomes true, and nothing else changes (the body line stays)')
r = flipPublished(fm('true')); check(r.status === 'already' && r.text === fm('true'), 'already true: untouched')
r = flipPublished('---\ntitle: x\n---\nbody\n'); check(r.status === 'no-published-line', 'no published line: untouched')
r = flipPublished('no front matter\npublished: false\n'); check(r.status === 'no-front-matter' && r.text.includes('published: false'), 'no front matter: untouched, body line not edited')
r = flipPublished('---\ntitle: x\n---\npublished: false\n'); check(r.status === 'no-published-line' && r.text.endsWith('published: false\n'), 'body line is not the published line')
check(titleOf(fm('false')) === 'T', 'title read')

console.log('-- the command line, on a temporary directory')
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pub-'))
fs.mkdirSync(path.join(dir, 'work/content/jobs'), { recursive: true })
for (const n of names) fs.writeFileSync(path.join(dir, 'work/content/jobs', n), fm('false'))
fs.writeFileSync(path.join(dir, 'body.txt'), body)
const run = comment => {
  fs.writeFileSync(path.join(dir, 'c.txt'), comment)
  const gh = path.join(dir, 'gh_out'); fs.writeFileSync(gh, '')
  execFileSync('node', ['scripts/publish-reviewed.mjs', '--comment-file', path.join(dir, 'c.txt'), '--body-file', path.join(dir, 'body.txt'), '--dir', path.join(dir, 'work'), '--out', path.join(dir, 'result.md')], { env: { ...process.env, GITHUB_OUTPUT: gh } })
  return { out: fs.readFileSync(gh, 'utf8').trim(), msg: fs.readFileSync(path.join(dir, 'result.md'), 'utf8') }
}
const state = n => /published: (true|false)/.exec(fs.readFileSync(path.join(dir, 'work/content/jobs', n), 'utf8'))[1]
let x = run('/publish 9'); check(x.out === 'changed=0' && names.every(n => state(n) === 'false'), 'out of range changes nothing', x.msg.trim())
x = run('/publish 1 3'); check(x.out === 'changed=2' && state(names[0]) === 'true' && state(names[1]) === 'false' && state(names[2]) === 'true', 'rows 1 and 3 published, row 2 left', x.msg.split('\n')[0])
x = run('/publish all'); check(x.out === 'changed=1' && names.every(n => state(n) === 'true') && /already published/.test(x.msg), 'all: the rest, and the two done are reported', x.msg.split('\n').slice(0, 2).join(' / '))
x = run('thanks'); check(x.out === 'changed=0' && x.msg === '', 'an ordinary comment is silent: the reply file is empty (a blank reply would fail the workflow)')
x = run('/publisher 2'); check(x.msg === '', '/publisher is silent too')
// a symlink in content/jobs is not written through
fs.writeFileSync(path.join(dir, 'target.md'), fm('false'))
fs.rmSync(path.join(dir, 'work/content/jobs', names[0]))
fs.symlinkSync(path.join(dir, 'target.md'), path.join(dir, 'work/content/jobs', names[0]))
x = run('/publish 1'); check(x.out === 'changed=0' && /not on this branch/.test(x.msg) && /published: false/.test(fs.readFileSync(path.join(dir, 'target.md'), 'utf8')), 'a symlinked file is refused and its target untouched')
fs.rmSync(dir, { recursive: true })
if (failures) { console.log(`${failures} FAILED`); process.exit(1) }
console.log('all ok')
