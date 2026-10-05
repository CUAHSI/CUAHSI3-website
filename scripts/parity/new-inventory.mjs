#!/usr/bin/env node
// Parity analysis, stage 2: inventory of THIS site's routes (agent/parity.md, stage 2).
//
//   npm run build:search          (a fresh build first)
//   node scripts/parity/new-inventory.mjs
//
// Reads ONLY the built site (.output/public) and the repository (pages/, content/); it makes no request to any site.
// Writes agent/parity/: new-inventory.csv (one row per route), new-unpublished.csv (content items with published: false,
// with the reason), new-content-without-route.csv (published items of the collections that have item pages, but no page), new-page-type-rules.csv, new-nav.txt, stage2-numbers.json. Re-running on the same build and the same
// repository gives the same files.
//
// The columns are those of legacy-inventory.csv (see the header of parse.mjs for each definition), with these differences
// for this site:
//   status            always 200 for a generated route (this is a static site); a "redirect stub" is a 200 page whose HTML carries
//                     a meta refresh, and its target is in redirect_target
//   section           the top-level navigation item (About, Data & Computing, Learn & Train, Community, Hire CUAHSI) by path
//                     prefix; Support, Contact and Member Portal are the header's utility links; else "none"
//   found_via         nav, footer, link (only from page content), redirect (the target of a redirect stub), none (no page links
//                     to it); there is no "sitemap": the built sitemap.xml lists no URLs
//   source            the page component, and for an item page the content file behind it, joined with " + " (a team profile with
//                     no .md file takes its data from content/team/full-team.json)
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { parse as parseYaml } from 'yaml'

const BUILD = path.join('.output', 'public')
const OUT = path.join('agent', 'parity')
const SITE = 'https://site.invalid'                       // a placeholder origin to resolve relative links; never requested
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|gz|csv|txt|rtf|odt|ods|odp|kml|kmz|shp|mp3|mp4|mov|png|jpe?g|gif|svg|tiff?)$/i
fs.mkdirSync(OUT, { recursive: true })

const EMAIL_G = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const emailIds = new Map()
const maskEmail = a => { const k = a.toLowerCase(); if (!emailIds.has(k)) emailIds.set(k, emailIds.size + 1); return '<email-' + emailIds.get(k) + '>' }
const csvCell = v => { const s = String(v ?? '').replace(/[\r\n]+/g, ' ').replace(EMAIL_G, maskEmail); return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const writeCsv = (file, header, rows) => fs.writeFileSync(path.join(OUT, file), header.join(',') + '\n' + rows.map(r => header.map(h => csvCell(r[h])).join(',')).join('\n') + '\n')
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const PHONE = /(\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December'
const MONTH_RE = '(?:' + MONTHS + '|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\\.?'
const MONTH_NUM = Object.fromEntries(MONTHS.split('|').flatMap((m, i) => [[m.toLowerCase(), String(i + 1).padStart(2, '0')], [m.slice(0, 3).toLowerCase(), String(i + 1).padStart(2, '0')], ['sept', '09']]))
const isoFrom = (m, d, y) => `${y}-${MONTH_NUM[m.replace('.', '').toLowerCase()]}-${String(d).padStart(2, '0')}`
function findDate($, $main, route) {
  if (route.startsWith('/community/newsletter/') && route.split('/').length === 4) return ''   // an issue page shows no date of its own (the first date in its body is event text)
  const t = $main.find('time[datetime]').first().attr('datetime'); if (t && /^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10)
  const text = $main.text().replace(/\s+/g, ' ')
  let m = text.match(new RegExp('\\bPosted\\s+(' + MONTH_RE + ')\\s+(\\d{1,2}),?\\s+(\\d{4})\\b'))
  if (m) return isoFrom(m[1], m[2], m[3])
  m = text.match(new RegExp('\\b(' + MONTH_RE + ')\\s+(\\d{1,2})(?:\\s*[-–]\\s*(?:' + MONTH_RE + '\\s+)?\\d{1,2})?,?\\s+(\\d{4})\\b'))
  if (m) return isoFrom(m[1], m[2], m[3])
  m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/); if (m) return m[0]
  return ''
}

// ---- the built routes -----------------------------------------------------------------------------------------------
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const htmlFiles = walk(BUILD).filter(f => f.endsWith('.html'))
const routeOf = f => { const r = '/' + path.relative(BUILD, f).replace(/\\/g, '/'); return r === '/index.html' ? '/' : r.replace(/\/index\.html$/, '') }
const routeFiles = htmlFiles.filter(f => f.endsWith('index.html')).map(f => ({ route: routeOf(f), file: f })).sort((a, b) => a.route.localeCompare(b.route))
const notRoutes = htmlFiles.filter(f => !f.endsWith('index.html')).map(f => '/' + path.relative(BUILD, f))
const canon = (href, base) => {
  let u; try { u = new URL(href, base) } catch { return null }
  if (u.origin !== SITE) return { external: true }
  const p = u.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  return { route: p, file: FILE_EXT.test(p) }
}

// ---- content items and their slugs (for "source") ---------------------------------------------------------------------
const frontMatter = f => { const s = fs.readFileSync(f, 'utf8'); if (!s.startsWith('---')) return null; const e = s.indexOf('\n---', 3); if (e < 0) return null; try { return parseYaml(s.slice(3, e)) } catch { return null } }
const collections = {}
for (const dir of fs.readdirSync('content', { withFileTypes: true }).filter(d => d.isDirectory())) {
  collections[dir.name] = fs.readdirSync(path.join('content', dir.name)).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => {
    const file = `content/${dir.name}/${f}`; const fm = frontMatter(file)
    return { file, fm, slug: fm?.slug, published: fm?.published }
  })
}
const itemSource = (collection, slug) => collections[collection]?.find(i => i.slug === slug)?.file

