// Public functions and mixins.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured, compileError, compileFixture } from './helpers/sass.mjs'
import { declarationsOf } from './helpers/css.mjs'

// Compiles `body` with the public API in scope as `ap`.
const withApi = (body, config) => compileConfigured(config, body)

test('using the public API outputs no CSS', () => {
  assert.equal(compileFixture("@use 'index';").trim(), '')
})

test('token() returns the custom property of a known token', () => {
  const css = withApi('.a { color: ap.token(accent); }')
  assert.equal(declarationsOf(css, '.a').color, 'var(--ap-accent)')
})

test('token() follows $prefix', () => {
  const css = withApi('.a { color: ap.token(accent); }', "$prefix: 'x'")
  assert.equal(declarationsOf(css, '.a').color, 'var(--x-accent)')
})

test('token() rejects unknown names', () => {
  assert.match(
    compileError("@use 'index' as ap;\n.a { color: ap.token(accnet); }"),
    /unknown token `accnet`/,
  )
})

test('palette() returns the raw color and rejects unknown names', () => {
  assert.equal(declarationsOf(withApi('.a { color: ap.palette(pink); }'), '.a').color, '#ef476e')
  assert.match(
    compileError("@use 'index' as ap;\n.a { color: ap.palette(cyan); }"),
    /unknown palette color `cyan`/,
  )
})

test('space() returns a spacing token', () => {
  assert.equal(declarationsOf(withApi('.a { gap: ap.space(md); }'), '.a').gap, 'var(--ap-space-md)')
})

test('text() applies a whole type role and scales the size at the use site', () => {
  const a = declarationsOf(withApi('.a { @include ap.text(label); }'), '.a')
  assert.deepEqual(a, {
    'font-family': 'var(--ap-text-label-family)',
    'font-size': 'calc(var(--ap-text-label-size) * var(--ap-font-scale))',
    'font-weight': 'var(--ap-text-label-weight)',
    'line-height': 'var(--ap-text-label-leading)',
    'letter-spacing': 'var(--ap-text-label-tracking)',
    'text-transform': 'var(--ap-text-label-case)',
  })
  assert.match(
    compileError("@use 'index' as ap;\n.a { @include ap.text(huge); }"),
    /unknown type role `huge`/,
  )
})

test('focus-ring() styles :focus-visible without raising specificity', () => {
  const ring = declarationsOf(withApi('.a { @include ap.focus-ring; }'), '.a:where(:focus-visible)')
  assert.equal(ring.outline, 'var(--ap-focus-width) solid var(--ap-focus)')
})

test('interactive() adds transitions and a disabled cursor', () => {
  const css = withApi('.a { @include ap.interactive; }')
  assert.equal(declarationsOf(css, '.a')['transition-duration'], 'var(--ap-duration-fast)')
  assert.equal(
    declarationsOf(css, '.a:where(:disabled, [aria-disabled=true])').cursor,
    'not-allowed',
  )
})

test('mq() is mobile first and rejects unknown breakpoints', () => {
  assert.match(
    withApi('.a { @include ap.mq(md) { display: grid; } }'),
    /@media \(min-width: 48em\)/,
  )
  assert.match(
    compileError("@use 'index' as ap;\n.a { @include ap.mq(xxl) { display: grid; } }"),
    /unknown breakpoint `xxl`/,
  )
})

test('cq() writes container queries, optionally named', () => {
  assert.match(withApi('.a { @include ap.cq(sm) { gap: 0; } }'), /@container \(min-width: 36em\)/)
  assert.match(
    withApi('.a { @include ap.cq(lg, card) { gap: 0; } }'),
    /@container card \(min-width: 64em\)/,
  )
})

test('cut-corners() clips with the cut token by default', () => {
  const clip = declarationsOf(withApi('.a { @include ap.cut-corners; }'), '.a')['clip-path']
  assert.match(clip, /calc\(100% - var\(--ap-cut\)\) 0/)
})

test('spectrum() draws four hard-edged bands in guide order', () => {
  const image = declarationsOf(withApi('.a { @include ap.spectrum; }'), '.a')['background-image']
  assert.match(image, /yellow\) 0 25%.*orange\) 25% 50%.*magenta\) 50% 75%.*indigo\) 75% 100%/)
})

test('variant() emits a modifier that only sets component tokens', () => {
  const css = withApi('@include ap.variant(button, warn, (bg: red, fg: black));')
  assert.deepEqual(declarationsOf(css, '.ap-c-button--warn'), {
    '--ap-button-bg': 'red',
    '--ap-button-fg': 'black',
  })
})

test('theme() adds a theme over the default one', () => {
  const css = withApi('@include ap.theme(codex, (accent: #54009d));')
  const codex = declarationsOf(
    css,
    ':where(:root[data-ap-theme=codex], :root [data-ap-theme=codex])',
  )
  assert.equal(codex['--ap-accent'], '#54009d')
  assert.equal(codex['--ap-bg'], 'var(--ap-palette-white)')
})

test('accent() recolors a region with derived shades and ink', () => {
  const region = declarationsOf(withApi('.region { @include ap.accent(#1b2a6b); }'), '.region')
  assert.equal(region['--ap-accent'], '#1b2a6b')
  assert.equal(region['--ap-on-accent'], 'var(--ap-palette-white)')
  assert.equal(region['--ap-focus'], 'var(--ap-accent)')
})
