// Elements layer: bare HTML element defaults.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured } from './helpers/sass.mjs'
import { declarationsOf, rules } from './helpers/css.mjs'

const css = compileConfigured()

test('body text goes on <body>, never on the root, so rem stays the browser default', () => {
  assert.equal(
    declarationsOf(css, ':where(body)')['font-size'],
    'calc(var(--ap-text-body-size) * var(--ap-font-scale))',
  )
  for (const rule of rules(css).filter((r) => r.selectors.includes(':where(:root)'))) {
    assert.equal(rule.declarations['font-size'], undefined)
  }
})

test('a custom scope carries the body text itself', () => {
  const scoped = compileConfigured("$scope: '.app'")
  const textRule = rules(scoped).find(
    (rule) => rule.selectors.includes(':where(.app)') && rule.declarations['font-family'],
  )
  assert.ok(textRule)
  assert.equal(declarationsOf(scoped, ':where(body)'), null)
})

test('the root and every themed region paint their theme colors', () => {
  const page = declarationsOf(css, ':where(:root) :where([data-ap-theme])')
  assert.equal(page['background-color'], 'var(--ap-bg)')
  assert.equal(page.color, 'var(--ap-text)')
})

test('headings take the type roles of $element-roles', () => {
  assert.equal(
    declarationsOf(css, ':where(:root) :where(h1)')['font-size'],
    'calc(var(--ap-text-display-size) * var(--ap-font-scale))',
  )
  const custom = compileConfigured('$element-roles: (h1: screen-title)')
  assert.match(declarationsOf(custom, ':where(:root) :where(h1)')['font-size'], /screen-title-size/)
})

test('code shows `--` as two hyphens, not as a Feature Mono ligature', () => {
  const code = declarationsOf(css, ':where(:root) :where(code, kbd, samp, pre)')
  assert.equal(code['font-variant-ligatures'], 'none')
})

test('links use the link tokens', () => {
  assert.equal(declarationsOf(css, ':where(:root) :where(a)').color, 'var(--ap-link)')
  assert.equal(declarationsOf(css, ':where(:root) :where(a:hover)').color, 'var(--ap-link-hover)')
})

test('only content lists without classes get their indentation back', () => {
  assert.ok(declarationsOf(css, ':where(:root) :where(ul:not([class]), ol:not([class]))'))
})

test('$emit-elements: false leaves the elements layer out', () => {
  const bare = compileConfigured('$emit-elements: false')
  assert.equal(rules(bare).filter((r) => r.layer === 'astrostyle.elements').length, 0)
  assert.ok(rules(css).filter((r) => r.layer === 'astrostyle.elements').length > 10)
})
