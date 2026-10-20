// Declarative setup: enhances every element that asks for it with a `data-ap-*` attribute.
import { createCombobox } from '../combobox/index.js'
import { createDialog } from '../dialog/index.js'
import { createMenu } from '../menu/index.js'
import { createPagination } from '../pagination/index.js'
import { createTabs } from '../tabs/index.js'
import { createTooltip } from '../tooltip/index.js'

/**
 * Page URL builder from a `data-ap-href` template such as `?page={page}`, or undefined without one.
 * @param {string | undefined} template
 */
function hrefFrom(template) {
  return template
    ? (/** @type {number} */ page) => template.replaceAll('{page}', String(page))
    : undefined
}

/**
 * @typedef {ReturnType<typeof createCombobox> | ReturnType<typeof createPagination> |
 *   ReturnType<typeof createTabs> | ReturnType<typeof createDialog> |
 *   ReturnType<typeof createMenu> | ReturnType<typeof createTooltip>} Handle
 */

/**
 * Pairs `selector` with the enhancer of the elements it matches; the selector guarantees that
 * every match is an `E`, the one place where a matched `Element` is narrowed.
 * @template {Element} E
 * @param {string} selector
 * @param {(node: E) => Handle} enhance
 * @returns {[string, (node: Element) => Handle]}
 */
function enhancer(selector, enhance) {
  return [selector, (node) => enhance(/** @type {E} */ (node))]
}

/** Enhancers by selector: each turns one element into a component and returns its handle. */
const enhancers = [
  enhancer('select[data-ap-combobox]', (/** @type {HTMLSelectElement} */ select) =>
    createCombobox(select, { creatable: select.hasAttribute('data-ap-creatable') }),
  ),
  enhancer('nav[data-ap-pagination]', (/** @type {HTMLElement} */ nav) =>
    createPagination(nav, {
      page: Number(nav.dataset.apPage) || 1,
      count: Number(nav.dataset.apCount) || 0,
      href: hrefFrom(nav.dataset.apHref),
    }),
  ),
  enhancer('[data-ap-tabs]', (/** @type {HTMLElement} */ root) =>
    createTabs(root, {
      activation: root.dataset.apTabs === 'manual' ? 'manual' : 'automatic',
    }),
  ),
  enhancer('dialog[data-ap-dialog]', (/** @type {HTMLDialogElement} */ dialog) =>
    createDialog(dialog, { dismissible: dialog.dataset.apDialog !== 'static' }),
  ),
  enhancer('[data-ap-menu]', (/** @type {HTMLElement} */ button) => createMenu(button)),
  enhancer('[data-ap-tooltip]', (/** @type {HTMLElement} */ trigger) => createTooltip(trigger)),
]

/**
 * Enhances, under `root`, every `select[data-ap-combobox]` (free text with `data-ap-creatable`),
 * `nav[data-ap-pagination]` (`data-ap-page`, `data-ap-count`, optional `data-ap-href` template
 * with `{page}`), `[data-ap-tabs]` (`data-ap-tabs="manual"` for manual activation) and
 * `dialog[data-ap-dialog]` (`data-ap-dialog="static"` keeps it open on a backdrop click), and the
 * buttons of menus (`data-ap-menu`) and the triggers of tooltips (`data-ap-tooltip`), each naming
 * the id of its popover. Returns
 * the handles; elements already enhanced (`data-ap-enhanced`) are skipped. An element that cannot
 * be enhanced (broken markup) is reported on the console and left as it is; the others go on.
 * @param {ParentNode} [root]
 */
export function autoInit(root = document) {
  /** @type {Handle[]} */
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
