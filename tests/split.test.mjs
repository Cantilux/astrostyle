// Split build: core.css plus one stylesheet per component.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileSplit, exportComponentTokens, splitSources } from '../scripts/build.mjs'
import { compileEntry } from './helpers/sass.mjs'
import { rules, topLevelAtRules } from './helpers/css.mjs'

const components = Object.keys(exportComponentTokens())
const outputs = compileSplit(splitSources(components))
const layerOrder =
  '@layer astrostyle.generic, astrostyle.elements, astrostyle.objects, astrostyle.components, astrostyle.utilities'

// Selector-plus-layer keys of every rule, to compare stylesheets.
const ruleKeys = (css) => rules(css).map((rule) => `${rule.layer} ${rule.selectors.join(', ')}`)

test('there is a readable and a minified core plus one pair per component', () => {
  const expected = ['core', ...components.map((name) => `components/${name}`)].flatMap((path) => [
    `${path}.css`,
    `${path}.min.css`,
  ])
  assert.deepEqual(Object.keys(outputs).sort(), expected.sort())
})

test('core has every layer except components', () => {
  const layers = new Set(rules(outputs['core.css']).map((rule) => rule.layer))
  assert.deepEqual([...layers].sort(), [
    'astrostyle.elements',
    'astrostyle.generic',
    'astrostyle.objects',
    'astrostyle.utilities',
  ])
})

test('each component file declares the layer order and holds only its component', () => {
  for (const name of components) {
    const css = outputs[`components/${name}.css`]
    assert.equal(topLevelAtRules(css)[0], layerOrder, name)
    for (const rule of rules(css)) {
      assert.equal(rule.layer, 'astrostyle.components', name)
      for (const selector of rule.selectors) {
        assert.match(
          selector,
          new RegExp(`^\\.ap-c-${name}(?:$|__|--|:|\\s)`),
          `${name}: ${selector}`,
        )
      }
    }
  }
})

test('core plus every component has exactly the rules of the full bundle', () => {
  const split = [
    outputs['core.css'],
    ...components.map((name) => outputs[`components/${name}.css`]),
  ].flatMap(ruleKeys)
  assert.deepEqual(split.sort(), ruleKeys(compileEntry('astrostyle.scss')).sort())
})