// ---- the pages dir: the component behind a route ----------------------------------------------------------------------
const pageFiles = walk('pages').filter(f => f.endsWith('.vue')).map(f => f.replace(/\\/g, '/'))
const componentOf = route => {
  const segs = route === '/' ? [] : route.slice(1).split('/')
  const exact = pageFiles.find(f => f === ['pages', ...segs, 'index.vue'].join('/') || (segs.length && f === ['pages', ...segs].join('/') + '.vue') || (!segs.length && f === 'pages/index.vue'))
  if (exact) return { component: exact, dynamic: false }
  const dyn = segs.length ? pageFiles.find(f => f === ['pages', ...segs.slice(0, -1), '[slug].vue'].join('/')) : null
  return dyn ? { component: dyn, dynamic: true } : { component: '', dynamic: false }
}
const ITEM_COLLECTIONS = { '/community/events': 'events', '/community/news': 'news', '/community/newsletter': 'newsletter', '/about/impact': 'research', '/about/team': 'team', '/learn-train/programs': 'programs' }

// ---- parse every route ------------------------------------------------------------------------------------------------
const info = new Map(), inbound = new Map(), navLinks = new Map(), footerLinks = new Map(), linkedAnywhere = new Set()
let navItems = [], utilityItems = []
for (const { route, file } of routeFiles) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'))
  const refresh = ($('meta[http-equiv=refresh]').attr('content') || '').match(/url=(.+)$/i)
  const $main = $('main').first().length ? $('main').first() : $('body')
  const hasMain = $('main').first().length > 0
  $('a[href]').each((_, el) => { const c = canon($(el).attr('href'), SITE + route); if (c && !c.external && !c.file && c.route !== route) linkedAnywhere.add(c.route) })
  $main.find('script, style, noscript, svg').remove()
  // this site's rendered HTML has no whitespace between elements ("DateTuesday, December 1, 2026Location"): add a space after the
  // block and chip elements so words and dates can be read (inline emphasis is left alone)
  $main.find('p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,span,a,time,section,article,td,th,tr,br,button,label,dt,dd,figure,figcaption,header,footer,nav,aside').after(' ')
  const text = $main.text().replace(/\s+/g, ' ').trim()
  const out = new Set(), files = new Set()
  $main.find('a[href]').each((_, el) => { const c = canon($(el).attr('href'), SITE + route); if (!c || c.external) return; if (c.file) files.add(c.route); else out.add(c.route) })
  for (const u of out) if (u !== route) { if (!inbound.has(u)) inbound.set(u, new Set()); inbound.get(u).add(route) }
  const headTitle = $('head > title').first().text().replace(/\s+/g, ' ').replace(/\s*[·|]\s*CUAHSI\s*$/i, '').trim()
  const h1 = $main.find('h1').first().text().replace(/\s+/g, ' ').trim()
  info.set(route, {
    file, hasMain, redirect: refresh ? refresh[1].trim() : '', title: h1 || headTitle, head_title: headTitle, h1, word_count: text ? text.split(' ').length : 0,
    heading_count: $main.find('h1,h2,h3,h4,h5,h6').length, out: [...out].filter(u => u !== route), files: [...files],
    has_form: $main.find('form').length > 0,
    has_embed: $main.find('iframe, embed, object, video, audio, a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]').length > 0,
    has_contact_details: $main.find('a[href^="mailto:"], a[href^="tel:"]').length > 0 || EMAIL.test(text) || PHONE.test(text),
    date: findDate($, $main, route)
  })
  if (route === '/') {                                                    // the header navigation, the utility links and the footer
    $('header a[href]').each((_, a) => { const c = canon($(a).attr('href'), SITE + '/'); const label = $(a).text().replace(/\s+/g, ' ').trim(); if (c && !c.external) { navLinks.set(c.route, label || navLinks.get(c.route) || ''); } })
    $('footer a[href]').each((_, a) => { const c = canon($(a).attr('href'), SITE + '/'); if (c && !c.external) footerLinks.set(c.route, $(a).text().replace(/\s+/g, ' ').trim()) })
    navItems = $('header nav a[href]').map((_, a) => ({ label: $(a).text().replace(/\s+/g, ' ').trim(), route: canon($(a).attr('href'), SITE + '/')?.route })).get().filter((x, i, arr) => x.label && arr.findIndex(y => y.route === x.route) === i)
  }
}
const navRoutes = new Set(navItems.map(n => n.route))
utilityItems = [...navLinks].filter(([r]) => !navRoutes.has(r) && r !== '/').map(([r, l]) => ({ route: r, label: l }))
const SECTION_OF = new Map([['/about', 'About'], ['/data-platforms', 'Data & Computing'], ['/learn-train', 'Learn & Train'], ['/community', 'Community'], ['/hire-cuahsi', 'Hire CUAHSI']])
const sectionOf = route => {
  for (const [p, label] of SECTION_OF) if (route === p || route.startsWith(p + '/')) return [label, 'nav prefix']
  if (utilityItems.some(u => u.route === route)) return ['Utility links (header)', 'utility link']
  return ['none', '']
}

