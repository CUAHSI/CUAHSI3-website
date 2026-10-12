// Runs netlify/edge-functions/gage.ts under Node (a stand-in for the Netlify global) and checks what it answers: the three questions
// against the live USGS API with no key, the refusals, and, with USGS faked, that the key is sent upstream and never comes back, that
// USGS failures are not cached, and how the cache times change. Needs the network for the first part. Not part of verify.sh.
// Run: node scripts/test-gage-function.mjs   (exit 1 if anything below fails)
import path from 'node:path'
const mod = await import(path.resolve('netlify/edge-functions/gage.ts'))
let failures = 0
const check = (ok, label, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ' | ' + detail : ''}`) }
const call = async qs => { const r = await mod.default(new Request('https://x.test/api/gage' + (qs ? '?' + qs : ''))); return { status: r.status, h: r.headers, text: await r.text() } }
const cdn = r => r.h.get('netlify-cdn-cache-control') ?? ''

console.log('-- live USGS, no key')
let r = await call('kind=readings&id=05407000&param=00060')
const feats = JSON.parse(r.text).features ?? []
check(r.status === 200 && feats.length > 0, 'readings', `${feats.length} points; fields: ${Object.keys(feats[0]?.properties ?? {}).join(',')}`)
check(cdn(r).includes('s-maxage=900') && r.h.get('x-gage-proxy') === '1' && r.h.get('x-gage-key') === 'no', 'readings: 15-minute CDN cache, proxy header, key reported absent')
r = await call('kind=name&id=05407000'); check(r.status === 200 && /MUSCODA/i.test(r.text) && cdn(r).includes('s-maxage=86400'), 'name, cached a day')
r = await call('kind=recent&id=05407000&param=00060&days=5'); check(r.status === 200 && cdn(r).includes('s-maxage=3600'), 'recent, cached an hour')
r = await call('kind=recent&id=99999999&param=00060&days=5'); check(r.status === 200 && cdn(r).includes('s-maxage=300'), 'recent with no readings: kept only 5 minutes', cdn(r))
r = await call('kind=name&id=00000001'); check(r.status === 404, 'unknown gage: 404')
console.log('-- refusals (400, never cached)')
for (const qs of ['', 'kind=readings&id=05407000&param=99999', 'kind=readings&id=abc&param=00060', 'kind=other&id=05407000', 'kind=recent&id=05407000&param=00060&days=99',
  'kind=name&id=05407000&x=1', 'id=05407000&kind=name', 'kind=name&id=05407000&param=00060', 'kind=readings&id=05407000&param=00060&days=5']) {
  r = await call(qs); check(r.status === 400 && cdn(r) === '' && r.h.get('cache-control') === 'no-store', `400: ${qs || '(empty)'}`)
}
console.log('-- USGS faked, a key set')
globalThis.Netlify = { env: { get: n => (n === 'USGS_API_KEY' ? 'SECRET-TEST-KEY-123' : undefined) } }
const realFetch = globalThis.fetch
let seen
const fake = (status, headers = {}, body = '{"features":[{"properties":{"time":"t"}}]}') => { globalThis.fetch = async (u, o) => { seen = { u: String(u), key: o?.headers?.['x-api-key'] }; return new Response(body, { status, headers }) } }
fake(200, { 'x-ratelimit-remaining': '900' }); r = await call('kind=name&id=05407000')
check(seen.key === 'SECRET-TEST-KEY-123' && seen.u.includes('/ogcapi/v1/'), 'the key is sent to USGS, on the v1 address')
check(r.h.get('x-gage-key') === 'yes' && !JSON.stringify([...r.h.entries()]).includes('SECRET') && !r.text.includes('SECRET'), 'the key is not in the response (headers or body)')
fake(200, { 'x-ratelimit-remaining': '40' }); r = await call('kind=readings&id=05407000&param=00060'); check(cdn(r).includes('s-maxage=3600'), 'under 100 requests left: kept at least an hour')
fake(200, {}, '{"features":[]}'); r = await call('kind=readings&id=05407000&param=00060'); check(cdn(r).includes('s-maxage=300'), 'an empty list of readings: 5 minutes')
for (const [label, f] of [['429', () => fake(429)], ['500', () => fake(500)], ['unreachable', () => { globalThis.fetch = async () => { throw new Error('x') } }]]) {
  f(); r = await call('kind=readings&id=05407000&param=00060'); check(r.status === 503 && cdn(r) === '' && r.h.get('cache-control') === 'no-store', `USGS ${label}: 503, not cached`)
}
globalThis.fetch = realFetch
process.exit(failures ? 1 : 0)
