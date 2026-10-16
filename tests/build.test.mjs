// Build outputs: stylesheets, license header and the DTCG tokens export.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  compileTargets,
  exportTokens,
  licenseHeader,
  targets,
  thirdPartyNotices,
} from '../scripts/build.mjs'

test('the build produces one stylesheet per target', () => {
  const styles = []
  const fakeCompile = (path, options) => {
    styles.push(options.style)
    return { css: '' }
  }
  const outputs = compileTargets('entry.scss', targets, fakeCompile)
  assert.deepEqual(Object.keys(outputs), ['astrostyle.css', 'astrostyle.min.css'])
  assert.deepEqual(styles, ['expanded', 'compressed'])
})

test('the license header is a preserved comment with version and third-party notices', () => {
  const header = licenseHeader('1.2.3')
  assert.match(header, /^\/\*! astrostyle v1\.2\.3 \| MIT License/)
  assert.match(header, /\*\/$/)
  for (const notice of thirdPartyNotices) assert.ok(header.includes(notice), notice)
})

test('tokens.json follows the DTCG shape: every leaf has $type and $value', () => {
  const tokens = exportTokens()
  const leaves = []
  // Collects token objects (those with $value) under `node`.
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) return leaves.push([path, node])
    for (const [key, child] of Object.entries(node ?? {})) {
      if (!key.startsWith('$')) walk(child, `${path}.${key}`)
    }
  }
  walk(tokens, 'tokens')
  assert.ok(leaves.length > 100, `${leaves.length} tokens`)
  for (const [path, token] of leaves) assert.ok(typeof token.$type === 'string', path)
})

test('tokens.json carries the guide palette and theme aliases', () => {
  const tokens = exportTokens()
  assert.equal(tokens.palette.black.$value.hex, '#130d1c')
  assert.equal(tokens.theme.light.accent.$value, '{palette.pink}')
  assert.equal(tokens.theme.dark.bg.$value, '{palette.black}')
})