// ---- page types -------------------------------------------------------------------------------------------------------
const rules = []
const rule = (id, description, test, type) => rules.push({ id, description, test, type, count: 0 })
const segs = r => r.split('/').filter(Boolean)
rule('N01', 'the HTML carries a meta refresh (a redirect stub: status 200, redirect_target is the refresh target)', (r, i) => !!i.redirect, 'redirect stub')
rule('N02', 'path /community/events/<slug>', r => r.startsWith('/community/events/') && segs(r).length === 3, 'event')
rule('N03', 'path /community/news/<slug>', r => r.startsWith('/community/news/') && segs(r).length === 3, 'news post')
rule('N04', 'path /community/newsletter/<slug>', r => r.startsWith('/community/newsletter/') && segs(r).length === 3, 'newsletter issue')
rule('N05', 'path /about/impact/<slug> (the content/research collection)', r => r.startsWith('/about/impact/') && segs(r).length === 3, 'impact story')
rule('N06', 'path /about/team/<slug>', r => r.startsWith('/about/team/') && segs(r).length === 3, 'person')
rule('N07', 'path /learn-train/programs/<slug>', r => r.startsWith('/learn-train/programs/') && segs(r).length === 3, 'program')
rule('N08', 'a listing: /community/events, /community/news, /community/newsletter, /community/jobs (all jobs on one page), /about/impact, /about/team, /learn-train/cyberseminars (all seminars on one page), /learn-train/archive, /community/campus-visits', r => ['/community/events', '/community/news', '/community/newsletter', '/community/jobs', '/about/impact', '/about/team', '/learn-train/cyberseminars', '/learn-train/archive', '/community/campus-visits'].includes(r), 'listing')
rule('N09', 'the home page and the top-level navigation pages', r => r === '/' || SECTION_OF.has(r), 'landing page')
rule('N10', 'any other route', () => true, 'static page')

