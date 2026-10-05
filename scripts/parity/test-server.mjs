#!/usr/bin/env node
// A local site that misbehaves on purpose, for scripts/parity/test-fetch.mjs. Short-lived, for tests only.
//   node scripts/parity/test-server.mjs   (env: MODE_FILE, HITS_FILE, EXT_PORT_FILE; prints "PORT <n>")
// The mode is read from MODE_FILE on every request; every request is appended to HITS_FILE as "METHOD /path?query".
import http from 'node:http'
import fs from 'node:fs'

const { MODE_FILE, HITS_FILE, EXT_PORT_FILE } = process.env
const page = body => '<html><body>' + body + '</body></html>'
const seven = Array.from({ length: 7 }, (_, i) => `<a href="/p${i + 1}">${i + 1}</a>`).join('')
const sixFiles = Array.from({ length: 6 }, (_, i) => `<a href="/f${i + 1}.pdf">f</a>`).join('')

http.createServer(async (req, res) => {
  const mode = MODE_FILE ? fs.readFileSync(MODE_FILE, 'utf8').trim() : 'rich'
  const u = new URL(req.url, 'http://localhost')
  if (HITS_FILE) fs.appendFileSync(HITS_FILE, req.method + ' ' + u.pathname + u.search + '\n')
  const html = (b, code = 200, h = {}) => { res.writeHead(code, { 'content-type': 'text/html', ...h }); res.end(req.method === 'HEAD' ? '' : page(b)) }
  const home = u.pathname === '/'

  if (mode === 'fail') return home ? html(seven) : html('down', 503)
  if (mode === '403') return home ? html(seven) : html('blocked', 403)
  if (mode === '404reset') return home ? html(seven) : html('x', u.pathname === '/p5' ? 404 : 503)
  if (mode === 'ratedate') return home ? html('<a href="/p1">1</a><a href="/p2">2</a>') : html('slow down', 429, { 'retry-after': new Date(Date.now() + 2000).toUTCString() })
  if (mode === 'raseconds') return home ? html('<a href="/p1">1</a><a href="/p2">2</a>') : u.pathname === '/p1' ? html('slow down', 429, { 'retry-after': '1' }) : html('ok')
  if (mode === 'ralong') return home ? html('<a href="/p1">1</a><a href="/p2">2</a>') : html('slow down', 429, { 'retry-after': '301' })
  if (mode === 'headfail') return home ? html(sixFiles) : req.method === 'HEAD' ? html('', 503) : html('ok')
  if (mode === 'big') { if (home) return html('<a href="/big">b</a>'); res.writeHead(200, { 'content-type': 'text/html' }); return res.end(Buffer.alloc(6 * 1024 * 1024, 'a')) }
  if (mode === 'hang') { if (home) return html('<a href="/p1">1</a><a href="/p2">2</a>'); if (u.pathname === '/p1') await new Promise(r => setTimeout(r, 6000)); return html('ok') }
  if (mode === 'endless') { await new Promise(r => setTimeout(r, 120)); const n = Number((u.pathname.match(/page(\d+)/) || [0, 0])[1]); return html(Array.from({ length: 40 }, (_, i) => '<a href="/page' + (n * 40 + i + 1) + '">p</a>').join('')) }
  if (mode === 'pagerredirect') {
    if (home) return html('<a href="/events">e</a>')
    if (u.pathname === '/events' && !u.search) return html('<a href="/events?page=2">next</a>')
    if (u.pathname === '/events' && u.search) { res.writeHead(301, { location: '/events/' + u.search }); return res.end() }
    return html('listing page ' + u.pathname + u.search)
  }

  // mode 'rich'
  if (home) {
    const ext = EXT_PORT_FILE && fs.existsSync(EXT_PORT_FILE) ? '<a href="http://localhost:' + fs.readFileSync(EXT_PORT_FILE, 'utf8').trim() + '/ext">ext</a>' : ''
    return html('<a href="/events">e</a><a href="/slash">s</a><a href="/rel">r</a><a href="/a,b">c</a><a href="/doc.pdf">d</a><a href="/uploads/x">u</a><a href="http://example.com/x">ext</a>' + ext + '<a href="/events?utm=1&foo=2">q</a><a href="/about#frag">f</a><a href="//host.invalid/y">proto</a><a href="/Case">c</a><a href="/dup//path">dd</a><a href="/about">again</a>')
  }
  if (u.pathname === '/events') { const p = Number(u.searchParams.get('page') || 1); return html((p < 4 ? '<a href="/events?page=' + (p + 1) + '">next</a>' : '') + '<a href="/events/e' + p + '">e</a>') }
  if (u.pathname === '/slash') { res.writeHead(301, { location: '/slash/' }); return res.end() }
  if (u.pathname === '/slash/') return html('<a href="child">child</a>')
  if (u.pathname === '/rel') { res.writeHead(301, { location: '/rel/' }); return res.end() }
  if (u.pathname === '/rel/') return html('<a href="c">c</a>')
  if (u.pathname === '/loopa') { res.writeHead(301, { location: '/loopa/' }); return res.end() }
  if (u.pathname === '/loopa/') { res.writeHead(301, { location: '/loopa' }); return res.end() }
  if (u.pathname === '/doc.pdf' || u.pathname === '/uploads/x') { res.writeHead(200, { 'content-type': 'application/pdf', 'content-length': '1234' }); return res.end() }
  return html('page ' + u.pathname)
}).listen(0, function () { console.log('PORT ' + this.address().port) })
