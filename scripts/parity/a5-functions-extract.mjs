#!/usr/bin/env node
// Site audit, task A5 (org issue 110), step 1 of 3: what a visitor can use, read from saved HTML. Offline: makes no request, submits nothing.
//
//   node scripts/parity/a5-functions-extract.mjs --side legacy --dir ../CUAHSI3-website/raw/legacy-site/261106/pages [--out agent/audit] [--date 261106]
//   node scripts/parity/a5-functions-extract.mjs --side new    --dir .output/public                                  [--out agent/audit] [--date 261106]
//
// Reads every .html file under --dir and records, per signal, the places a visitor meets it: forms (action, method, field kinds), fields that
// take a password / an e-mail address / a file, selects, iframes, scripts by host (and the analytics ids written inline), links to the services a
// function hands over to (Mailchimp, Constant Contact, Jotform, Zoom, Cvent, Qualtrics, Google Forms, Zeffy ...), pager links, feeds, calendar
// files, share buttons, social networks, sign-in words, downloads and video. Each record says whether it sits in the page chrome
// (inside <header>, <nav> or <footer>) or in the content, so a footer link on every page is not counted as 700 uses.
// Writes agent/audit/:
//   a5-<side>-signals-<d>.csv   one row per (signal, where, target): pages, occurrences, three example pages
//   a5-<side>-numbers-<d>.json  denominators and per-signal page counts
// E-mail addresses and phone numbers are counted (mailto, tel) and never written (C11, P8). A link's query string is dropped, except that a Mailchimp
// campaign address keeps nothing: its list id is in the path or the query and is kept only as the host.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []))
const SIDE = String(argv.side || ''), DIR = String(argv.dir || ''), OUT = String(argv.out || path.join('agent', 'audit')), DATE = String(argv.date || '261106')
if (!['legacy', 'new'].includes(SIDE) || !DIR) { console.error('usage: a5-functions-extract.mjs --side legacy|new --dir <folder of saved html> [--out <folder>] [--date <d>]'); process.exit(2) }
const csvCell = v => { const s = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name.startsWith('_nuxt') || e.name === 'pagefind' ? [] : walk(path.join(d, e.name))) : e.name.endsWith('.html') ? [path.join(d, e.name)] : [])
const files = walk(DIR).sort()
const pageOf = f => '/' + path.relative(DIR, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '')

