// Pagination: renders page links (or buttons) with previous and next steps into a <nav>, and
// fires `ap:page` when the user picks a page. Contract: scss/components/pagination/README.md.
import { element, windowOf } from '../shared/dom.js'
import { GAP, clampPage, pageWindow } from './range.js'

/** Default texts; every one can be replaced through `options.labels`. */
export const defaultLabels = {
  nav: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (/** @type {number} */ page) => `Page ${page}`,
}

/** Chevron icons of the previous and next steps. */
const chevrons = {
  previous: '<path d="M15 6l-6 6 6 6"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
}

/**
 * Enhances `nav` with a pagination control and returns its handle. Options: `page`, `count`,
 * `siblings`, `boundaries`, `href(page)` (render links instead of buttons), `labels`.
 * `env.document` can be injected for tests.
 * @param {HTMLElement} nav
 * @param {{
 *   page?: number,
 *   count?: number,
 *   siblings?: number,
 *   boundaries?: number,
 *   href?: (page: number) => string,
 *   labels?: Partial<typeof defaultLabels>,
 * }} [options]
 * @param {{ document?: Document }} [env]
 */
export function createPagination(nav, options = {}, env = {}) {
  const doc = env.document ?? nav.ownerDocument
  const view = windowOf(doc)
  const labels = { ...defaultLabels, ...options.labels }
  const { siblings = 1, boundaries = 1, href } = options
  const original = [...nav.childNodes]
  const hadLabel = nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby')
  const hadClass = nav.classList.contains('ap-c-pagination')

  let count = Math.max(Math.trunc(options.count ?? 0) || 0, 0)
  let page = clampPage(options.page ?? 1, count)

  const list = element(doc, 'ul', 'ap-c-pagination__list')
  nav.classList.add('ap-c-pagination')
  if (!hadLabel) nav.setAttribute('aria-label', labels.nav)

  /**
   * Link (or button) to `target`; `disabled` steps keep their place but do nothing.
   * @param {number} target
   * @param {string} className
   * @param {string} label
   */
  function control(target, className, label, disabled = false) {
    const node = element(doc, href ? 'a' : 'button', className, { 'aria-label': label })
    node.dataset.page = String(target)
    if (href) {
      if (disabled) node.setAttribute('aria-disabled', 'true')
      else node.setAttribute('href', href(target))
    } else {
      const button = /** @type {HTMLButtonElement} */ (node)
      button.type = 'button'
      button.disabled = disabled
    }
    return node
  }

  /**
   * Previous or next step with its chevron.
   * @param {'previous' | 'next'} direction
   */
  function step(direction) {
    const target = direction === 'previous' ? page - 1 : page + 1
    const disabled = target < 1 || target > count
    const node = control(
      clampPage(target, count),
      'ap-c-pagination__link ap-c-pagination__step',
      labels[direction],
      disabled,
    )
    node.dataset.step = direction
    node.innerHTML = `<svg class="ap-c-pagination__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${chevrons[direction]}</svg>`
    return node
  }

  // Rebuilds the list for the current page and count.
  function render() {
    /** @type {HTMLElement[]} */
    const items = [step('previous')]
    for (const entry of pageWindow({ page, count, siblings, boundaries })) {
      if (entry === GAP) {
        const gap = element(doc, 'span', 'ap-c-pagination__gap', { 'aria-hidden': 'true' })
        gap.textContent = '…'
        items.push(gap)
        continue
      }
      const node = control(entry, 'ap-c-pagination__link', labels.page(entry))
      node.textContent = String(entry)
      if (entry === page) node.setAttribute('aria-current', 'page')
      items.push(node)
    }
    items.push(step('next'))
    list.replaceChildren(
      ...items.map((node) => {
        const item = element(doc, 'li', 'ap-c-pagination__item')
        item.append(node)
        return item
      }),
    )
  }

  /**
   * Moves focus back into the list after a re-render: the same step if still enabled, else the
   * current page.
   * @param {string} [stepName]
   */
  function restoreFocus(stepName) {
    const same = stepName
      ? /** @type {HTMLButtonElement | null} */ (list.querySelector(`[data-step="${stepName}"]`))
      : null
    const usable = same && !same.disabled && same.getAttribute('aria-disabled') !== 'true'
    ;/** @type {HTMLElement | null} */ (
      usable ? same : list.querySelector('[aria-current="page"]')
    )?.focus()
  }

  /**
   * Handles a click on a page or a step.
   * @param {MouseEvent} event
   */
  function onClick(event) {
    const node = /** @type {HTMLButtonElement | null} */ (
      /** @type {Element} */ (event.target).closest('[data-page]')
    )
    if (!node || !list.contains(node)) return
    if (node.disabled || node.getAttribute('aria-disabled') === 'true') {
      event.preventDefault()
      return
    }
    const target = Number(node.dataset.page)
    if (target === page) {
      if (!href) event.preventDefault()
      return
    }
    const detail = { page: target, previous: page }
    const notCanceled = nav.dispatchEvent(
      new view.CustomEvent('ap:page', { bubbles: true, cancelable: true, detail }),
    )
    // Links navigate unless a listener takes over (client-side routing) by canceling `ap:page`.
    if (href && notCanceled) return
    event.preventDefault()
    if (!href && !notCanceled) return
    page = target
    render()
    restoreFocus(node.dataset.step)
  }

  nav.addEventListener('click', onClick)
  nav.replaceChildren(list)
  render()

  return {
    element: nav,
    getPage: () => page,
    getCount: () => count,
    /**
     * Shows `value` as the current page without firing `ap:page` (programmatic update).
     * @param {number} value
     */
    setPage(value) {
      page = clampPage(value, count)
      render()
    },
    /**
     * Changes the number of pages, keeping the current page in range.
     * @param {number} value
     */
    setCount(value) {
      count = Math.max(Math.trunc(value) || 0, 0)
      page = clampPage(page, count)
      render()
    },
    // Removes the control and gives the <nav> back its original content.
    destroy() {
      nav.removeEventListener('click', onClick)
      nav.replaceChildren(...original)
      if (!hadClass) nav.classList.remove('ap-c-pagination')
      if (!hadLabel) nav.removeAttribute('aria-label')
    },
  }
}

/** Options of `createPagination()`. @typedef {NonNullable<Parameters<typeof createPagination>[1]>} PaginationOptions */
/** Handle returned by `createPagination()`. @typedef {ReturnType<typeof createPagination>} PaginationHandle */