// ---- assemble ---------------------------------------------------------------------------------------------------------
const rows = []
for (const { route } of routeFiles) {
  const i = info.get(route)
  const found = []
  if (navLinks.has(route)) found.push('nav')
  if (footerLinks.has(route)) found.push('footer')
  if ([...info.values()].some(x => x.redirect && x.redirect.replace(/\/+$/, '') === route)) found.push('redirect')
  if (!found.length && (inbound.get(route)?.size || 0) > 0) found.push('link')
  if (!found.length && linkedAnywhere.has(route)) found.push('link (outside page content)')
  if (!found.length) found.push('none')
  const [section, section_rule] = sectionOf(route)
  let page_type = '', type_rule = ''
  for (const r of rules) if (r.test(route, i)) { page_type = r.type; type_rule = r.id; r.count++; break }
  const comp = componentOf(route)
  const base = '/' + segs(route).slice(0, 2).join('/')
  let item = comp.dynamic && ITEM_COLLECTIONS[base] ? itemSource(ITEM_COLLECTIONS[base], segs(route).at(-1)) : ''
  if (comp.dynamic && base === '/about/team' && !item) item = 'content/team/full-team.json (no .md profile)'
  const dated = ['event', 'news post', 'newsletter issue', 'impact story'].includes(page_type)
  rows.push({
    url: route, status: 200, redirect_target: i.redirect, title: i.title, h1: i.h1, section, page_type, date: dated ? i.date : '', word_count: i.word_count,
    heading_count: i.heading_count, internal_links_in: inbound.get(route)?.size || 0, internal_links_out: i.out.length, files_linked: i.files.length,
    has_form: i.has_form, has_embed: i.has_embed, has_contact_details: i.has_contact_details,
    in_nav: navLinks.has(route) || footerLinks.has(route), found_via: found.join('+'), source: [comp.component, item].filter(Boolean).join(' + '),
    type_rule, section_rule, head_title: i.head_title
  })
}
const HEADER = ['url', 'status', 'redirect_target', 'title', 'h1', 'section', 'page_type', 'date', 'word_count', 'heading_count', 'internal_links_in', 'internal_links_out', 'files_linked', 'has_form', 'has_embed', 'has_contact_details', 'in_nav', 'found_via', 'source', 'type_rule', 'section_rule', 'head_title']
writeCsv('new-inventory.csv', HEADER, rows)
writeCsv('new-page-type-rules.csv', ['rule', 'page_type', 'routes_caught', 'description'], rules.map(r => ({ rule: r.id, page_type: r.type, routes_caught: r.count, description: r.description })))

