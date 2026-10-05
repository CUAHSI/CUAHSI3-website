#!/usr/bin/env node
// Built-site link check (roadmap task 5): every internal href / src in .output/public must resolve to a file.
//   node scripts/check-links.mjs            checks .output/public (build first: npm run build:search)
//   LINK_ROOT=some/dir node scripts/check-links.mjs
// A link counts as internal when it starts with "/" (not "//") or has no scheme. It resolves when the path is a file
// or a directory with index.html (a foo.html file does NOT make /foo resolve). Query strings and #fragments are
// ignored (an #anchor is not checked). Read: href, src, poster, srcset, and meta content that starts with "/".
// Paths that netlify.toml redirects (its [[redirects]] "from" values, exact match only) count as resolved; the
// redirect targets are not checked. mailto:, tel:, http(s): and
// data: links are not checked. This reads files; it is not a click and does not see links that JavaScript builds.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.env.LINK_ROOT || '.output/public')
if (!fs.existsSync(root)) { console.error(`no such directory: ${root} (build first)`); process.exit(2) }

const redirectFrom = new Set()
try {
  for (const m of fs.readFileSync('netlify.toml', 'utf8').matchAll(/^\s*from\s*=\s*"([^"]+)"/gm)) redirectFrom.add(m[1].replace(/\/$/, ''))
} catch { /* no netlify.toml: nothing to allow */ }

const htmlFiles = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) htmlFiles.push(p)
  }
})(root)

const exists = p => { try { return fs.statSync(p) } catch { return null } }
function resolves(urlPath) {
  let clean
  try { clean = decodeURIComponent(urlPath).replace(/\/+$/, '') } catch { return false }   // a malformed %-sequence is a broken link
  if (redirectFrom.has(clean)) return true
  const abs = path.join(root, clean)
  if (abs !== root && !abs.startsWith(root + path.sep)) return false
  const st = exists(abs)
  if (st && st.isFile()) return true
  return !!(st && st.isDirectory() && exists(path.join(abs, 'index.html')))
}

// Read the tags that can carry a URL, quote-aware (a ">" inside a quoted attribute, such as a Tailwind class
// "[&>p]:mt-4", does not end the tag). Quoted, single-quoted and unquoted attributes are read.
const TAGS = /<(a|link|script|img|source|iframe|video|audio|meta)\b/gi
const ATTR = /([^\s"'<>\/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
function* urlsIn(html) {
  for (const m of html.matchAll(TAGS)) {
    let i = m.index + m[0].length, q = null
    for (; i < html.length; i++) {
      const c = html[i]
      if (q) { if (c === q) q = null } else if (c === '"' || c === "'") q = c
      else if (c === '>') break
    }
    const tag = html.slice(m.index + m[0].length, i)
    const isMeta = m[1].toLowerCase() === 'meta'
    for (const a of tag.matchAll(ATTR)) {
      const name = a[1].toLowerCase(), val = (a[2] ?? a[3] ?? a[4] ?? '').trim()
      if (name === 'href' || name === 'src' || name === 'poster' || name === 'data-src') { if (!isMeta) yield val }
      else if (name === 'srcset' || name === 'imagesrcset') { for (const part of val.split(',')) yield part.trim().split(/\s+/)[0] }
      else if (name === 'content' && isMeta && val.startsWith('/') && !val.startsWith('//')) yield val
    }
  }
}

let total = 0
const bad = new Map()   // target -> Set of pages
const distinct = new Set()
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const page = '/' + rel.replace(/(^|\/)index\.html$/, '$1')
  const base = '/' + path.posix.dirname(rel) + '/'   // relative links resolve against the file's directory
  const html = fs.readFileSync(file, 'utf8')
  for (let url of urlsIn(html)) {
    if (!url || url.startsWith('#') || /^(mailto:|tel:|data:|javascript:|blob:|[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) continue
    url = url.split('#')[0].split('?')[0]
    if (!url) continue
    const target = url.startsWith('/') ? url : path.posix.normalize(path.posix.join(base, url))
    total++
    distinct.add(target)
    if (!resolves(target)) {
      if (!bad.has(target)) bad.set(target, new Set())
      bad.get(target).add(page)
    }
  }
}

console.log(`link check: ${htmlFiles.length} html files, ${total} internal references, ${distinct.size} distinct targets, ${bad.size} unresolved`)
for (const [t, pages] of [...bad].slice(0, 40)) console.log(`  ${t}   (on ${pages.size} page${pages.size === 1 ? '' : 's'}, e.g. ${[...pages][0]})`)
if (bad.size > 40) console.log(`  ... and ${bad.size - 40} more`)
process.exit(bad.size ? 1 : 0)
