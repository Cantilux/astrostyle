// Utilities layer and class namespaces per layer (docs/design.md §6, §7.5).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import { compileConfigured } from './helpers/sass.mjs'
import { declarationsOf, rules } from './helpers/css.mjs'

const css = compileConfigured()

test('display utilities have mobile-first responsive variants', () => {
  const root = postcss.parse(css)
  let found = false
  root.walkAtRules('media', (media) => {
    if (media.params === '(min-width: 48em)') {
      media.walkRules('.ap-u-hidden\\@md', (rule) => {
        found = rule.nodes.some((decl) => decl.prop === 'display' && decl.value === 'none')
      })
    }
  })
  assert.ok(found)
})

test('there is one text utility per type role', () => {
  for (const role of [
    'display',
    'screen-title',
    'panel-title',
    'body',
    'data',
    'label',
    'caption',
  ]) {
    assert.ok(declarationsOf(css, `.ap-u-text-${role}`), role)
  }
})

test('the focusable visually-hidden variant reappears on focus', () => {
  assert.ok(
    declarationsOf(css, '.ap-u-visually-hidden-focusable:where(:not(:focus, :focus-within))'),
  )
})

const namespaces = {
  'astrostyle.objects': 'ap-o-',
  'astrostyle.components': 'ap-c-',
  'astrostyle.utilities': 'ap-u-',
}

test('every class in a layer carries that layer namespace', () => {
  for (const rule of rules(css)) {
    const prefix = namespaces[rule.layer]
    if (!prefix) continue
    for (const selector of rule.selectors) {
      selectorParser((root) => {
        root.walkClasses((node) => {
          assert.ok(node.value.startsWith(prefix), `${node.value} in ${rule.layer}`)
        })
      }).processSync(selector)
    }
  }
})
