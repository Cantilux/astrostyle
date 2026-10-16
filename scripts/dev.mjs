// Local development server: builds the docs site with readable CSS, serves it, rebuilds when
// scss/, site/ or scripts/ change, and reloads the open pages (or shows the Sass error in them).
import { watch } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDocs } from './build-docs.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const siteOut = join(root, '_site')
const port = Number(process.env.PORT) || 4321

/** Content types of the files the site serves. */
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

/** Browser-side client: reloads on `reload`, shows a banner on `failure`. */
export const clientScript = `
const source = new EventSource('/__dev/events')
source.addEventListener('reload', () => location.reload())
source.addEventListener('failure', (event) => {
  let box = document.getElementById('__dev-error')
  if (!box) {
    box = document.createElement('pre')
    box.id = '__dev-error'
    box.style.cssText = 'position:fixed;inset:auto 1rem 1rem 1rem;z-index:2147483647;max-height:50vh;overflow:auto;margin:0;padding:1rem;border-radius:8px;background:#130d1c;color:#f0eee8;border:2px solid #ef476e;font:13px/1.4 ui-monospace,monospace;white-space:pre-wrap'
    document.body.append(box)
  }
  box.textContent = 'astrostyle dev: build failed\\n\\n' + JSON.parse(event.data)
})
`

// Adds the dev client to an HTML page, just before </body>.
export function injectClient(html) {
  return html.replace('</body>', '<script src="/__dev/client.js"></script></body>')
}

// Maps a request path to a file inside _site/, or null when it would escape it.
export function resolveRequest(urlPath, base = siteOut) {
  const path = decodeURIComponent(urlPath.split('?')[0])
  const file = normalize(join(base, path.endsWith('/') ? `${path}index.html` : path))
  return file === base || file.startsWith(`${base}${sep}`) ? file : null
}

// Calls `run` once per burst of calls closer than `delay` ms.
export function debounce(run, delay = 120) {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => run(...args), delay)
  }
}

const clients = new Set()

// Sends one server-sent event to every connected page.
function broadcast(event, data = '') {
  for (const response of clients)
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// Rebuilds the site and tells the pages to reload, or reports the error to them.
async function rebuild(reason) {
  const started = Date.now()
  try {
    const pages = await buildDocs({ style: 'expanded' })
    console.log(`✓ ${reason}: ${pages} pages in ${Date.now() - started} ms`)
    broadcast('reload')
  } catch (error) {
    console.error(`✗ ${reason}:\n${error.message}`)
    broadcast('failure', error.message)
  }
}

// Serves _site/ plus the dev client and the event stream.
export async function handle(request, response) {
  if (request.url === '/__dev/events') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
    clients.add(response)
    request.on('close', () => clients.delete(response))
    return
  }
  if (request.url === '/__dev/client.js') {
    response.writeHead(200, { 'Content-Type': contentTypes['.js'] })
    return response.end(clientScript)
  }
  try {
    // Inside the try: a malformed URL (`/%`) makes decodeURIComponent throw.
    const file = resolveRequest(request.url)
    if (!file) throw new Error('outside the site')
    let body = await readFile(file)
    const type = contentTypes[extname(file)] ?? 'application/octet-stream'
    if (extname(file) === '.html') body = injectClient(body.toString())
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' })
    response.end(body)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await rebuild('initial build')
  const scheduleRebuild = debounce((file) => rebuild(`changed ${file}`))
  for (const folder of ['scss', 'site', 'scripts']) {
    watch(join(root, folder), { recursive: true }, (event, file) =>
      scheduleRebuild(`${folder}/${file}`),
    )
  }
  createServer(handle).listen(port, () => {
    console.log(`astrostyle dev server: http://localhost:${port}/demo.html (Ctrl+C to stop)`)
  })
}
