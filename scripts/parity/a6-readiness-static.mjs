#!/usr/bin/env node
// Site audit, task A6 (org issue 111), step 1 of 2: what a search engine reads from the built site. Offline; reads .output/public and the Search Console export.
//
//   node scripts/parity/a6-readiness-static.mjs [--public .output/public] [--sc path/to/Pages.csv] [--sitemap path/to/sitemap.xml] [--out agent/audit] [--tag closed]
//
// For every built page (each index.html or *.html under the build, 200.html and 404.html apart): <title>, meta description, canonical link, robots meta, Open Graph and
// Twitter tags, JSON-LD blocks, <h1> count, lang, images without alt, whether the page is a redirect stub (meta refresh). Then the duplicates among titles and descriptions.
// From public/_redirects: every rule, rules whose target is itself a source (chains), loops, targets that are not built pages, sources that are built pages.
// From the Search Console pages export (cuahsi.org host only): the 12 pages with most clicks, and where each lands on this site (through the redirect rules, then a built page, or nowhere).
// Writes <out>/a6_pages_<tag>.csv, a6_redirects.csv, a6_top_pages.csv and a6_static_numbers_<tag>.json. File names carry no date (the owner's rule for in-progress files).
import fs from 'node:fs'
import path from 'node:path'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const PUB = String(argv.public || '.output/public'), OUT = String(argv.out || 'agent/audit'), TAG = String(argv.tag || 'closed'), SC = argv.sc ? String(argv.sc) : ''
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, header, rows) => fs.writeFileSync(file, [header.join(','), ...rows.map(r => header.map(c => csvCell(r[c])).join(','))].join('\n') + '\n')
const readCsv = file => {
  const rows = []; let row = [], cell = '', q = false; const t = fs.readFileSync(file, 'utf8')
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const h = rows.shift(); return rows.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
}
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['_nuxt', 'pagefind', 'api', '__sitemap__'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)])
const route = f => { let r = '/' + path.relative(PUB, f).replace(/\\/g, '/'); r = r.replace(/index\.html$/, '').replace(/\.html$/, ''); return r.length > 1 ? r.replace(/\/$/, '') : '/' }
const dec = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const noMail = s => s.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '(e-mail removed)')  // C11: an address in a title or description is not written out
const attr = (tag, n) => { const m = tag.match(new RegExp('\\b' + n + '\\s*=\\s*"([^"]*)"', 'i')); return m ? dec(m[1]) : undefined }

const files = walk(PUB).filter(f => f.endsWith('.html') && !/(^|\/)(200|404)\.html$/.test(f))
const pages = []
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8'), head = (h.match(/<head>([\s\S]*?)<\/head>/) || [, ''])[1], body = h.slice(h.indexOf('</head>'))
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0])
  const meta = n => { const m = metas.find(t => (attr(t, 'name') || attr(t, 'property')) === n); return m ? attr(m, 'content') : undefined }
  const canon = (head.match(/<link\b[^>]*rel="canonical"[^>]*>/i) || [])[0]
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map(m => m[0])
  const refresh = metas.find(t => /http-equiv="refresh"/i.test(t))
  pages.push({
    route: route(f), file: path.relative(PUB, f), title: noMail(dec(((head.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]).trim())), description: noMail(meta('description') || ''),
    canonical: canon ? attr(canon, 'href') : '', robots: meta('robots') || '', og_title: meta('og:title') ? 1 : 0, og_description: meta('og:description') ? 1 : 0, og_image: meta('og:image') ? 1 : 0, twitter_card: meta('twitter:card') ? 1 : 0,
    jsonld: (head + body).match(/<script[^>]*type="application\/ld\+json"/gi)?.length || 0, h1: (body.match(/<h1\b/gi) || []).length, lang: (h.match(/<html[^>]*\blang="([^"]*)"/i) || [, ''])[1],
    imgs: imgs.length, imgs_no_alt: imgs.filter(t => attr(t, 'alt') === undefined).length, imgs_empty_alt: imgs.filter(t => attr(t, 'alt') === '').length, refresh: refresh ? 1 : 0, bytes: Buffer.byteLength(h),
  })
}
pages.sort((a, b) => a.route.localeCompare(b.route))
const stubs = pages.filter(p => p.refresh), real = pages.filter(p => !p.refresh)
const dupes = (k, set) => { const m = new Map(); for (const p of set) if (p[k]) m.set(p[k], [...(m.get(p[k]) || []), p.route]); return [...m.entries()].filter(([, v]) => v.length > 1) }
const dupT = dupes('title', real), dupD = dupes('description', real)
writeCsv(path.join(OUT, `a6_pages_${TAG}.csv`), Object.keys(pages[0]), pages)

