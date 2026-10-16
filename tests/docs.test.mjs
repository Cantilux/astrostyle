// Docs site generation (scripts/build-docs.mjs).
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { exportComponentTokens, exportTokens } from '../scripts/build.mjs'
import {
  componentTokenValues,
  componentTokensHtml,
  fill,
  navHtml,
  navigation,
  paletteHtml,
  renderPage,
  shapesHtml,
  spacingHtml,
  themesHtml,
  typeRolesHtml,
} from '../scripts/build-docs.mjs'

const tokens = exportTokens()
const site = fileURLToPath(new URL('../site/', import.meta.url))

test('the palette section lists every palette token with its guide name and hex', () => {
  const html = paletteHtml(tokens)
  for (const [name, token] of Object.entries(tokens.palette)) {
    assert.ok(html.includes(`var(--ap-palette-${name})`), name)
    assert.ok(html.includes(token.$value.hex), name)
  }
  assert.ok(html.includes('ASTROPRISMA Black'))
})

test('each theme card sets its own data-ap-theme and lists every semantic token', () => {
  const html = themesHtml(tokens)
  for (const [theme, colors] of Object.entries(tokens.theme)) {
    assert.ok(html.includes(`data-ap-theme="${theme}"`), theme)
    for (const name of Object.keys(colors)) assert.ok(html.includes(`--ap-${name}`), name)
  }
})

test('type, spacing and shape sections cover every token of their group', () => {
  for (const role of Object.keys(tokens.text))
    assert.ok(typeRolesHtml(tokens).includes(`ap-u-text-${role}`))
  for (const step of Object.keys(tokens.space))
    assert.ok(spacingHtml(tokens).includes(`--ap-space-${step}`))
  for (const name of Object.keys(tokens.elevation))
    assert.ok(shapesHtml(tokens).includes(`--ap-elevation-${name}`))
})

test('component token tables list every public token with its default', () => {
  const html = componentTokensHtml('button', { bg: 'transparent', 'hover-bg': 'color-mix(a < b)' })
  assert.match(html, /<code>--ap-button-bg<\/code><\/td><td><code>transparent<\/code>/)
  assert.match(html, /color-mix\(a &lt; b\)/)
  const values = componentTokenValues(exportComponentTokens())
  for (const name of [
    'button',
    'button-group',
    'field',
    'input',
    'checkbox',
    'radio',
    'switch',
    'range',
    'meter',
  ]) {
    assert.ok(values[`tokens-${name}`], name)
  }
})

test('the navigation marks only the current page', () => {
  const html = navHtml('layouts.html')
  assert.equal(html.match(/aria-current="page"/g).length, 1)
  assert.match(html, /href="layouts.html" aria-current="page"/)
})

test('fill() rejects unknown placeholders', () => {
  assert.equal(fill('a {{x}} b', { x: 1 }), 'a 1 b')
  assert.throws(() => fill('{{missing}}', {}), /missing/)
})

test('every page in site/pages is in the navigation and renders without leftovers', () => {
  const layout = readFileSync(`${site}layout.html`, 'utf8')
  const values = {
    ...componentTokenValues(exportComponentTokens()),
    version: '0.0.0',
    palette: '',
    themes: '',
    'type-roles': '',
    spacing: '',
    shapes: '',
  }
  const files = readdirSync(`${site}pages`).filter((file) => file.endsWith('.html'))
  assert.deepEqual(files.sort(), navigation.map(([file]) => file).sort())
  for (const file of files) {
    const html = renderPage(layout, readFileSync(`${site}pages/${file}`, 'utf8'), file, values)
    assert.doesNotMatch(html, /\{\{/, file)
    assert.match(html, /independent production by Enrico Cantile/, file)
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    assert.deepEqual(duplicates, [], `${file} repeats ids`)
  }
})
