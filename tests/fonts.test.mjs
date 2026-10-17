// Optional font faces (scss/fonts.scss): bundled files, project-provided files and family names.
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { compileConfigured, compileFixture } from './helpers/sass.mjs'

const fontsDir = fileURLToPath(new URL('../fonts/', import.meta.url))

// Returns the font faces of `css` as { family, url } pairs.
function faces(css) {
  return [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
    family: body.match(/font-family:\s*"?([^";]+)"?;/)[1],
    url: body.match(/url\("?([^")]+)"?\)/)[1],
  }))
}

test('every bundled face points to a file shipped in fonts/', () => {
  const declared = faces(compileFixture("@use 'fonts';"))
  assert.equal(declared.length, 7)
  for (const { url } of declared) {
    assert.match(url, /^\.\.\/fonts\//)
    assert.ok(existsSync(`${fontsDir}${url.slice('../fonts/'.length)}`), `${url} is missing`)
  }
})

test('Powerr, Rimma Sans and SCHABO are declared only from the licensed path', () => {
  const families = (css) => new Set(faces(css).map(({ family }) => family))
  assert.ok(!families(compileFixture("@use 'fonts';")).has('Powerr'))
  const css = compileFixture("@use 'fonts' with ($path: '/f', $licensed-path: '/own');")
  assert.deepEqual([...families(css)].sort(), [
    'Feature Mono',
    'Genesys',
    'Instrument Serif',
    'Powerr',
    'Rimma Sans',
    'SCHABO',
    'ST-Cyberillic',
  ])
  assert.ok(css.includes('url("/own/Powerr-Bold.ttf")'))
  assert.ok(css.includes('url("/f/FeatureMono-Light.ttf")'))
})

test('declared families match the font-family tokens', () => {
  const tokens = compileConfigured()
  const declared = faces(compileFixture("@use 'fonts' with ($licensed-path: '/own');"))
  for (const { family } of declared) {
    assert.ok(tokens.includes(`"${family}"`), `${family} is not in any font-family token`)
  }
})
