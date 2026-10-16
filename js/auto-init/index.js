// Declarative setup: enhances every element that asks for it with a `data-ap-*` attribute.
import { createCombobox } from '../combobox/index.js'
import { createPagination } from '../pagination/index.js'
import { createTabs } from '../tabs/index.js'

// Page URL from a `data-ap-href` template such as `?page={page}`, or null without one.
function hrefFrom(template) {
  return template ? (page) => template.replaceAll('{page}', String(page)) : undefined
}

/** Enhancers by selector: each turns one element into a component and returns its handle. */
const enhancers = [
  [
    'select[data-ap-combobox]',
    (select) => createCombobox(select, { creatable: select.hasAttribute('data-ap-creatable') }),
  ],
  [
    'nav[data-ap-pagination]',
    (nav) =>
      createPagination(nav, {
        page: Number(nav.dataset.apPage) || 1,
        count: Number(nav.dataset.apCount) || 0,
        href: hrefFrom(nav.dataset.apHref),
      }),
  ],
  [
    '[data-ap-tabs]',
    (root) =>
      createTabs(root, {
        activation: root.dataset.apTabs === 'manual' ? 'manual' : 'automatic',
      }),
  ],
]

// Enhances, under `root`, every `select[data-ap-combobox]` (free text with `data-ap-creatable`),
// `nav[data-ap-pagination]` (`data-ap-page`, `data-ap-count`, optional `data-ap-href` template
// with `{page}`) and `[data-ap-tabs]` (`data-ap-tabs="manual"` for manual activation). Returns
// the handles; elements already enhanced (`data-ap-enhanced`) are skipped.
export function autoInit(root = document) {
  const handles = []
  for (const [selector, enhance] of enhancers) {
    for (const node of root.querySelectorAll(`${selector}:not([data-ap-enhanced])`)) {
      node.setAttribute('data-ap-enhanced', '')
      handles.push(enhance(node))
    }
  }
  return handles
}
