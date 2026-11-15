#!/usr/bin/env node
// Site audit, task A7 (org issue 112): what the public DNS says about the hosts a cut-over touches. Read only: ordinary lookups
// with `dig` (and `whois` for the registrar), no change anywhere. Writes one CSV row per record.
//
//   node scripts/parity/a7-dns-facts.mjs --out agent/audit/a7_dns_facts.csv
//
// Not recorded: the text of verification TXT records (only that one exists), and any e-mail address inside a record (C11).
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const argv = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]]] : a), []))
const OUT = argv.out || 'agent/audit/a7_dns_facts.csv'
const dig = (type, name) => {
  try { return execFileSync('dig', ['+short', '+time=4', '+tries=2', type, name], { encoding: 'utf8' }).split('\n').map(s => s.trim()).filter(Boolean) } catch { return ['(lookup failed)'] }
}
const clean = (type, v) => {
  if (type !== 'TXT') return v
  const t = v.replace(/^"|"$/g, '')
  if (/^v=spf1/.test(t)) return 'SPF: ' + t.replace(/\s+/g, ' ')
  if (/^v=DMARC1/.test(t)) return 'DMARC: ' + t.replace(/(mailto:)[^;\s]+/g, '$1[address]')
  if (/verification|^[a-z0-9]{32}$/i.test(t)) return 'verification record (value not kept)'
  return t.replace(/[\w.+-]+@[\w.-]+/g, '[address]').slice(0, 60)
}
const NAMES = {
  'cuahsi.org': ['A', 'NS', 'MX', 'TXT', 'CAA'],
  'www.cuahsi.org': ['A', 'CNAME'],
  '_dmarc.cuahsi.org': ['TXT'],
  'zz-no-such-host-7431.cuahsi.org': ['A'],
  'mail.cuahsi.org': ['A'], 'autodiscover.cuahsi.org': ['CNAME'], 'selector1._domainkey.cuahsi.org': ['CNAME'], 'zendesk1._domainkey.cuahsi.org': ['CNAME'],
  'hydroshare.cuahsi.org': ['CNAME'], 'hiscentral.cuahsi.org': ['CNAME'], 'his.cuahsi.org': ['CNAME'], 'help.cuahsi.org': ['CNAME'],
  'data.cuahsi.org': ['CNAME'], 'subset.cuahsi.org': ['A'], 'hydroserver.cuahsi.org': ['CNAME'], 'jupyterhub.cuahsi.org': ['A'],
  'matlab.cuahsi.org': ['A'], 'auth.cuahsi.org': ['A'], 'apps.cuahsi.org': ['CNAME'], 'ftp.cuahsi.org': ['CNAME'],
  'criticalzone.org': ['A', 'NS'], 'www.criticalzone.org': ['CNAME'], 'czo-archive.criticalzone.org': ['A'],
  'cuahsi3-website.netlify.app': ['A']
}
const rows = [['name', 'type', 'value']]
for (const [name, types] of Object.entries(NAMES)) for (const t of types) {
  const v = dig(t, name)
  if (!v.length) rows.push([name, t, '(none)'])
  for (const x of v) rows.push([name, t, clean(t, x)])
}
const who = d => { try { return execFileSync('whois', [d], { encoding: 'utf8' }) } catch (e) { return String(e.stdout || '') } }
for (const d of ['cuahsi.org', 'criticalzone.org']) {
  const w = who(d), pick = re => (w.match(re) || [, ''])[1].trim()
  rows.push([d, 'registrar', pick(/^Registrar:\s*(.+)$/im)])
  rows.push([d, 'expires', pick(/^Registry Expiry Date:\s*(.+)$/im)])
  rows.push([d, 'lock', pick(/^Domain Status:\s*(clientTransferProhibited)/im) || '(none shown)'])
}
const q = s => /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
fs.writeFileSync(OUT, rows.map(r => r.map(q).join(',')).join('\n') + '\n')
console.log(`${rows.length - 1} rows -> ${OUT}`)
