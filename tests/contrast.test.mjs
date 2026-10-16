// Text and accent contrast of the default themes, computed from tokens.json (WCAG 2).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exportTokens } from '../scripts/build.mjs'

const tokens = exportTokens()

// sRGB components (0–1) of a theme token, following `{palette.x}` aliases.
function components(value) {
  if (typeof value === 'string') {
    const name = value.match(/^\{palette\.(.+)\}$/)[1]
    return tokens.palette[name].$value.components
  }
  return value.components
}

// WCAG relative luminance of sRGB components.
function luminance([r, g, b]) {
  const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

// WCAG contrast ratio between two theme tokens.
function contrast(theme, foreground, background) {
  const [l1, l2] = [foreground, background]
    .map((name) => luminance(components(tokens.theme[theme][name].$value)))
    .sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const textPairs = [
  ['text', 'bg'],
  ['text-muted', 'bg'],
  ['text-subtle', 'bg'],
  ['text', 'surface-1'],
  ['text-muted', 'surface-1'],
  ['on-accent', 'accent'],
]

for (const theme of ['light', 'dark']) {
  for (const [foreground, background] of textPairs) {
    test(`${theme}: ${foreground} on ${background} reaches 4.5:1`, () => {
      const ratio = contrast(theme, foreground, background)
      assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1`)
    })
  }

  test(`${theme}: focus on bg reaches 3:1`, () => {
    const ratio = contrast(theme, 'focus', 'bg')
    assert.ok(ratio >= 3, `${ratio.toFixed(2)}:1`)
  })
}
