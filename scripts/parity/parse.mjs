#!/usr/bin/env node
// Parity analysis, stage 1: turn the saved legacy snapshot into the inventory CSVs (agent/parity.md, stage 1).
//
//   node scripts/parity/parse.mjs --date 261005
//
// Reads ONLY raw/legacy-site/<date>/ (fetch-log.csv, pages/, files.json, sitemap.xml); it never touches the network.
// Writes agent/parity/: legacy-inventory.csv, legacy-files.csv, legacy-page-type-rules.csv, legacy-nav.txt,
// legacy-redirects.csv, legacy-broken-links.csv, stage1-numbers.json. Re-running on the same snapshot gives the same files.
//
// Definitions (the columns are those of agent/parity.md, plus type_rule, section_rule and head_title at the end):
//   url                 the URL as crawled: https, www.cuahsi.org, no trailing slash, no fragment, no query
//   status              the HTTP status of the GET (200, 302, 404, ...); LOST or ERR if the request never completed
//   redirect_target     the Location header, for 3xx rows
//   title, h1           h1 is the first <h1> as the page has it; title is the item's own title: the h1, or, when the h1 is only a
//                       back-link ("←News"), the first non-empty heading below it; head_title is the <head> <title> with the site's
//                       " | Cuahsi.org" suffix removed (on item pages it is only the section name)
//   section             the top-level navigation area (About, Students, Faculty, Community, Data Services & Software,
//                       Donate), by the longest navigation path that is a prefix of the URL; else the majority section of
//                       the pages that link to it ("via links"); else "none"
//   page_type           see the rules, in order, in legacy-page-type-rules.csv (with how many URLs each caught)
//   date                a date found on the page for dated types, ISO (YYYY-MM-DD); blank if none found
//   word_count          words in <main>, minus scripts, styles, SVGs and the subscribe section
//   heading_count       h1 to h6 inside <main>
//   internal_links_in   how many distinct crawled pages link to this URL from inside <main> (the site-wide navigation and
//                       footer are not counted: they are in_nav)
//   internal_links_out  distinct internal page URLs linked from inside <main>
//   files_linked        distinct file links (PDFs, documents, images by link, uploads) inside <main>
//   has_form            a <form> inside <main> other than the site-wide subscribe form and the site search form (the
//                       category filters on listing pages count)
//   has_embed           an iframe, embed, object, video, audio or a YouTube/Vimeo link element inside <main>
//   has_contact_details true if <main> has a mailto: or tel: link or an email address or phone number in its text
//                       (a yes or no only; the details themselves are never recorded: P8)
//   in_nav              true if the URL is linked from the main navigation or the footer
//   found_via           sitemap, nav, footer, link (only from page content), redirect: joined with +
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const DATE = argv.date || '261005'
const SNAP = path.join('raw', 'legacy-site', DATE)
const OUT = path.join('agent', 'parity')
const ORIGIN = 'https://www.cuahsi.org'
const HOST = new URL(ORIGIN).host
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|gz|csv|txt|rtf|odt|ods|odp|kml|kmz|shp|mp3|mp4|mov|png|jpe?g|gif|svg|tiff?)$/i
fs.mkdirSync(OUT, { recursive: true })

const EMAIL_G = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g   // P8: an email address never appears in an output
const csvCell = v => { const s = String(v ?? '').replace(/[\r\n]+/g, ' ').replace(EMAIL_G, '<email>'); return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const parseCsvLine = line => { const out = []; let cur = '', q = false; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ } else if (ch === '"') q = false; else cur += ch } else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = '' } else cur += ch } return [...out, cur] }
const writeCsv = (file, header, rows) => fs.writeFileSync(path.join(OUT, file), header.join(',') + '\n' + rows.map(r => header.map(h => csvCell(r[h])).join(',')).join('\n') + '\n')

// canonical form, as the crawler used it (the pager query is kept only under the four listing roots)
const LISTING_ROOTS = ['/events', '/community/news', '/cyberseminars', '/job-board']
const canon = (href, base) => {
  let u; try { u = new URL(href, base) } catch { return null }
  if (!/^https?:$/.test(u.protocol)) return null
  if (u.host !== HOST) return { external: true, host: u.host }
  const p = u.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  const onListing = LISTING_ROOTS.some(r => p === r || p.startsWith(r + '/'))
  const q = onListing && /^\d+$/.test(u.searchParams.get('page') || '') ? '?page=' + Number(u.searchParams.get('page')) : ''
  return { url: ORIGIN + (p === '/' ? '' : p) + q, path: p, file: FILE_EXT.test(p) || p.startsWith('/uploads/') }
}

