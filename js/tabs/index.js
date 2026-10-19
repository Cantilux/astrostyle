// Tabs: turns a list of buttons and the panels after it into a WAI-ARIA tablist with a roving
// tabindex, arrow keys, Home and End. Contract: scss/components/tabs/README.md.
import { nextId, snapshotAttributes } from '../shared/dom.js'
import { targetForKey } from './navigation.js'

/** Attributes the module sets, restored by destroy(). */
const managed = [
  'role',
  'id',
  'aria-controls',
  'aria-labelledby',
  'aria-selected',
  'aria-orientation',
  'tabindex',
  'hidden',
]

/**
 * Whether a tab cannot be chosen.
 * @param {HTMLButtonElement} tab
 */
const isDisabled = (tab) => tab.disabled || tab.getAttribute('aria-disabled') === 'true'

/**
 * Enhances `root` (holding `.ap-c-tabs__list` with `.ap-c-tabs__tab` buttons and one
 * `.ap-c-tabs__panel` per tab, in order) and returns its handle. Options: `selected` (index),
 * `activation` (`automatic`, the default, or `manual`), `orientation` (`horizontal` or
 * `vertical`). `env.document` and `env.createId` can be injected for tests.
 * @param {HTMLElement} root
 * @param {{
 *   selected?: number,
 *   activation?: 'automatic' | 'manual',
 *   orientation?: 'horizontal' | 'vertical',
 * }} [options]
 * @param {{ document?: Document, createId?: () => string }} [env]
 */
export function createTabs(root, options = {}, env = {}) {
  const doc = env.document ?? root.ownerDocument
  const view = doc.defaultView ?? /** @type {Window & typeof globalThis} */ (globalThis)
  const createId = env.createId ?? (() => nextId('ap-tabs'))
  const activation = options.activation ?? 'automatic'
  const orientation = options.orientation ?? 'horizontal'
  const list = /** @type {HTMLElement} */ (root.querySelector('.ap-c-tabs__list'))
  const tabs = /** @type {HTMLButtonElement[]} */ ([...list.querySelectorAll('.ap-c-tabs__tab')])
  const panels = /** @type {HTMLElement[]} */ ([
    ...root.querySelectorAll('.ap-c-tabs__panel'),
  ]).filter((panel) => panel.closest('.ap-c-tabs') === root)
  if (tabs.length === 0 || tabs.length !== panels.length) {
    throw new Error(`createTabs: ${tabs.length} tabs for ${panels.length} panels`)
  }
  const restore = snapshotAttributes([list, ...tabs, ...panels], managed)

  const marked = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
  const firstEnabled = tabs.findIndex((tab) => !isDisabled(tab))
  let selected = options.selected ?? (marked >= 0 ? marked : firstEnabled)

  list.setAttribute('role', 'tablist')
  if (orientation === 'vertical') list.setAttribute('aria-orientation', 'vertical')
  tabs.forEach((tab, index) => {
    const panel = panels[index]
    if (!tab.id) tab.id = createId()
    if (!panel.id) panel.id = createId()
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)
    panel.setAttribute('tabindex', '0')
  })

  /**
   * Shows tab `index` and its panel; only the selected tab is in the Tab sequence.
   * @param {number} index
   */
  function show(index) {
    selected = index
    tabs.forEach((tab, position) => {
      const current = position === index
      tab.setAttribute('aria-selected', String(current))
      tab.setAttribute('tabindex', current ? '0' : '-1')
      panels[position].hidden = !current
    })
  }

  /**
   * Selects tab `index` after a user action and fires `ap:change`.
   * @param {number} index
   */
  function choose(index) {
    if (index === selected || isDisabled(tabs[index])) return
    const previous = selected
    show(index)
    root.dispatchEvent(
      new view.CustomEvent('ap:change', {
        bubbles: true,
        detail: { index, previous, tab: tabs[index], panel: panels[index] },
      }),
    )
  }

  /**
   * The tab button an event came from; the cast is checked by `indexOf` (-1 when none).
   * @param {Event} event
   */
  const tabOf = (event) =>
    /** @type {HTMLButtonElement} */ (
      /** @type {Element} */ (event.target).closest('.ap-c-tabs__tab')
    )

  /**
   * Selects a clicked tab.
   * @param {MouseEvent} event
   */
  function onClick(event) {
    const index = tabs.indexOf(tabOf(event))
    if (index >= 0) choose(index)
  }

  /**
   * Moves focus with the arrow keys, Home and End; selects too with automatic activation.
   * @param {KeyboardEvent} event
   */
  function onKeydown(event) {
    const from = tabs.indexOf(tabOf(event))
    if (from < 0) return
    const target = targetForKey(event.key, from, tabs.map(isDisabled), orientation)
    if (target === null) return
    event.preventDefault()
    tabs[target].focus()
    if (activation === 'automatic') choose(target)
  }

  list.addEventListener('click', onClick)
  list.addEventListener('keydown', onKeydown)
  show(selected)

  return {
    element: root,
    getSelected: () => selected,
    /**
     * Selects tab `index` without firing `ap:change` (programmatic update).
     * @param {number} index
     */
    select(index) {
      if (tabs[index]) show(index)
    },
    // Removes the behavior and restores the original attributes.
    destroy() {
      list.removeEventListener('click', onClick)
      list.removeEventListener('keydown', onKeydown)
      restore()
    },
  }
}
