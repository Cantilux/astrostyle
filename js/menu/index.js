// Menu: a button that opens a list of actions in a popover (WAI-ARIA menu button): arrow keys,
// Home and End move between items, a letter jumps to the next item starting with it, Escape or a
// click outside closes it and focus goes back to the button. Contract: scss/components/menu/README.md.
import { nextId, snapshotAttributes } from '../shared/dom.js'
import { positionNear } from '../shared/floating.js'
import { moveActive } from '../shared/navigation.js'
import { nextByLetter } from './typeahead.js'

/** Attributes the module sets, restored by destroy(). */
const managed = ['id', 'role', 'tabindex', 'aria-haspopup', 'aria-expanded', 'aria-controls']

// Whether an item cannot be chosen.
const isDisabled = (item) => item.disabled || item.getAttribute('aria-disabled') === 'true'

// Enhances `button` and returns its handle. The menu is `options.menu`, or the element whose id is
// in the button's `data-ap-menu`; it must have `popover` and hold `.ap-c-menu__item` buttons or
// links. Options: `side` (`bottom`, the default, or `top`). `env.createId` can be injected.
// Choosing an item fires `ap:select` on the menu with `{ item, value }` (the item's `value` or
// `data-value`), then closes it.
export function createMenu(button, options = {}, env = {}) {
  const doc = button.ownerDocument
  const view = doc.defaultView ?? globalThis
  const createId = env.createId ?? (() => nextId('ap-menu'))
  const menu = options.menu ?? doc.getElementById(button.dataset.apMenu)
  if (!menu) throw new Error('createMenu: no menu element')
  const side = options.side ?? 'bottom'
  const items = [...menu.querySelectorAll('.ap-c-menu__item')]
  const restore = snapshotAttributes([button, menu, ...items], managed)
  let open = false

  if (!menu.id) menu.id = createId()
  button.setAttribute('aria-haspopup', 'menu')
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-controls', menu.id)
  menu.setAttribute('role', 'menu')
  menu.setAttribute('tabindex', '-1')
  for (const item of items) {
    item.setAttribute('role', 'menuitem')
    item.setAttribute('tabindex', '-1')
  }

  // Fires `ap:<name>` on the menu.
  const emit = (name, detail = {}) =>
    menu.dispatchEvent(new view.CustomEvent(`ap:${name}`, { bubbles: true, detail }))

  // Item states for the pure navigation helpers.
  const states = () =>
    items.map((item) => ({ disabled: isDisabled(item), label: item.textContent }))

  // Moves focus to item `index`, when there is one.
  function focusItem(index) {
    if (index >= 0) items[index].focus()
  }

  // Opens the menu under the button and focuses its first (`first`) or last (`last`) item.
  function show(focus = 'first') {
    if (!open) {
      open = true
      menu.showPopover()
      positionNear(menu, button, { side, offset: 4 })
      button.setAttribute('aria-expanded', 'true')
      emit('open')
    }
    focusItem(moveActive(states(), -1, focus === 'last' ? -1 : 1))
  }

  // Closes the menu; `returnFocus` puts focus back on the button.
  function hide(returnFocus = false) {
    if (open) menu.hidePopover()
    closed(returnFocus)
  }

  // Updates the state once the menu is closed, by the module or by the browser (light dismiss,
  // Escape); focus goes back to the button when it was inside the menu.
  function closed(returnFocus) {
    if (!open) return
    open = false
    button.setAttribute('aria-expanded', 'false')
    if (returnFocus || menu.contains(doc.activeElement)) button.focus()
    emit('close')
  }

  // A press on the button of an open menu closes it through light dismiss before the click
  // arrives; remembering it keeps that click from opening the menu again.
  let pressedWhileOpen = false
  const onButtonPointerdown = () => {
    pressedWhileOpen = open
  }

  // Toggles the menu on a click on the button.
  function onButtonClick() {
    const wasOpen = open || pressedWhileOpen
    pressedWhileOpen = false
    if (wasOpen) hide(true)
    else show('first')
  }

  // Opens on ArrowDown (first item) or ArrowUp (last item).
  function onButtonKeydown(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    show(event.key === 'ArrowUp' ? 'last' : 'first')
  }

  // Moves between items, closes on Escape and Tab, and jumps by first letter.
  function onMenuKeydown(event) {
    const current = items.indexOf(doc.activeElement)
    const steps = { ArrowDown: 1, ArrowUp: -1 }
    if (event.key in steps) {
      event.preventDefault()
      focusItem(moveActive(states(), current, steps[event.key]))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusItem(moveActive(states(), -1, event.key === 'Home' ? 1 : -1))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      hide(true)
    } else if (event.key === 'Tab') {
      hide(false)
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      focusItem(nextByLetter(states(), current, event.key))
    }
  }

  // Chooses a clicked item: fires `ap:select` and closes.
  function onMenuClick(event) {
    const item = event.target.closest('.ap-c-menu__item')
    if (!item || !items.includes(item)) return
    if (isDisabled(item)) {
      event.preventDefault()
      return
    }
    emit('select', { item, value: item.value || item.dataset.value || '' })
    hide(true)
  }

  // Follows a close done by the browser (click outside, Escape).
  const onToggle = (event) => {
    if (event.newState === 'closed') closed(false)
  }

  button.addEventListener('pointerdown', onButtonPointerdown)
  button.addEventListener('click', onButtonClick)
  button.addEventListener('keydown', onButtonKeydown)
  menu.addEventListener('keydown', onMenuKeydown)
  menu.addEventListener('click', onMenuClick)
  menu.addEventListener('toggle', onToggle)

  return {
    element: button,
    menu,
    open: show,
    close: () => hide(false),
    isOpen: () => open,
    // Closes the menu, removes the behavior and restores the original attributes.
    destroy() {
      hide(false)
      button.removeEventListener('pointerdown', onButtonPointerdown)
      button.removeEventListener('click', onButtonClick)
      button.removeEventListener('keydown', onButtonKeydown)
      menu.removeEventListener('keydown', onMenuKeydown)
      menu.removeEventListener('click', onMenuClick)
      menu.removeEventListener('toggle', onToggle)
      restore()
    },
  }
}