// ---- the snapshot ------------------------------------------------------------------------------------------------
const logRows = fs.readFileSync(path.join(SNAP, 'fetch-log.csv'), 'utf8').split('\n').slice(1).filter(Boolean).map(parseCsvLine)
const gets = new Map(), heads = new Map()
for (const f of logRows) {
  const [seq, time, method, url, status, location, ctype, bytes, seconds, saved, note] = f
  if (method === 'GET') gets.set(url, { seq, status, location, ctype, bytes, saved, note })
  if (method === 'HEAD') heads.set(url, { status, ctype, bytes, note })
}
const filesJson = fs.existsSync(path.join(SNAP, 'files.json')) ? JSON.parse(fs.readFileSync(path.join(SNAP, 'files.json'), 'utf8')) : {}
const sitemap = new Set()
if (fs.existsSync(path.join(SNAP, 'sitemap.xml'))) for (const m of fs.readFileSync(path.join(SNAP, 'sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) { const c = canon(m[1], ORIGIN); if (c && c.url) sitemap.add(c.url) }

// ---- parse every saved page ---------------------------------------------------------------------------------------
const info = new Map()          // url -> parsed facts
const inbound = new Map()       // url -> Set of source page urls (links inside <main>)
const linkedAnywhere = new Set() // every internal page URL linked from anywhere on any crawled page, navigation and footer included
const navLinks = new Map(), footerLinks = new Map()    // canonical url -> link text
let navTree = []
const PHONE = /(\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December'
const MONTH_NUM = Object.fromEntries(MONTHS.split('|').flatMap((m, i) => [[m.toLowerCase(), String(i + 1).padStart(2, '0')], [m.slice(0, 3).toLowerCase(), String(i + 1).padStart(2, '0')], ['sept', '09']]))
const MONTH_RE = '(?:' + MONTHS + '|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\\.?'
const isoFrom = (m, d, y) => `${y}-${MONTH_NUM[m.replace('.', '').toLowerCase()]}-${String(d).padStart(2, '0')}`
function findDate($, $main) {
  const metas = ['article:published_time', 'og:published_time', 'datePublished'].map(n => $(`meta[property="${n}"], meta[name="${n}"]`).attr('content')).filter(Boolean)
  if (metas[0] && /^\d{4}-\d{2}-\d{2}/.test(metas[0])) return metas[0].slice(0, 10)
  const t = $main.find('time[datetime]').first().attr('datetime'); if (t && /^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10)
  const text = $main.text().replace(/\s+/g, ' ')
  // "June 5, 2025", "June 21 - 25, 2025" (a range: its start) and "June 28 - July 2, 2025"
  let m = text.match(new RegExp('\\b(' + MONTH_RE + ')\\s+(\\d{1,2})(?:\\s*[-–]\\s*(?:' + MONTH_RE + '\\s+)?\\d{1,2})?,?\\s+(\\d{4})\\b'))
  if (m) return isoFrom(m[1], m[2], m[3])
  m = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/); if (m) return `${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`
  return ''
}
for (const [url, g] of gets) {
  if (!(g.status === '200' && g.saved && fs.existsSync(g.saved))) continue
  const $ = cheerio.load(fs.readFileSync(g.saved, 'utf8'))
  $('a[href]').each((_, el) => { const c = canon($(el).attr('href'), url); if (c && !c.external && !c.file && c.url !== url) linkedAnywhere.add(c.url) })
  const $main = $('main').first().length ? $('main').first() : $('body')
  const hiddenContact = /enkoder|email hidden/i.test($main.html() || '')            // emails the site hides behind a script: still contact details
  $main.find('script, style, noscript, svg').remove()
  const sub = $main.find('section.section-subscribe, .section-subscribe').length ? $main.find('section.section-subscribe, .section-subscribe') : null
  const subscribeText = sub ? sub.text() : ''
  sub?.remove()
  const text = $main.text().replace(/\s+/g, ' ').trim()
  const base = (() => { const b = $('base[href]').attr('href'); try { return b ? new URL(b, url).href : url } catch { return url } })()
  const out = new Set(), files = new Set(), outAll = []
  $main.find('a[href]').each((_, el) => {
    const c = canon($(el).attr('href'), base); if (!c || c.external) return
    if (c.file) files.add(c.url); else { out.add(c.url); outAll.push(c.url) }
  })
  for (const u of out) { if (u === url) continue; if (!inbound.has(u)) inbound.set(u, new Set()); inbound.get(u).add(url) }
  const embeds = $main.find('iframe, embed, object, video, audio, lite-youtube, [data-youtube], a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]').length
  const mail = $main.find('a[href^="mailto:"], a[href^="tel:"]').length > 0
  const headTitle = ($('head > title').first().text() || $('title').first().text()).replace(/\s+/g, ' ').replace(/\s*\|\s*Cuahsi\.org\s*$/i, '').trim()
  const h1 = ($main.find('h1').first().text() || $('h1').first().text()).replace(/\s+/g, ' ').trim()
  // on item pages the <h1> is only a back-link ("←News") and <title> only the section name: the item's own title is the
  // first non-empty heading below it (h2 to h6)
  let title = h1
  if (/^[←‹<]/.test(h1) || !h1) { title = ''; $main.find('h2,h3,h4,h5,h6').each((_, e) => { const t = $(e).text().replace(/\s+/g, ' ').trim(); if (t && !title) title = t }); if (!title) title = headTitle }
  // a heading that is only the site's script-hidden email block means the name itself is not in the fetched HTML (P7); the
  // script is not decoded because it also holds email addresses (P8)
  if (/email hidden; JavaScript is required/i.test(title)) title = '(hidden by script)'
  info.set(url, {
    title, head_title: headTitle, h1,
    word_count: text ? text.split(' ').length : 0,
    heading_count: $main.find('h1,h2,h3,h4,h5,h6').length,
    out: [...out].filter(u => u !== url), files: [...files],
    has_form: $main.find('form').filter((_, f) => !/\/search\/results/.test($(f).attr('action') || '')).length > 0,
    has_embed: embeds > 0,
    has_contact_details: mail || hiddenContact || EMAIL.test(text) || PHONE.test(text),
    date: findDate($, $main), body: text.slice(0, 600), subscribeText: subscribeText.length
  })
  if (url === ORIGIN) {                                          // the navigation and the footer, from the home page
    const $$ = cheerio.load(fs.readFileSync(g.saved, 'utf8'))
    $$('nav.navbar ul.navbar-nav > li').each((_, li) => {
      const a = $$(li).children('a').first(); const c = canon(a.attr('href'), ORIGIN)
      const node = { label: a.text().replace(/\s+/g, ' ').trim(), url: c?.url, children: [] }
      $$(li).find('ul a, .dropdown-menu a').each((__, b) => { const cc = canon($$(b).attr('href'), ORIGIN); node.children.push({ label: $$(b).text().replace(/\s+/g, ' ').trim(), url: cc?.url }) })
      navTree.push(node)
    })
    $$('nav.navbar a[href]').each((_, a) => { const c = canon($$(a).attr('href'), ORIGIN); if (c?.url) navLinks.set(c.url, $$(a).text().replace(/\s+/g, ' ').trim()) })
    $$('footer a[href]').each((_, a) => { const c = canon($$(a).attr('href'), ORIGIN); if (c?.url) footerLinks.set(c.url, $$(a).text().replace(/\s+/g, ' ').trim()) })
  }
}

// ---- sections: by navigation path prefix, else by who links to the page ----------------------------------------------
const sectionOf = new Map()      // nav path -> section label
const pathOf = u => new URL(u).pathname.replace(/\/+$/, '') || '/'
const topLabels = []
for (const top of navTree) {
  const label = top.label.replace(/\s+/g, ' ').trim()
  const display = label.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace('Data Services & Software', 'Data Services & Software')
  topLabels.push(display)
  for (const n of [top, ...top.children]) if (n.url) sectionOf.set(pathOf(n.url), display)
}
const sectionByPrefix = u => {
  const p = pathOf(u); let best = '', label = ''
  for (const [np, l] of sectionOf) if ((p === np || p.startsWith(np + '/')) && np.length > best.length && np !== '/') { best = np; label = l }
  if (!label) { const seg = '/' + p.split('/')[1]; for (const [np, l] of sectionOf) if (np === seg) { label = l; break } }
  return label
}

// ---- page types: rules in order ------------------------------------------------------------------------------------
const rules = []
const rule = (id, description, test, type) => rules.push({ id, description, test, type, count: 0 })
const segs = u => pathOf(u).split('/').filter(Boolean)
rule('R01', 'path /community/news/<slug> whose slug or title mentions "newsletter"', (u, i) => segs(u)[0] === 'community' && segs(u)[1] === 'news' && segs(u).length === 3 && /newsletter/i.test(segs(u)[2] + ' ' + (i?.title || '')), 'newsletter issue')
rule('R02', 'path /community/news/<slug>', u => segs(u)[0] === 'community' && segs(u)[1] === 'news' && segs(u).length === 3, 'news post')
rule('R03', 'path /events/<slug>', u => segs(u)[0] === 'events' && segs(u).length === 2, 'event')
rule('R04', 'path /cyberseminars/series/<slug>', u => segs(u)[0] === 'cyberseminars' && segs(u)[1] === 'series' && segs(u).length === 3, 'cyberseminar series')
rule('R05', 'path /cyberseminars/<slug> (not series, not all-upcoming)', u => segs(u)[0] === 'cyberseminars' && segs(u).length === 2 && !['series', 'all-upcoming'].includes(segs(u)[1]), 'cyberseminar')
rule('R06', 'path /job-board/<slug>, not a pager page /job-board/pN', u => segs(u)[0] === 'job-board' && segs(u).length === 2 && !/^p\d+$/.test(segs(u)[1]), 'job')
rule('R07', 'path /about/our-team/<slug>', u => segs(u)[0] === 'about' && segs(u)[1] === 'our-team' && segs(u).length === 3, 'person')
rule('R08', 'path /faculty/guest-lecturer-database/<slug>', u => segs(u)[0] === 'faculty' && segs(u)[1] === 'guest-lecturer-database' && segs(u).length === 3, 'person')
rule('R09', 'path /about/library/<slug>', u => segs(u)[0] === 'about' && segs(u)[1] === 'library' && segs(u).length === 3, 'document or file')
rule('R10', 'path /students/graduate-programs-in-water-science-dev/<slug> (a stub page per university, linked from the paginated lists)', u => segs(u)[0] === 'students' && segs(u)[1] === 'graduate-programs-in-water-science-dev' && segs(u).length === 3, 'graduate program')
rule('R11', 'path /community/water-data-portals/<slug>', u => segs(u)[0] === 'community' && segs(u)[1] === 'water-data-portals' && segs(u).length === 3, 'data portal entry')
rule('R12', 'path /workshops/<slug>, not the past-workshops pager', u => segs(u)[0] === 'workshops' && segs(u).length === 2 && segs(u)[1] !== 'past-workshops' && !/^p\d+$/.test(segs(u)[1]), 'workshop')
rule('R13', 'a listing: a collection root (/events, /community/news, /cyberseminars, /cyberseminars/all-upcoming, /job-board, /about/our-team, /about/library, /faculty/guest-lecturer-database, /community/water-data-portals, /workshops, /all-programs-services), anything under /students/graduate-programs-in-water-science (the paginated lists), /workshops/past-workshops, and any /pN pager page under these', u => ['/events', '/community/news', '/cyberseminars', '/cyberseminars/all-upcoming', '/job-board', '/about/our-team', '/about/library', '/faculty/guest-lecturer-database', '/community/water-data-portals', '/workshops', '/all-programs-services', '/workshops/past-workshops'].includes(pathOf(u)) || pathOf(u) === '/students/graduate-programs-in-water-science' || pathOf(u).startsWith('/students/graduate-programs-in-water-science/') || pathOf(u).startsWith('/workshops/past-workshops/') || (/\/p\d+$/.test(pathOf(u)) && LISTING_ROOTS.some(r => pathOf(u).startsWith(r + '/'))), 'listing')
rule('R14', 'the home page and the top-level navigation pages (/about, /students, /faculty, /community, /data-services/solutions, /donate)', u => pathOf(u) === '/' || [...navTree].some(t => t.url && pathOf(t.url) === pathOf(u)), 'landing page')
rule('R15', 'a named CUAHSI program page (my judgment): /summer-institute, /virtual-university, /cyberwater, /next-generation-modeling-ci, /grant-opportunities (with its fellowship pages)', u => ['/summer-institute', '/virtual-university', '/cyberwater', '/next-generation-modeling-ci'].includes(pathOf(u)) || pathOf(u) === '/grant-opportunities' || pathOf(u).startsWith('/grant-opportunities/'), 'program')
rule('R16', 'any other page with content (an <h1> or a title)', (u, i) => !!i && !!(i.h1 || i.title), 'static page')
rule('R17', 'nothing else matched: no page content (a redirect, an error, a page without a title)', () => true, 'other')

// ---- assemble the inventory ------------------------------------------------------------------------------------------
const allUrls = new Set([...sitemap, ...gets.keys()])
const isFooterNav = u => footerLinks.has(u) || navLinks.has(u)
const rows = []
for (const url of [...allUrls].sort()) {
  const g = gets.get(url) || {}, i = info.get(url)
  const found = []
  if (sitemap.has(url)) found.push('sitemap')
  if (navLinks.has(url)) found.push('nav')
  if (footerLinks.has(url)) found.push('footer')
  if (!found.length && g.note === 'redirect') found.push('redirect')
  if (!found.length && (inbound.get(url)?.size || 0) > 0) found.push('link')
  if (!found.length) found.push(g.note ? g.note : 'link')
  let section = sectionByPrefix(url), section_rule = section ? 'nav prefix' : ''
  if (!section) {
    const votes = {}; for (const s of inbound.get(url) || []) { const l = sectionByPrefix(s); if (l) votes[l] = (votes[l] || 0) + 1 }
    const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]
    if (best) { section = best[0]; section_rule = 'via links' }
  }
  let page_type = '', type_rule = ''
  for (const r of rules) { if (r.test(url, i)) { page_type = r.type; type_rule = r.id; r.count++; break } }
  const dated = ['news post', 'newsletter issue', 'event', 'job', 'cyberseminar', 'document or file', 'workshop'].includes(page_type)
  rows.push({
    url, status: g.status || '', redirect_target: /^3/.test(g.status || '') ? g.location : '', title: i?.title || '', h1: i?.h1 || '', head_title: i?.head_title || '',
    section: section || 'none', page_type, date: dated ? (i?.date || '') : '', word_count: i ? i.word_count : '', heading_count: i ? i.heading_count : '',
    internal_links_in: inbound.get(url)?.size || 0, internal_links_out: i ? i.out.length : '', files_linked: i ? i.files.length : '',
    has_form: i ? i.has_form : '', has_embed: i ? i.has_embed : '', has_contact_details: i ? i.has_contact_details : '',
    in_nav: isFooterNav(url), found_via: found.join('+'), type_rule, section_rule
  })
}
const HEADER = ['url', 'status', 'redirect_target', 'title', 'h1', 'section', 'page_type', 'date', 'word_count', 'heading_count', 'internal_links_in', 'internal_links_out', 'files_linked', 'has_form', 'has_embed', 'has_contact_details', 'in_nav', 'found_via', 'type_rule', 'section_rule', 'head_title']
writeCsv('legacy-inventory.csv', HEADER, rows)

// ---- files, redirects, broken links, rules, nav -----------------------------------------------------------------------
const fileRows = Object.entries(filesJson).map(([url, v]) => {
  const h = heads.get(url) || {}
  const ext = (url.match(/\.([a-z0-9]{2,4})(?:$|\?)/i) || [, ''])[1].toLowerCase()
  return { url, type: h.ctype || ext, ext, size_bytes: h.bytes || '', head_status: h.status || '', pages_linking: v.pages.length, linked_from: v.pages.slice(0, 5).join(' ') + (v.pages.length > 5 ? ' ...' : '') }
}).sort((a, b) => a.url.localeCompare(b.url))
writeCsv('legacy-files.csv', ['url', 'type', 'ext', 'size_bytes', 'head_status', 'pages_linking', 'linked_from'], fileRows)
const redirects = rows.filter(r => /^3/.test(r.status)).map(r => ({ url: r.url, status: r.status, redirect_target: r.redirect_target, target_status: gets.get(canon(r.redirect_target, ORIGIN)?.url)?.status || 'not fetched', linked_from_pages: inbound.get(r.url)?.size || 0 }))
writeCsv('legacy-redirects.csv', ['url', 'status', 'redirect_target', 'target_status', 'linked_from_pages'], redirects)
const brokenLinks = []
for (const [u, g] of gets) if (/^(4|5)/.test(g.status)) for (const s of inbound.get(u) || []) brokenLinks.push({ broken_url: u, status: g.status, linked_from: s, kind: new RegExp(EMAIL_G.source).test(u) ? 'an email address written as a link without mailto: (a relative URL)' : 'broken link' })
writeCsv('legacy-broken-links.csv', ['broken_url', 'status', 'kind', 'linked_from'], brokenLinks)
writeCsv('legacy-page-type-rules.csv', ['rule', 'page_type', 'urls_caught', 'description'], rules.map(r => ({ rule: r.id, page_type: r.type, urls_caught: r.count, description: r.description })))
const navText = navTree.map(t => `${t.label} (${t.url || ''})\n` + t.children.map(c => `    ${c.label} (${c.url || ''})`).join('\n')).join('\n') + '\n\nFooter:\n' + [...footerLinks].map(([u, l]) => `    ${l || '(icon)'} (${u})`).join('\n') + '\n'
fs.writeFileSync(path.join(OUT, 'legacy-nav.txt'), navText)

// ---- numbers for the report --------------------------------------------------------------------------------------------
const count = (arr, f) => arr.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m }, {})
const dateRange = {}
for (const r of rows) if (r.date) { const d = dateRange[r.page_type] ||= { n: 0, min: r.date, max: r.date }; d.n++; if (r.date < d.min) d.min = r.date; if (r.date > d.max) d.max = r.date }
const sitemapOnly = rows.filter(r => r.found_via === 'sitemap'), notInSitemap = rows.filter(r => !r.found_via.split('+').includes('sitemap'))
fs.writeFileSync(path.join(OUT, 'stage1-numbers.json'), JSON.stringify({
  snapshot: DATE, urls: rows.length, requestsLogged: logRows.length, getRows: gets.size, headRows: heads.size, sitemapUrls: sitemap.size,
  byStatus: count(rows, r => r.status || '(not fetched)'), bySection: count(rows, r => r.section), byType: count(rows, r => r.page_type || '(none)'),
  bySectionRule: count(rows, r => r.section_rule || '(none)'), byFoundVia: count(rows, r => r.found_via), dateRange,
  withContent: rows.filter(r => r.word_count !== '').length, sitemapOnlyCount: sitemapOnly.length, notInSitemapCount: notInSitemap.length,
  sitemapNotLinked: [...sitemap].filter(u => !linkedAnywhere.has(u) && u !== ORIGIN).length,
  sitemapNotLinkedByType: count(rows.filter(r => sitemap.has(r.url) && !linkedAnywhere.has(r.url) && r.url !== ORIGIN), r => r.page_type),
  linkedNotInSitemapByType: count(rows.filter(r => !sitemap.has(r.url)), r => r.page_type),
  brokenEmailLinks: brokenLinks.filter(b => b.kind.startsWith('an email')).length, linkedNotInSitemap: [...linkedAnywhere].filter(u => !sitemap.has(u)).length, linkedAnywhere: linkedAnywhere.size,
  files: fileRows.length, filesSized: fileRows.filter(f => f.size_bytes).length, redirects: redirects.length, brokenLinkRows: brokenLinks.length,
  navTopLevel: navTree.length, navLinks: navLinks.size, footerLinks: footerLinks.size,
  titleHiddenByScript: rows.filter(r => r.title === '(hidden by script)').length,
  hasForm: rows.filter(r => r.has_form === true).length, hasEmbed: rows.filter(r => r.has_embed === true).length, hasContact: rows.filter(r => r.has_contact_details === true).length, inNav: rows.filter(r => r.in_nav).length,
  unassignedSection: rows.filter(r => r.section === 'none').length, ruleCounts: rules.map(r => [r.id, r.type, r.count])
}, null, 1))
console.log('wrote', rows.length, 'rows to', OUT)
