// Visual regression helpers: serves the built docs site and compares screenshots with the
// baselines in tests/visual/screenshots/. Every mismatch leaves its new image in
// tests/visual/output/actual/ (same layout as the baselines, so it can be copied over them) and,
// when sizes match, a diff in tests/visual/output/diff/. CI uploads that folder.
// `UPDATE_SCREENSHOTS=1` rewrites the baselines instead.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { buildDocs } from '../../scripts/build-docs.mjs'
import { resolveRequest } from '../../scripts/dev.mjs'

const visualDir = fileURLToPath(new URL('../visual/', import.meta.url))
const siteDir = fileURLToPath(new URL('../../_site', import.meta.url))

/** Folder of the committed baselines. */
export const baselineDir = join(visualDir, 'screenshots')

/** Folder of the actual and diff images of the last run (not committed). */
export const outputDir = join(visualDir, 'output')

const update = process.env.UPDATE_SCREENSHOTS === '1'

/** Content types of the files the docs site serves. */
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
}

// Builds the docs site into _site/ and serves it on a free local port; returns its base URL and a
// close function.
export async function startSiteServer() {
  await buildDocs()
  const server = createServer(async (request, response) => {
    try {
      const file = resolveRequest(request.url, siteDir)
      if (!file) throw new Error('outside the site')
      const body = await readFile(file)
      response.writeHead(200, {
        'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
      })
      response.end(body)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

// Writes `data` to `file`, creating its folder.
async function save(file, data) {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, data)
}

// Reads the PNG at `file`, or null when there is none.
async function readPng(file) {
  try {
    return PNG.sync.read(await readFile(file))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

// Compares the PNG `screenshot` with the baseline `<name>.png`. Returns null when they match (or
// the baseline was just written), else the reason: `missing`, `size` or the count of differing
// pixels. Mismatches leave `actual/<name>.png` (and `diff/<name>.png`) in the output folder.
export async function compareScreenshot(name, screenshot) {
  const baselineFile = join(baselineDir, `${name}.png`)
  if (update) {
    await save(baselineFile, screenshot)
    return null
  }
  const actualFile = join(outputDir, 'actual', `${name}.png`)
  const baseline = await readPng(baselineFile)
  if (!baseline) {
    await save(actualFile, screenshot)
    return 'missing'
  }
  const actual = PNG.sync.read(screenshot)
  if (actual.width !== baseline.width || actual.height !== baseline.height) {
    await save(actualFile, screenshot)
    return `size ${baseline.width}×${baseline.height} → ${actual.width}×${actual.height}`
  }
  const diff = new PNG({ width: actual.width, height: actual.height })
  const pixels = pixelmatch(baseline.data, actual.data, diff.data, actual.width, actual.height, {
    threshold: 0.1,
  })
  if (pixels === 0) return null
  await save(actualFile, screenshot)
  await save(join(outputDir, 'diff', `${name}.png`), PNG.sync.write(diff))
  return `${pixels} pixels differ`
}
