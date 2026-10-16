// Components: emission, token contract, modifiers, selection and states (docs/design.md §7.7, §8).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured, compileError } from './helpers/sass.mjs'
import { declarationsOf, rules } from './helpers/css.mjs'

const css = compileConfigured()
const components = [
  'button',
  'button-group',
  'field',
  'input',
  'select',
  'combobox',
  'checkbox',
  'radio',
  'switch',
  'range',
  'meter',
]
const controls = ['button', 'input', 'checkbox', 'radio', 'switch', 'range']

// Rules of the components layer whose selector list contains `selector`.
const componentRules = (source, selector) =>
  rules(source).filter(
    (rule) => rule.layer === 'astrostyle.components' && rule.selectors.includes(selector),
  )

test('every component is emitted in the components layer', () => {
  for (const name of components) assert.ok(componentRules(css, `.ap-c-${name}`).length, name)
})

test('component roots read every public token with a default', () => {
  const button = declarationsOf(css, '.ap-c-button')
  assert.equal(button['--_bg'], 'var(--ap-button-bg, transparent)')
  assert.equal(button['--_radius'], 'var(--ap-button-radius, var(--ap-radius-pill))')
  assert.equal(button['background-color'], 'var(--_bg)')
  assert.equal(
    declarationsOf(css, '.ap-c-input')['--_border-color'],
    'var(--ap-input-border-color, var(--ap-border))',
  )
})

test('modifiers only set public tokens of their component', () => {
  for (const rule of rules(css).filter((r) => r.layer === 'astrostyle.components')) {
    for (const selector of rule.selectors) {
      const modifier = selector.match(/^\.ap-c-([a-z-]+?)--[a-z0-9-]+$/)
      if (!modifier || selector === '.ap-c-button--cut') continue
      for (const prop of Object.keys(rule.declarations)) {
        assert.ok(prop.startsWith(`--ap-${modifier[1]}-`), `${selector} sets ${prop}`)
      }
    }
  }
})

test('the primary button uses the accent and its ink', () => {
  assert.deepEqual(
    {
      bg: declarationsOf(css, '.ap-c-button--primary')['--ap-button-bg'],
      fg: declarationsOf(css, '.ap-c-button--primary')['--ap-button-fg'],
    },
    { bg: 'var(--ap-accent)', fg: 'var(--ap-on-accent)' },
  )
})

test('every control shows a keyboard focus style and a disabled state', () => {
  const selectors = rules(css)
    .filter((rule) => rule.layer === 'astrostyle.components')
    .flatMap((rule) => rule.selectors)
  for (const name of controls) {
    assert.ok(
      selectors.some((s) => s.startsWith(`.ap-c-${name}:where(:focus-visible`)),
      `${name} focus`,
    )
    assert.ok(
      selectors.some((s) => s.startsWith(`.ap-c-${name}:where(:disabled`)),
      `${name} disabled`,
    )
  }
})

test('$components emits only the selected components, in emission order', () => {
  const some = compileConfigured('$components: (button-group, button)')
  assert.ok(componentRules(some, '.ap-c-button').length)
  assert.equal(componentRules(some, '.ap-c-input').length, 0)
  const order = rules(some)
    .filter((r) => r.layer === 'astrostyle.components')
    .map((r) => r.selectors[0])
  assert.ok(order.indexOf('.ap-c-button') < order.indexOf('.ap-c-button-group'))
})

test('an unknown component fails compilation', () => {
  assert.match(
    compileError("@use 'index' with ($components: (buton));"),
    /unknown component `buton`/,
  )
})

test('a custom prefix renames component classes and tokens', () => {
  const custom = compileConfigured("$prefix: 'x'")
  assert.equal(declarationsOf(custom, '.x-c-button')['--_bg'], 'var(--x-button-bg, transparent)')
})

test('variant() adds a look that the button reads', () => {
  const custom = compileConfigured(
    '',
    '@include ap.emit;\n@include ap.variant(button, warn, (bg: var(--ap-warning)));',
  )
  assert.deepEqual(declarationsOf(custom, '.ap-c-button--warn'), {
    '--ap-button-bg': 'var(--ap-warning)',
  })
})

test('the meter fills discrete segments from value and max', () => {
  const meter = declarationsOf(css, '.ap-c-meter')
  assert.equal(meter['--_filled'], 'calc(var(--_value) / var(--_max) * 100%)')
  assert.match(meter['mask-image'], /repeating-linear-gradient/)
  assert.deepEqual(declarationsOf(css, '.ap-c-meter--danger'), {
    '--ap-meter-fill': 'var(--ap-danger)',
  })
})
