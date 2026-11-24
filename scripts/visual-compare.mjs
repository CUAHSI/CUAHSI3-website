// Compares screenshots of two builds: the commit this branch was cut from and this branch (.output/public, so build first).
//   npm run build:search && npm run visual:compare
//   npm run visual:compare -- about-team home        only the named routes (names in scripts/visual-routes.json)
// Nothing is stored in git: the images of the first build are made on the spot, in .agent/visual/. See tests/visual/README.md.
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { baseRef } from './base-ref.mjs'

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()
const branchDir = path.resolve('.output/public')
if (!fs.existsSync(branchDir)) { console.error('No .output/public. Run: npm run build:search'); process.exit(1) }

const names = process.argv.slice(2)
const known = JSON.parse(fs.readFileSync('scripts/visual-routes.json', 'utf8')).map(r => r.name)
const unknown = names.filter(n => !known.includes(n))
if (unknown.length) { console.error(`Not in scripts/visual-routes.json: ${unknown.join(', ')}`); process.exit(1) }

// The base build, kept for the current base commit only, so a second run on the same branch does not build it again
const ref = baseRef()
let sha
try { sha = git('merge-base', ref, 'HEAD') } catch { console.error(`No ${ref} here. Run: git fetch ${ref.split('/')[0]}`); process.exit(1) }
const builds = path.resolve('.agent/visual/builds')
const baseDir = path.join(builds, sha.slice(0, 12))
if (!fs.existsSync(path.join(baseDir, 'index.html'))) {
  console.log(`Building ${sha.slice(0, 12)} (the commit this branch was cut from)`)
  fs.rmSync(builds, { recursive: true, force: true })
  const wt = fs.mkdtempSync(path.join(os.tmpdir(), 'cuahsi-base-'))
  git('worktree', 'add', '--detach', '--force', wt, sha)
  let status
  try {
    fs.symlinkSync(path.resolve('node_modules'), path.join(wt, 'node_modules'))
    status = spawnSync('npm', ['run', 'build:search'], { cwd: wt, stdio: ['ignore', 'ignore', 'inherit'] }).status
    // Copied under another name first, so an interrupted copy does not count as a build
    if (status === 0) { fs.cpSync(path.join(wt, '.output/public'), `${baseDir}-part`, { recursive: true }); fs.renameSync(`${baseDir}-part`, baseDir) }
  } finally {
    fs.rmSync(path.join(wt, 'node_modules'), { force: true })
    git('worktree', 'remove', '--force', wt)
  }
  if (status !== 0) { console.error('The base build failed.'); process.exit(1) }
}

// One Playwright run over a build. `pixels` are the images that differ, `errors` the ones that could not be made ("390 home").
function run(dir, only, out, extra = []) {
  const json = path.resolve('.agent/visual', `${out}.json`)
  fs.rmSync(json, { force: true })
  const filter = only.length ? ['-g', ` (${only.join('|')})$`] : []
  spawnSync('npx', ['playwright', 'test', '--reporter=list,json', '--output', `.agent/visual/${out}`, ...filter, ...extra],
    { stdio: 'inherit', env: { ...process.env, SITE_DIR: dir, PLAYWRIGHT_JSON_OUTPUT_NAME: json } })
  if (!fs.existsSync(json)) stop(`The ${out} run did not start.`)
  const all = [], pixels = [], errors = []
  const walk = s => {
    for (const sp of s.specs ?? []) for (const t of sp.tests) {
      const name = `${t.projectName} ${sp.title}`
      all.push(name)
      if (sp.ok) continue
      const msg = t.results.flatMap(r => r.errors ?? []).map(e => e.message ?? '').join(' ')
      ;(/pixels \(ratio|Expected an image/.test(msg) ? pixels : errors).push(name)
    }
    (s.suites ?? []).forEach(walk)
  }
  JSON.parse(fs.readFileSync(json, 'utf8')).suites.forEach(walk)
  if (!all.length) stop(`The ${out} run had no tests.`)
  return { all, pixels, errors }
}
function stop(msg) { console.error(msg); process.exit(1) }
const routesOf = list => [...new Set(list.map(f => f.split(' ')[1]))]

fs.rmSync(path.resolve('.agent/visual/images'), { recursive: true, force: true })
const shots = run(baseDir, names, 'base', ['--update-snapshots=all'])
// A route the base build does not have (a new page), or one whose image could not be made there
const missing = [...shots.pixels, ...shots.errors]
if (missing.length === shots.all.length) stop('None of the base build\'s images could be made.')
const routes = routesOf(shots.all).filter(r => !routesOf(missing).includes(r))
const first = run(branchDir, routes, 'branch')
if (first.errors.length) stop(`These pages could not be shot on this branch: ${first.errors.join(', ')}`)

// A page that differs from itself on the base build, or from the base in only one of two runs, is not repeatable
let changed = [], unsteady = []
if (first.pixels.length) {
  const self = run(baseDir, routesOf(first.pixels), 'base-again')
  const second = run(branchDir, routesOf(first.pixels), 'branch-again')
  const bad = [...self.errors, ...second.errors]
  if (bad.length) stop(`These pages could not be shot again: ${bad.join(', ')}`)
  changed = first.pixels.filter(f => second.pixels.includes(f) && !self.pixels.includes(f))
  unsteady = first.pixels.filter(f => !changed.includes(f))
}
console.log(`\nvisual:compare: ${first.all.length - first.pixels.length} of ${first.all.length} images the same`)
if (changed.length) console.log(`Changed on this branch (${changed.length}): ${changed.join(', ')}`)
if (unsteady.length) console.log(`Not repeatable, a real change can hide here (${unsteady.length}): ${unsteady.join(', ')}`)
if (missing.length) console.log(`Not on the base, so not compared (${missing.length}): ${missing.join(', ')}`)
if (first.pixels.length) console.log('Open the -diff.png files under .agent/visual/branch/')
process.exit(first.pixels.length || missing.length ? 1 : 0)
