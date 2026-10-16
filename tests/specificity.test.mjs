// Specificity budget and cascade layers of the compiled CSS (docs/design.md §7.5).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured, compileEntry } from './helpers/sass.mjs'
import { rules, specificity, topLevelAtRules } from './helpers/css.mjs'

const builds = {
  'the default bundle': compileEntry('astrostyle.scss'),
  'a scoped build': compileConfigured("$scope: '.astroprisma'"),
}

// Whether `selector` ends with a pseudo-element (`::before`, `::after`, …).
const hasPseudoElement = (selector) => /::[a-z-]+\s*$/.test(selector)

for (const [name, css] of Object.entries(builds)) {
  test(`${name} declares the ITCSS layer order first`, () => {
    assert.equal(
      topLevelAtRules(css)[0],
      '@layer astrostyle.generic, astrostyle.elements, astrostyle.objects, astrostyle.components, astrostyle.utilities',
    )
  })

  test(`${name} puts every rule inside a framework layer`, () => {
    for (const rule of rules(css)) {
      assert.match(rule.layer ?? '', /^astrostyle\.[a-z]+$/, rule.selectors.join(', '))
    }
  })

  test(`${name} keeps the Generic layer at zero specificity, pseudo-elements aside`, () => {
    for (const rule of rules(css).filter((r) => r.layer === 'astrostyle.generic')) {
      for (const selector of rule.selectors) {
        const { a, b, c } = specificity(selector)
        const allowedC = hasPseudoElement(selector) ? 1 : 0
        assert.ok(a === 0 && b === 0 && c <= allowedC, `${selector} is (${a},${b},${c})`)
      }
    }
  })

  test(`${name} never exceeds one class of specificity`, () => {
    for (const rule of rules(css)) {
      for (const selector of rule.selectors) {
        const { a, b } = specificity(selector)
        assert.ok(a === 0 && b <= 1, `${selector} is (${a},${b})`)
      }
    }
  })
}
