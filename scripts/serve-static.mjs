// Serves the built site (.output/public) on http://localhost:4100 for the visual tests.
// Build first: npm run build:search. Port: PORT env var, default 4100.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('.output/public')
const port = Number(process.env.PORT || 4100)
if (!fs.existsSync(root)) {
  console.error('No .output/public. Run: npm run build:search')
  process.exit(1)
}

const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain'
}

http.createServer((req, res) => {
  let p
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname) } catch { res.writeHead(400); return res.end() }
  let f = path.join(root, p)
  if (f !== root && !f.startsWith(root + path.sep)) { res.writeHead(403); return res.end() }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found') }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`))
