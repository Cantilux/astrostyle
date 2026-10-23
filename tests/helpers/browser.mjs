// Real-browser test helpers: a local server for js/ and the stylesheet compiled from scss/, and a
// loop that runs a suite once per Playwright engine (Chromium, Firefox, WebKit).
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join, normalize, sep } from 'node:path'
import { after, afterEach, before, beforeEach, describe } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium, firefox, webkit } from 'playwright'
import { compileEntry } from './sass.mjs'

const jsDir = fileURLToPath(new URL('../../js/', import.meta.url))
const engines = { chromium, firefox, webkit }

/** Engines to run, from `BROWSERS` (comma-separated), all three by default. */
export const browserNames = (process.env.BROWSERS ?? 'chromium,firefox,webkit')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)

// Full HTML page around `markup`: the framework stylesheet, then the JavaScript API exposed as
// `window.ap`; `autoInit()` runs unless `init` is false, and `window.apReady` marks the end.
export function fixturePage(markup, { init = true, dir = 'ltr' } = {}) {
  return `<!doctype html>
<html lang="en" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/astrostyle.css">
</head>
<body>
${markup}
<script type="module">
import * as ap from '/js/index.js'
window.ap = ap
${init ? 'ap.autoInit()' : ''}
window.apReady = true
</script>
</body>
</html>`
}

// Starts a server on a free local port that serves `/astrostyle.css` (compiled once from scss/)
// and the files under js/; returns its base URL and a close function.
export async function startServer() {
  const css = compileEntry('astrostyle.scss')
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://local').pathname)
    if (path === '/astrostyle.css') {
      response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' })
      return response.end(css)
    }
    const file = normalize(join(jsDir, path.replace(/^\/js\//, '')))
    if (path.startsWith('/js/') && file.startsWith(`${jsDir.replace(/[\\/]$/, '')}${sep}`)) {
      try {
        const body = await readFile(file)
        response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' })
        return response.end(body)
      } catch {}
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

// Declares `suite` once per engine in `browserNames`. Each test gets a fresh page from
// `context.page`; `context.open(markup, options)` loads a fixture page (see `fixturePage()`) into
// it and resolves once the modules have run.
export function eachBrowser(suite) {
  for (const name of browserNames) {
    describe(name, () => {
      const context = {}
      let server
      let browser
      let browserContext

      before(async () => {
        server = await startServer()
        browser = await engines[name].launch()
      })

      after(async () => {
        await browser?.close()
        await server?.close()
      })

      beforeEach(async () => {
        browserContext = await browser.newContext({ viewport: { width: 800, height: 600 } })
        context.page = await browserContext.newPage()
        context.open = async (markup, options) => {
          const url = `${server.url}/fixture.html`
          await context.page.route(url, (route) =>
            route.fulfill({ contentType: 'text/html', body: fixturePage(markup, options) }),
          )
          await context.page.goto(url)
          await context.page.waitForFunction(() => window.apReady === true)
        }
      })

      afterEach(async () => browserContext?.close())

      suite(context, name)
    })
  }
}