const PROVIDERS = [
  ['mailchimp', /(^|\.)(list-manage\.com|campaign-archive\.com|eepurl\.com|mailchi\.mp|mailchimp\.com)$/],
  ['constant-contact', /(^|\.)(constantcontact\.com|ctctcdn\.com|r20\.rs6\.net|myemma\.com)$/],
  ['jotform', /(^|\.)jotform\.com$/],
  ['zoom', /(^|\.)zoom\.us$/],
  ['cvent', /(^|\.)cvent\.com$/],
  ['qualtrics', /(^|\.)qualtrics\.com$/],
  ['google-forms', /^(forms\.gle|docs\.google\.com)$/],
  ['microsoft-forms', /^(forms\.office\.com|forms\.microsoft\.com|outlook\.office365\.com|teams\.microsoft\.com)$/],
  ['eventbrite', /(^|\.)eventbrite\.com$/],
  ['zeffy', /(^|\.)zeffy\.com$/],
  ['paypal-stripe', /(^|\.)(paypal\.com|stripe\.com|donorbox\.org|givebutter\.com|classy\.org)$/],
  ['hubspot-airtable', /(^|\.)(hubspot\.com|hsforms\.com|airtable\.com|typeform\.com|surveymonkey\.com)$/],
  ['calendly', /(^|\.)(calendly\.com|cal\.com)$/],
  ['google-calendar', /^calendar\.google\.com$/],
  ['youtube', /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/],
  ['vimeo', /(^|\.)vimeo\.com$/],
  ['hydroshare', /(^|\.)hydroshare\.org$/],
  ['github', /(^|\.)github\.com$/],
]
const SOCIAL = [['facebook', /facebook\.com$/], ['instagram', /instagram\.com$/], ['linkedin', /linkedin\.com$/], ['bluesky', /bsky\.app$/], ['x-twitter', /(twitter\.com|^x\.com)$/], ['youtube', /(youtube\.com|youtu\.be)$/], ['github', /github\.com$/], ['mastodon', /mastodon\./], ['threads', /threads\.net$/]]
const ANALYTICS_SCRIPT = [['google-analytics-or-tag-manager', /googletagmanager\.com|google-analytics\.com/], ['facebook-pixel', /connect\.facebook\.net/], ['hotjar-clarity', /hotjar\.com|clarity\.ms/], ['plausible-matomo-umami', /plausible\.io|matomo|umami/], ['cloudflare-insights', /cloudflareinsights\.com/], ['addthis-sharethis', /addthis\.com|sharethis\.com/], ['cookie-consent', /cookiebot|osano|onetrust|cookieconsent|termly/], ['recaptcha', /recaptcha|hcaptcha|turnstile/], ['pagefind', /pagefind/]]
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt|ics|kml|tif|tiff|png|jpe?g)(\?|#|$)/i

const rec = new Map() // key signal|where|target -> {pages:Set, n, ex:[]}
const add = (signal, where, target, page) => {
  const k = signal + '\t' + where + '\t' + target
  let r = rec.get(k); if (!r) rec.set(k, (r = { signal, where, target, pages: new Set(), n: 0 }))
  r.pages.add(page); r.n++
}
const hostOf = u => { try { return new URL(u, 'https://x.invalid').hostname.replace(/^www\./, '') } catch { return '' } }
const clean = (u, keepPath = true) => {
  try { const x = new URL(u, 'https://x.invalid'); const h = x.hostname === 'x.invalid' ? '(this site)' : x.hostname.replace(/^www\./, ''); return keepPath ? h + x.pathname.replace(/\/$/, '') : h } catch { return String(u).slice(0, 80) }
}

let withMain = 0
for (const f of files) {
  const page = pageOf(f), $ = cheerio.load(fs.readFileSync(f, 'utf8'))
  const where = el => ($(el).closest('header,nav,footer').length ? 'chrome' : 'content')
  if ($('main').length) withMain++

  $('form').each((_, el) => {
    const a = $(el), action = a.attr('action') || '(none)', method = (a.attr('method') || 'get').toLowerCase()
    const kinds = new Set(); a.find('input,textarea,select,button').each((__, i) => { const t = (i.tagName === 'input' ? ($(i).attr('type') || 'text') : i.tagName).toLowerCase(); if (t !== 'hidden') kinds.add(t) })
    const names = []; a.find('input,textarea,select').each((__, i) => { const n = ($(i).attr('name') || $(i).attr('id') || '').toLowerCase(); if (n) names.push(n) })
    const isSearch = /search/i.test(action + ' ' + (a.attr('role') || '') + ' ' + (a.attr('class') || '') + ' ' + (a.attr('id') || '')) || names.some(n => /^(q|s|query|search|keys|keywords?)$/.test(n))
    const kind = isSearch ? 'search' : kinds.has('password') ? 'login' : kinds.has('email') || names.some(n => /e-?mail/.test(n)) ? 'email-capture' : kinds.has('textarea') ? 'message' : kinds.has('select') ? 'filter' : 'other'
    add('form', where(el), `${kind} | ${method} | ${clean(action)} | fields: ${[...kinds].sort().join(',') || 'none'}`, page)
  })
  $('input[type=password]').each((_, el) => add('password-field', where(el), 'input', page))
  $('input[type=email]').each((_, el) => add('email-field', where(el), 'input', page))
  $('input[type=file]').each((_, el) => add('file-upload-field', where(el), 'input', page))
  $('input[type=search],[role=search],input[placeholder*=earch i],[data-pagefind-ui],[data-pagefind-body]').each((_, el) => add('search-box-or-pagefind-marker', where(el), el.tagName + (el.attribs['data-pagefind-ui'] !== undefined ? ' pagefind-ui' : el.attribs['data-pagefind-body'] !== undefined ? ' pagefind-body' : ''), page))
  $('select').each((_, el) => add('select', where(el), `${$(el).attr('name') || $(el).attr('id') || '(unnamed)'} (${$(el).find('option').length} options)`, page))
  $('iframe').each((_, el) => add('iframe', where(el), clean($(el).attr('src') || $(el).attr('data-src') || '(no src)'), page))
  $('script[src]').each((_, el) => { const s = $(el).attr('src'); const h = hostOf(s); add('script-host', 'chrome', h || '(this site)', page); for (const [n, re] of ANALYTICS_SCRIPT) if (re.test(s)) add('script-kind', 'chrome', n, page) })
  $('script:not([src])').each((_, el) => {
    const t = $(el).html() || ''
    for (const m of t.matchAll(/\b(G-[A-Z0-9]{6,}|GTM-[A-Z0-9]{4,}|UA-\d+-\d+|AW-\d{6,})\b/g)) add('analytics-id-inline', 'chrome', m[1].replace(/^(G-|GTM-|UA-|AW-).*/, '$1…') + ' (kind only)', page)
    for (const [n, re] of ANALYTICS_SCRIPT) if (n !== 'pagefind' && re.test(t)) add('script-kind', 'chrome', n + ' (inline)', page)
  })

  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim(), w = where(el), text = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase()
    if (/^mailto:/i.test(href)) return add('mailto-link', w, '(address not written)', page)
    if (/^tel:/i.test(href)) return add('tel-link', w, '(number not written)', page)
    if (/^(javascript:|#)/i.test(href) || !href) return
    let u; try { u = new URL(href, 'https://x.invalid') } catch { return }
    const h = u.hostname.replace(/^www\./, '')
    for (const [n, re] of PROVIDERS) if (re.test(h)) add('link-to-service:' + n, w, n === 'mailchimp' ? h + (/subscribe|signup|list-manage/.test(u.pathname + u.search) ? ' (subscribe)' : /campaign-archive|archive/.test(h + u.pathname) ? ' (archive)' : '') : clean(href), page)
    for (const [n, re] of SOCIAL) if (re.test(h) && !/\/(sharer|intent|share)/.test(u.pathname)) add('social-link', w, n, page)
    if (/\/(sharer|intent\/tweet|share)|addthis|sharethis|mailto:\?subject/i.test(href)) add('share-link', w, clean(href), page)
    if (/\/p\d+\/?$|[?&](page|p)=\d+/.test(u.pathname + u.search)) add('pager-link', w, u.pathname.replace(/\d+\/?$/, 'N') + (u.search ? ' ?page=N' : ''), page)
    if ($(el).attr('rel') === 'next' || /^(next|previous|older|newer|load more|show more)\b/.test(text)) add('next-previous-link', w, text.slice(0, 30), page)
    if (/\.ics(\?|$)|add to (my )?calendar|download (the )?(ics|calendar)/i.test(href + ' ' + text)) add('calendar-file-or-link', w, clean(href), page)
    if (/(^|\b)(log ?in|sign ?in|my account|member portal|member login)\b/.test(text) || /\/(login|signin|user\/login|wp-login)/i.test(u.pathname)) add('sign-in-word-or-link', w, `${text.slice(0, 30)} -> ${clean(href)}`, page)
    if (FILE_EXT.test(u.pathname)) { const own = h === 'x.invalid' || /(^|\.)cuahsi\.org$/.test(h); add('file-link', w, (own ? (h === 'x.invalid' ? 'this site' : 'cuahsi.org') : 'other host') + ' .' + (u.pathname.match(FILE_EXT)?.[1] || '').toLowerCase(), page) }
    if (/donate|give|support/.test(text) && text.length < 40) add('donate-word-link', w, `${text} -> ${clean(href)}`, page)
    if (/subscribe|sign up for|newsletter/.test(text) && text.length < 60) add('subscribe-word-link', w, `${text.slice(0, 40)} -> ${clean(href)}`, page)
    if (/\b(register|registration|rsvp)\b/.test(text) && text.length < 60) add('register-word-link', w, `-> ${clean(href, false)}`, page)
    if (/\b(apply|post a job|submit a job)\b/.test(text) && text.length < 40) add('apply-or-post-word-link', w, `${text} -> ${clean(href, false)}`, page)
  })
  $('link[rel=alternate]').each((_, el) => { const t = ($(el).attr('type') || '').toLowerCase(); if (/rss|atom|xml/.test(t)) add('feed-link-tag', 'chrome', t, page) })
  $('button,input[type=submit],input[type=button]').each((_, el) => { const t = ($(el).text() || $(el).attr('value') || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 30); if (/subscribe|send|submit|search|sign up|register|donate|download|apply/.test(t)) add('button', where(el), `${t} (inside form: ${$(el).closest('form').length ? 'yes' : 'no'})`, page) })
  $('video,audio,[data-youtube]').each((_, el) => add('media-element', where(el), el.tagName, page))
}

const rows = [...rec.values()].sort((a, b) => a.signal.localeCompare(b.signal) || b.pages.size - a.pages.size || a.target.localeCompare(b.target))
  .map(r => ({ signal: r.signal, where: r.where, target: r.target, pages: r.pages.size, occurrences: r.n, example_pages: [...r.pages].slice(0, 3).join(' ; ') }))
const h = ['signal', 'where', 'target', 'pages', 'occurrences', 'example_pages']
fs.writeFileSync(path.join(OUT, `a5-${SIDE}-signals-${DATE}.csv`), h.join(',') + '\n' + rows.map(r => h.map(k => csvCell(r[k])).join(',')).join('\n') + '\n')
const bySignal = {}; for (const r of rec.values()) { const o = (bySignal[r.signal] = bySignal[r.signal] || { pages: new Set(), targets: 0 }); r.pages.forEach(p => o.pages.add(p)); o.targets++ }
const numbers = { side: SIDE, html_files: files.length, files_with_main_element: withMain, signals: Object.fromEntries(Object.entries(bySignal).sort().map(([k, v]) => [k, { pages: v.pages.size, distinct_targets: v.targets }])) }
fs.writeFileSync(path.join(OUT, `a5-${SIDE}-numbers-${DATE}.json`), JSON.stringify(numbers, null, 2) + '\n')
console.log(SIDE, files.length, 'html files,', rows.length, 'rows')
