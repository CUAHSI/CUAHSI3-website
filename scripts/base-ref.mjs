// The main branch of the organisation's repository, whatever the remote is called in this clone: origin for a plain clone,
// upstream for a clone of a fork. VERIFY_BASE wins (CI sets it). Printed when run directly: node scripts/base-ref.mjs
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export function baseRef() {
  if (process.env.VERIFY_BASE) return process.env.VERIFY_BASE
  const remotes = execFileSync('git', ['remote', '-v'], { encoding: 'utf8' }).split('\n')
  const org = remotes.find(l => /[:/]CUAHSI\/CUAHSI3-website(\.git)?\/?\s+\(fetch\)/i.test(l))
  return org ? `${org.split(/\s/)[0]}/main` : 'main'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(baseRef())