// redirects
const rules = fs.readFileSync(path.join(PUB, '_redirects'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => { const [from, to, status] = l.split(/\s+/); return { from, to, status } })
const bySrc = new Map(rules.map(r => [r.from, r])), built = new Set(pages.map(p => p.route))
const resolve = start => {
  const hops = []; let cur = start, seen = new Set()
  for (;;) {
    const clean = cur.replace(/[?#].*$/, '').replace(/(.)\/$/, '$1'); const r = bySrc.get(clean)
    if (!r) return { final: clean, hops, outcome: built.has(clean) ? 'page' : /^https?:/.test(cur) ? 'other site' : fs.existsSync(path.join(PUB, clean)) && fs.statSync(path.join(PUB, clean)).isFile() ? 'file' : 'nothing built' }
    if (seen.has(clean)) return { final: clean, hops, outcome: 'loop' }
    seen.add(clean); hops.push(r.status); cur = r.to
  }
}
const rrows = rules.map(r => { const t = resolve(r.from); return { from: r.from, to: r.to, status: r.status, hops: t.hops.length, final: t.final, outcome: t.outcome, source_is_built_page: built.has(r.from.replace(/\/$/, '')) ? 1 : 0 } })
writeCsv(path.join(OUT, 'a6_redirects.csv'), Object.keys(rrows[0]), rrows)

// top 12 pages (clicks), cuahsi.org host only
let top = []
if (SC) {
  const sc = readCsv(SC).filter(r => /^https:\/\/www\.cuahsi\.org(\/|$)/.test(r['Top pages'])).slice(0, 12)
  top = sc.map((r, i) => { const p = new URL(r['Top pages']).pathname.replace(/(.)\/$/, '$1'), t = resolve(p); return { rank: i + 1, legacy_path: p, clicks: r.Clicks, impressions: r.Impressions, hops: t.hops.length, lands_on: t.final, outcome: t.outcome } })
  writeCsv(path.join(OUT, 'a6_top_pages.csv'), Object.keys(top[0]), top)
}
const n = {
  build: PUB, pages_built: pages.length, redirect_stubs: stubs.length, pages_real: real.length,
  title_missing: real.filter(p => !p.title).length, title_empty_before_suffix: real.filter(p => /^·/.test(p.title)).length, title_over_60: real.filter(p => p.title.length > 60).length, title_duplicate_groups: dupT.length, title_duplicate_pages: dupT.reduce((a, [, v]) => a + v.length, 0),
  description_missing: real.filter(p => !p.description).length, description_duplicate_groups: dupD.length, description_duplicate_pages: dupD.reduce((a, [, v]) => a + v.length, 0),
  canonical_present: real.filter(p => p.canonical).length, robots_meta_values: Object.fromEntries([...new Set(real.map(p => p.robots))].map(v => [v || '(none)', real.filter(p => p.robots === v).length])),
  og_title: real.filter(p => p.og_title).length, og_description: real.filter(p => p.og_description).length, og_image: real.filter(p => p.og_image).length, twitter_card: real.filter(p => p.twitter_card).length, jsonld_pages: real.filter(p => p.jsonld).length,
  h1_zero: real.filter(p => p.h1 === 0).length, h1_many: real.filter(p => p.h1 > 1).length, lang_missing: real.filter(p => !p.lang).length, images: real.reduce((a, p) => a + p.imgs, 0), images_no_alt_attr: real.reduce((a, p) => a + p.imgs_no_alt, 0), images_empty_alt: real.reduce((a, p) => a + p.imgs_empty_alt, 0),
  redirect_rules: rules.length, by_status: Object.fromEntries([...new Set(rules.map(r => r.status))].map(s => [s, rules.filter(r => r.status === s).length])), redirect_multi_hop: rrows.filter(r => r.hops > 1).length, redirect_loops: rrows.filter(r => r.outcome === 'loop').length,
  redirect_outcomes: Object.fromEntries([...new Set(rrows.map(r => r.outcome))].map(o => [o, rrows.filter(r => r.outcome === o).length])), redirect_source_is_built_page: rrows.filter(r => r.source_is_built_page).length,
  top_pages: top.map(t => `${t.rank} ${t.legacy_path} -> ${t.outcome} ${t.lands_on} (${t.hops} hop)`),
  duplicate_title_examples: dupT.slice(0, 8).map(([t, v]) => ({ title: t, count: v.length, first: v.slice(0, 3) })), duplicate_description_examples: dupD.slice(0, 5).map(([t, v]) => ({ description: t.slice(0, 90), count: v.length, first: v.slice(0, 3) })),
  sitemap_loc: (fs.existsSync(path.join(PUB, 'sitemap.xml')) ? fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8').match(/<loc>/g)?.length || 0 : null),
}
if (argv.sitemap) {
  const locs = [...fs.readFileSync(String(argv.sitemap), 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => new URL(m[1]).pathname.replace(/(.)\/$/, '$1'))
  const inSm = new Set(locs), notBuilt = locs.filter(l => !built.has(l)), stubSet = new Set(stubs.map(p => p.route))
  Object.assign(n, { sitemap_urls: locs.length, sitemap_distinct: inSm.size, sitemap_built_pages: locs.filter(l => built.has(l)).length, sitemap_redirect_stubs: locs.filter(l => stubSet.has(l)).length, sitemap_not_built: notBuilt.length, sitemap_not_built_examples: notBuilt.slice(0, 12), built_real_pages_not_in_sitemap: real.filter(p => !inSm.has(p.route)).length, built_not_in_sitemap_examples: real.filter(p => !inSm.has(p.route)).slice(0, 12).map(p => p.route) })
  writeCsv(path.join(OUT, 'a6_sitemap_vs_built.csv'), ['path', 'in_sitemap', 'built', 'redirect_stub'], [...new Set([...locs, ...pages.map(p => p.route)])].sort().map(r => ({ path: r, in_sitemap: inSm.has(r) ? 1 : 0, built: built.has(r) ? 1 : 0, redirect_stub: stubSet.has(r) ? 1 : 0 })))
}
fs.writeFileSync(path.join(OUT, `a6_static_numbers_${TAG}.json`), JSON.stringify(n, null, 2) + '\n')
console.log(JSON.stringify(n, null, 2))
