// Declarative setup: enhances every element that asks for it with a `data-ap-*` attribute.
import { createCombobox } from '../combobox/index.js'
import { createDialog } from '../dialog/index.js'
import { createMenu } from '../menu/index.js'
import { createPagination } from '../pagination/index.js'
import { createTabs } from '../tabs/index.js'
import { createTooltip } from '../tooltip/index.js'

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
  [
    'dialog[data-ap-dialog]',
    (dialog) => createDialog(dialog, { dismissible: dialog.dataset.apDialog !== 'static' }),
  ],
  ['[data-ap-menu]', (button) => createMenu(button)],
  ['[data-ap-tooltip]', (trigger) => createTooltip(trigger)],
]

// Enhances, under `root`, every `select[data-ap-combobox]` (free text with `data-ap-creatable`),
// `nav[data-ap-pagination]` (`data-ap-page`, `data-ap-count`, optional `data-ap-href` template
// with `{page}`), `[data-ap-tabs]` (`data-ap-tabs="manual"` for manual activation) and
// `dialog[data-ap-dialog]` (`data-ap-dialog="static"` keeps it open on a backdrop click), and the
// buttons of menus (`data-ap-menu`) and the triggers of tooltips (`data-ap-tooltip`), each naming
// the id of its popover. Returns
// the handles; elements already enhanced (`data-ap-enhanced`) are skipped. An element that cannot
// be enhanced (broken markup) is reported on the console and left as it is; the others go on.
export function autoInit(root = document) {
  const handles = []
  for (const [selector, enhance] of enhancers) {
    for (const node of root.querySelectorAll(`${selector}:not([data-ap-enhanced])`)) {
      try {
        handles.push(enhance(node))
        node.setAttribute('data-ap-enhanced', '')
      } catch (error) {
        console.error('astrostyle autoInit:', error, node)
      }
    }
  }
  return handles
}
