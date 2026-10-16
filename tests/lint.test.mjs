// The Stylelint configuration enforces the design rules (docs/design.md §7.5, §7.6, §12).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import stylelint from 'stylelint'

const root = fileURLToPath(new URL('..', import.meta.url))

// Lints `code` as if it lived at `relativePath` and returns the names of the rules it breaks.
async function brokenRules(code, relativePath = 'scss/components/demo/_demo.scss') {
  const { results } = await stylelint.lint({
    code,
    codeFilename: `${root}${relativePath}`,
    configFile: `${root}stylelint.config.mjs`,
  })
  return results[0].warnings.map((warning) => warning.rule)
}

const cases = [
  ['raw hex colors', '.a { color: #ff0000; }', 'color-no-hex'],
  ['raw font sizes', '.a { font-size: 14px; }', 'scale-unlimited/declaration-strict-value'],
  ['!important', '.a { display: block !important; }', 'declaration-no-important'],
  ['IDs', '#a { display: block; }', 'selector-max-id'],
  ['two-class selectors', '.a .b { display: block; }', 'selector-max-specificity'],
  ['type-qualified classes', 'button.a { display: block; }', 'selector-no-qualifying-type'],
  [
    'max-width queries',
    '@media (max-width: 48em) { .a { display: none; } }',
    'media-feature-name-disallowed-list',
  ],
  ['@import', "@import 'x';", 'at-rule-disallowed-list'],
  ['@extend', '.a { @extend .b; }', 'at-rule-disallowed-list'],
]

for (const [name, code, rule] of cases) {
  test(`rejects ${name}`, async () => {
    assert.ok((await brokenRules(code)).includes(rule), `expected ${rule}`)
  })
}

test('accepts token-based, zero-specificity internals', async () => {
  const code = '.a:where(.b) {\n  color: var(--ap-text);\n  font-size: var(--ap-text-body);\n}\n'
  assert.deepEqual(await brokenRules(code), [])
})

test('allows raw values only in settings', async () => {
  const code = '.a { color: #130d1c; }'
  assert.ok(!(await brokenRules(code, 'scss/settings/_palette.scss')).includes('color-no-hex'))
})
