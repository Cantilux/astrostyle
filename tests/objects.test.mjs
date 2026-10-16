// Objects layer: cosmetic-free layout patterns.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import postcss from 'postcss'
import { compileConfigured } from './helpers/sass.mjs'
import { declarationsOf } from './helpers/css.mjs'

const css = compileConfigured()

// Names of the custom properties registered with @property, mapped to their `inherits` value.
function registeredProperties(source) {
  const found = {}
  postcss.parse(source).walkAtRules('property', (rule) => {
    rule.walkDecls('inherits', (decl) => (found[rule.params] = decl.value))
  })
  return found
}

test('properties an object reads on itself are registered as non-inheriting', () => {
  const registered = registeredProperties(css)
  for (const name of [
    '--ap-stack-gap',
    '--ap-cluster-justify',
    '--ap-grid-min',
    '--ap-sidebar-gap',
    '--ap-switcher-gap',
    '--ap-frame-ratio',
    '--ap-container-max',
  ]) {
    assert.equal(registered[name], 'false', name)
  }
})

test("properties read by an object's children are never registered as non-inheriting", () => {
  const registered = registeredProperties(css)
  postcss.parse(css).walkRules((rule) => {
    if (!rule.selector.includes('>')) return
    rule.walkDecls((decl) => {
      for (const [, name] of decl.value.matchAll(/var\((--ap-[a-z-]+)/g)) {
        assert.notEqual(registered[name], 'false', `${name} is read in "${rule.selector}"`)
      }
    })
  })
})

test('objects read their properties with token fallbacks', () => {
  assert.equal(declarationsOf(css, '.ap-o-stack').gap, 'var(--ap-stack-gap, var(--ap-space-md))')
  assert.match(
    declarationsOf(css, '.ap-o-grid')['grid-template-columns'],
    /repeat\(auto-fit, minmax\(min\(var\(--ap-grid-min, var\(--ap-size-grid-min\)\), 100%\), 1fr\)\)/,
  )
})

test('gap modifiers exist for every spacing step', () => {
  for (const step of ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
    assert.deepEqual(declarationsOf(css, `.ap-o-cluster--gap-${step}`), {
      '--ap-cluster-gap': `var(--ap-space-${step})`,
    })
  }
})

test('frame ratios come from $ratios', () => {
  assert.deepEqual(declarationsOf(css, '.ap-o-frame--4-3'), { '--ap-frame-ratio': '4 / 3' })
  const custom = compileConfigured("$ratios: ('21-9': '21 / 9')")
  assert.deepEqual(declarationsOf(custom, '.ap-o-frame--21-9'), { '--ap-frame-ratio': '21 / 9' })
})

test('the end sidebar swaps the side and content roles', () => {
  assert.equal(
    declarationsOf(css, '.ap-o-sidebar--end > :where(:last-child)')['min-inline-size'],
    'auto',
  )
  assert.equal(declarationsOf(css, '.ap-o-sidebar--end > :where(:first-child)')['flex-grow'], '999')
})

test('a custom scope matches objects inside it and on its root, without extra specificity', () => {
  const scoped = compileConfigured("$scope: '.app'")
  assert.ok(declarationsOf(scoped, ':where(.app) .ap-o-stack'))
  assert.ok(declarationsOf(scoped, '.ap-o-stack:where(.app)'))
})