// ---- content items with published: false, and why --------------------------------------------------------------------------
const ROUTE_IF_PUBLISHED = { events: '/community/events/<slug>', news: '/community/news/<slug>', newsletter: '/community/newsletter/<slug>', research: '/about/impact/<slug>', team: '/about/team/<slug>', programs: '/learn-train/programs/<slug>', cyberseminars: '(listed on /learn-train/cyberseminars; no page of its own)', jobs: '(listed on /community/jobs; no page of its own)' }
const unpublished = []
for (const [col, items] of Object.entries(collections)) for (const it of items) {
  if (it.published === false) {
    let reason = 'published: false (no reason recorded in the file)'
    if (col === 'cyberseminars' && it.fm && 'youtube_id' in it.fm) { const id = String(it.fm.youtube_id ?? ''); if (id.length === 0) reason = 'published: false; its youtube_id is empty'; else if (id.length !== 11) reason = `published: false; its youtube_id is ${id.length} characters long, not a valid 11-character YouTube id` }
    unpublished.push({ collection: col, file: it.file, slug: it.slug || '', title: it.fm?.title || '', date: String(it.fm?.date || it.fm?.start || it.fm?.posted || '').slice(0, 10), reason, route_if_published: ROUTE_IF_PUBLISHED[col] || '' })
  }
}
const teamJson = fs.existsSync('content/team/full-team.json') ? JSON.parse(fs.readFileSync('content/team/full-team.json', 'utf8')) : []
const routeSet = new Set(rows.map(r => r.url))
const unrouted = []
for (const [base, col] of Object.entries(ITEM_COLLECTIONS)) for (const it of collections[col] || []) {
  if (it.published !== true || !it.slug || routeSet.has(base + '/' + it.slug)) continue
  let why = 'no route was generated and the reason was not determined'
  if (col === 'team') { const person = (Array.isArray(teamJson) ? teamJson : []).find(x => x.slug === it.slug); why = person ? `has_profile is ${person.has_profile} in full-team.json, so the team list does not link a profile page` : 'not in full-team.json' }
  unrouted.push({ collection: col, file: it.file, slug: it.slug, title: it.fm?.title || it.fm?.name || '', reason: why })
}
writeCsv('new-content-without-route.csv', ['collection', 'file', 'slug', 'title', 'reason'], unrouted)
writeCsv('new-unpublished.csv', ['collection', 'file', 'slug', 'title', 'date', 'reason', 'route_if_published'], unpublished)

// ---- navigation text and numbers --------------------------------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'new-nav.txt'), 'Header navigation (flat: no submenus in the HTML):\n' + navItems.map(n => `    ${n.label} (${n.route})`).join('\n') + '\n\nUtility links in the header:\n' + utilityItems.map(u => `    ${u.label} (${u.route})`).join('\n') + '\n\nFooter:\n' + [...footerLinks].map(([r, l]) => `    ${l || '(icon)'} (${r})`).join('\n') + '\n')
const count = (arr, f) => arr.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m }, {})
const published = Object.fromEntries(Object.entries(collections).map(([c, items]) => [c, { files: items.length, published: items.filter(i => i.published === true).length, unpublished: items.filter(i => i.published === false).length, noFlag: items.filter(i => i.published === undefined).length, noFrontMatter: items.filter(i => !i.fm).length }]))
const itemRoutes = {}
for (const [base, col] of Object.entries(ITEM_COLLECTIONS)) itemRoutes[col] = rows.filter(r => r.url.startsWith(base + '/') && segs(r.url).length === 3).length
fs.writeFileSync(path.join(OUT, 'stage2-numbers.json'), JSON.stringify({
  routes: rows.length, htmlFilesNotRoutes: notRoutes, byType: count(rows, r => r.page_type), bySection: count(rows, r => r.section), byFoundVia: count(rows, r => r.found_via),
  sourceCount: rows.filter(r => r.source).length, withoutComponent: rows.filter(r => !r.source.startsWith('pages/')).length, withContentFile: rows.filter(r => r.source.includes('content/')).length,
  hasForm: rows.filter(r => r.has_form).length, hasEmbed: rows.filter(r => r.has_embed).length, hasContact: rows.filter(r => r.has_contact_details).length, inNav: rows.filter(r => r.in_nav).length,
  filesLinked: rows.reduce((n, r) => n + r.files_linked, 0), pagesWithoutMain: [...info.values()].filter(x => !x.hasMain).length, redirectStubs: rows.filter(r => r.redirect_target).length,
  published, itemRoutes, unroutedPublished: unrouted.length, unroutedByCollection: count(unrouted, u => u.collection), unpublishedTotal: unpublished.length, unpublishedByCollection: count(unpublished, u => u.collection), ruleCounts: rules.map(r => [r.id, r.type, r.count]),
  navItems, utilityItems, footerLinks: footerLinks.size, sitemapLocs: (fs.existsSync(path.join(BUILD, 'sitemap.xml')) ? (fs.readFileSync(path.join(BUILD, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length : null),
  words: { median: [...rows.map(r => r.word_count)].sort((a, b) => a - b)[Math.floor(rows.length / 2)], under50: rows.filter(r => r.word_count < 50).length, over1000: rows.filter(r => r.word_count > 1000).length }
}, null, 1))
console.log('wrote', rows.length, 'routes;', unpublished.length, 'unpublished items')
