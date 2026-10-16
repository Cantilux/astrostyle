// Test helpers that inspect compiled CSS: rules, their cascade layer and selector specificity.
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import { selectorSpecificity } from '@csstools/selector-specificity'

// Name of the innermost `@layer` block that contains `node`, or null when unlayered.
function layerOf(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'layer') return parent.params
  }
  return null
}

// Whether `rule` is a keyframe (`from`, `50%`) rather than a style rule.
const isKeyframe = (rule) => rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)

// Every style rule of `css` with its layer, selectors and declarations; keyframes are skipped.
export function rules(css) {
  const found = []
  postcss.parse(css).walkRules((rule) => {
    if (isKeyframe(rule)) return
    const declarations = {}
    rule.walkDecls((decl) => {
      if (decl.parent === rule) declarations[decl.prop] = decl.value
    })
    found.push({ layer: layerOf(rule), selectors: rule.selectors, declarations })
  })
  return found
}

// Declarations of the first rule whose selector list contains `selector`.
export function declarationsOf(css, selector) {
  const rule = rules(css).find((candidate) => candidate.selectors.includes(selector))
  return rule ? rule.declarations : null
}

// Specificity `{ a, b, c }` of a single selector.
export function specificity(selector) {
  const root = selectorParser().astSync(selector)
  return selectorSpecificity(root.first)
}

// Statements of `css` at the top level, as `@name params` strings for at-rules.
export function topLevelAtRules(css) {
  return postcss
    .parse(css)
    .nodes.filter((node) => node.type === 'atrule')
    .map((node) => `@${node.name} ${node.params}`)
}
