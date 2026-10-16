// Token emission and configuration.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured, compileError } from './helpers/sass.mjs'
import { declarationsOf, topLevelAtRules } from './helpers/css.mjs'

const guidePalette = {
  black: '#130d1c',
  white: '#f0eee8',
  'off-white': '#e9dcd3',
  pink: '#ef476e',
  'pink-dark': '#d50059',
  'pink-shadow': '#ab0048',
  yellow: '#ffbd5c',
  orange: '#ff603e',
  magenta: '#d50059',
  indigo: '#54009d',
  red: '#ca2632',
  teal: '#5fc3b0',
  green: '#6abd45',
  sea: '#4bba7a',
  amber: '#faa21e',
  rose: '#d51b5b',
}

const darkSelector = ':where(:root[data-ap-theme=dark], :root [data-ap-theme=dark])'

test('emits the Design Guide palette on the scope root', () => {
  const root = declarationsOf(compileConfigured(), ':where(:root)')
  for (const [name, hex] of Object.entries(guidePalette)) {
    assert.equal(root[`--ap-palette-${name}`], hex, name)
  }
})

test('applies the light theme on the root by default', () => {
  const root = declarationsOf(compileConfigured(), ':where(:root)')
  assert.equal(root['color-scheme'], 'light')
  assert.equal(root['--ap-bg'], 'var(--ap-palette-white)')
  assert.equal(root['--ap-text'], 'var(--ap-palette-black)')
})

test('emits a selectable block for each theme', () => {
  const dark = declarationsOf(compileConfigured(), darkSelector)
  assert.equal(dark['color-scheme'], 'dark')
  assert.equal(dark['--ap-bg'], 'var(--ap-palette-black)')
  assert.equal(dark['--ap-text-muted'], 'color-mix(in oklab, var(--ap-text) 80%, var(--ap-bg))')
})

test('$theme-default selects the theme applied on the root', () => {
  const root = declarationsOf(compileConfigured("$theme-default: 'dark'"), ':where(:root)')
  assert.equal(root['color-scheme'], 'dark')
})

test('an unknown $theme-default fails compilation', () => {
  assert.match(
    compileError("@use 'index' with ($theme-default: 'sepia');"),
    /unknown \$theme-default/,
  )
})

test('$scope limits tokens and themes to a subtree without :root', () => {
  const css = compileConfigured("$scope: '.astroprisma'")
  assert.ok(declarationsOf(css, ':where(.astroprisma)'))
  assert.ok(
    declarationsOf(
      css,
      ':where(.astroprisma[data-ap-theme=dark], .astroprisma [data-ap-theme=dark])',
    ),
  )
  assert.doesNotMatch(css, /:root/)
})

test('$prefix renames custom properties and the theme attribute', () => {
  const css = compileConfigured("$prefix: 'x'")
  assert.equal(declarationsOf(css, ':where(:root)')['--x-accent'], 'var(--x-palette-pink)')
  assert.match(css, /\[data-x-theme=dark\]/)
})

test('$layer renames the cascade layers', () => {
  assert.equal(
    topLevelAtRules(compileConfigured("$layer: 'ui'"))[0],
    '@layer ui.generic, ui.elements, ui.objects, ui.components, ui.utilities',
  )
})

test('$palette overrides one color and keeps the others', () => {
  const root = declarationsOf(compileConfigured('$palette: (pink: #3fa7ff)'), ':where(:root)')
  assert.equal(root['--ap-palette-pink'], '#3fa7ff')
  assert.equal(root['--ap-palette-black'], '#130d1c')
})

test('$themes overrides one token of a theme and keeps the rest', () => {
  const dark = declarationsOf(compileConfigured('$themes: (dark: (bg: #0c0812))'), darkSelector)
  assert.equal(dark['--ap-bg'], '#0c0812')
  assert.equal(dark['--ap-text'], 'var(--ap-palette-white)')
})

test('$themes can add a theme built over light', () => {
  const css = compileConfigured('$themes: (codex: (accent: #54009d))')
  const codex = declarationsOf(
    css,
    ':where(:root[data-ap-theme=codex], :root [data-ap-theme=codex])',
  )
  assert.equal(codex['--ap-accent'], '#54009d')
  assert.equal(codex['--ap-bg'], 'var(--ap-palette-white)')
})

test('$accent replaces the accent, derives its shades and picks a legible ink', () => {
  const light = declarationsOf(compileConfigured('$accent: #9fd3ff'), ':where(:root)')
  assert.equal(light['--ap-accent'], '#9fd3ff')
  assert.equal(
    light['--ap-accent-strong'],
    'color-mix(in oklab, var(--ap-accent) 82%, var(--ap-text))',
  )
  assert.equal(light['--ap-on-accent'], 'var(--ap-palette-black)')
  const navy = declarationsOf(compileConfigured('$accent: #1b2a6b'), ':where(:root)')
  assert.equal(navy['--ap-on-accent'], 'var(--ap-palette-white)')
})

test('type, space and size tokens are emitted in rem', () => {
  const root = declarationsOf(compileConfigured(), ':where(:root)')
  assert.equal(root['--ap-text-body-size'], '0.9375rem')
  assert.equal(root['--ap-space-md'], '0.75rem')
  assert.equal(root['--ap-size-control'], '2.5rem')
  assert.equal(root['--ap-radius-card'], '22px')
})

test('a theme may not redefine a theme-independent token', () => {
  assert.match(
    compileError("@use 'index' with ($themes: (light: (space-md: 1px)));"),
    /redefines the theme-independent token `space-md`/,
  )
})
