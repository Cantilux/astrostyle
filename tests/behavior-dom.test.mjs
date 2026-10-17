// Pagination, tabs, toast, dialog, menu and tooltip behavior in a DOM (happy-dom).
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { Window } from 'happy-dom'
import { autoInit } from '../js/auto-init/index.js'
import { createDialog } from '../js/dialog/index.js'
import { createMenu } from '../js/menu/index.js'
import { createPagination } from '../js/pagination/index.js'
import { createTabs } from '../js/tabs/index.js'
import { createToaster } from '../js/toast/index.js'
import { createTooltip } from '../js/tooltip/index.js'

let window
let document

beforeEach(() => {
  window = new Window()
  document = window.document
})

afterEach(() => window.happyDOM.close())

// Presses `key` on `target`.
function press(target, key) {
  target.dispatchEvent(
    new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  )
}

// Visible labels of a pagination: page numbers, gaps and step names.
const pagination = (nav) =>
  [...nav.querySelectorAll('.ap-c-pagination__item > *')].map((node) =>
    node.dataset.step ? node.dataset.step : node.textContent,
  )

test('pagination renders steps, pages and gaps, marking the current page', () => {
  document.body.innerHTML = '<nav id="p"></nav>'
  const nav = document.getElementById('p')
  createPagination(nav, { page: 5, count: 10 }, { document })
  assert.deepEqual(pagination(nav), ['previous', '1', '…', '4', '5', '6', '…', '10', 'next'])
  assert.equal(nav.getAttribute('aria-label'), 'Pagination')
  assert.equal(nav.querySelector('[aria-current="page"]').textContent, '5')
  assert.equal(nav.querySelector('[aria-current="page"]').getAttribute('aria-label'), 'Page 5')
  assert.equal(nav.querySelector('.ap-c-pagination__gap').getAttribute('aria-hidden'), 'true')
})

test('pagination buttons move pages, fire ap:page and disable the step at each end', () => {
  document.body.innerHTML = '<nav id="p"></nav>'
  const nav = document.getElementById('p')
  const handle = createPagination(nav, { page: 1, count: 3 }, { document })
  const pages = []
  nav.addEventListener('ap:page', (event) => pages.push(event.detail))
  assert.equal(nav.querySelector('[data-step="previous"]').disabled, true)
  nav.querySelector('[data-step="next"]').click()
  nav.querySelector('[data-page="3"]:not([data-step])').click()
  assert.equal(handle.getPage(), 3)
  assert.equal(nav.querySelector('[data-step="next"]').disabled, true)
  assert.deepEqual(pages, [
    { page: 2, previous: 1 },
    { page: 3, previous: 2 },
  ])
})

test('canceling ap:page keeps buttons on the current page', () => {
  document.body.innerHTML = '<nav id="p"></nav>'
  const nav = document.getElementById('p')
  const handle = createPagination(nav, { page: 1, count: 3 }, { document })
  nav.addEventListener('ap:page', (event) => event.preventDefault())
  nav.querySelector('[data-step="next"]').click()
  assert.equal(handle.getPage(), 1)
})

test('pagination with href renders links; canceling ap:page turns them into client routing', () => {
  document.body.innerHTML = '<nav id="p" aria-label="Results"></nav>'
  const nav = document.getElementById('p')
  const handle = createPagination(
    nav,
    { page: 1, count: 4, href: (page) => `?page=${page}` },
    { document },
  )
  const previous = nav.querySelector('[data-step="previous"]')
  assert.equal(previous.tagName, 'A')
  assert.equal(previous.hasAttribute('href'), false)
  assert.equal(previous.getAttribute('aria-disabled'), 'true')
  assert.equal(nav.querySelector('[data-step="next"]').getAttribute('href'), '?page=2')
  assert.equal(nav.getAttribute('aria-label'), 'Results')
  nav.addEventListener('ap:page', (event) => event.preventDefault())
  const click = new window.MouseEvent('click', { bubbles: true, cancelable: true })
  nav.querySelector('[data-step="next"]').dispatchEvent(click)
  assert.equal(click.defaultPrevented, true)
  assert.equal(handle.getPage(), 2)
})

test('setPage, setCount and destroy', () => {
  document.body.innerHTML = '<nav id="p"><a href="?page=2">Next</a></nav>'
  const nav = document.getElementById('p')
  const handle = createPagination(nav, { page: 1, count: 9 }, { document })
  handle.setPage(7)
  assert.equal(nav.querySelector('[aria-current="page"]').textContent, '7')
  handle.setCount(4)
  assert.equal(handle.getPage(), 4)
  handle.destroy()
  assert.equal(nav.innerHTML, '<a href="?page=2">Next</a>')
  assert.equal(nav.hasAttribute('aria-label'), false)
  assert.equal(nav.classList.contains('ap-c-pagination'), false)
})

const tabsMarkup = `
  <div class="ap-c-tabs" id="t">
    <div class="ap-c-tabs__list" aria-label="Ship">
      <button class="ap-c-tabs__tab" type="button">Crew</button>
      <button class="ap-c-tabs__tab" type="button" disabled>Vault</button>
      <button class="ap-c-tabs__tab" type="button">Cargo</button>
    </div>
    <div class="ap-c-tabs__panel">Crew panel</div>
    <div class="ap-c-tabs__panel">Vault panel</div>
    <div class="ap-c-tabs__panel">Cargo panel</div>
  </div>`

// Enhances the test tabs and returns handy references.
function setupTabs(options = {}) {
  document.body.innerHTML = tabsMarkup
  let id = 0
  const root = document.getElementById('t')
  const handle = createTabs(root, options, { document, createId: () => `x${(id += 1)}` })
  return {
    root,
    handle,
    tabs: [...root.querySelectorAll('[role="tab"]')],
    panels: [...root.querySelectorAll('[role="tabpanel"]')],
  }
}

test('tabs get roles, ids, links between tab and panel and a roving tabindex', () => {
  const { root, tabs, panels } = setupTabs()
  assert.equal(root.querySelector('.ap-c-tabs__list').getAttribute('role'), 'tablist')
  assert.equal(tabs[0].getAttribute('aria-controls'), panels[0].id)
  assert.equal(panels[0].getAttribute('aria-labelledby'), tabs[0].id)
  assert.deepEqual(
    tabs.map((tab) => [tab.getAttribute('aria-selected'), tab.getAttribute('tabindex')]),
    [
      ['true', '0'],
      ['false', '-1'],
      ['false', '-1'],
    ],
  )
  assert.deepEqual(
    panels.map((panel) => panel.hidden),
    [false, true, true],
  )
})

test('arrows skip disabled tabs and select with automatic activation', () => {
  const { root, tabs, panels, handle } = setupTabs()
  const changes = []
  root.addEventListener('ap:change', (event) =>
    changes.push([event.detail.index, event.detail.previous]),
  )
  press(tabs[0], 'ArrowRight')
  assert.equal(handle.getSelected(), 2)
  assert.equal(document.activeElement, tabs[2])
  assert.equal(panels[2].hidden, false)
  press(tabs[2], 'Home')
  assert.equal(handle.getSelected(), 0)
  assert.deepEqual(changes, [
    [2, 0],
    [0, 2],
  ])
})

test('manual activation moves focus only; a click selects', () => {
  const { tabs, handle } = setupTabs({ activation: 'manual' })
  press(tabs[0], 'End')
  assert.equal(document.activeElement, tabs[2])
  assert.equal(handle.getSelected(), 0)
  tabs[2].click()
  assert.equal(handle.getSelected(), 2)
})

test('tabs start on the tab marked aria-selected and destroy restores the markup', () => {
  document.body.innerHTML = tabsMarkup.replace(
    'type="button">Cargo',
    'type="button" aria-selected="true">Cargo',
  )
  const root = document.getElementById('t')
  const handle = createTabs(root, {}, { document })
  assert.equal(handle.getSelected(), 2)
  handle.destroy()
  const tab = root.querySelector('.ap-c-tabs__tab')
  assert.equal(tab.hasAttribute('role'), false)
  assert.equal(tab.hasAttribute('tabindex'), false)
  assert.equal(root.querySelector('.ap-c-tabs__panel').hidden, false)
})

test('tabs refuse a mismatched number of panels', () => {
  document.body.innerHTML =
    '<div id="t"><div class="ap-c-tabs__list"><button class="ap-c-tabs__tab">A</button></div></div>'
  assert.throws(() => createTabs(document.getElementById('t'), {}, { document }), /1 tabs for 0/)
})

// Fake timers: run() fires every pending timer.
function fakeTimers() {
  const pending = new Map()
  let id = 0
  return {
    setTimeout: (callback, delay) => {
      id += 1
      pending.set(id, { callback, delay })
      return id
    },
    clearTimeout: (timer) => pending.delete(timer),
    pending,
    run() {
      for (const [timer, { callback }] of [...pending]) {
        pending.delete(timer)
        callback()
      }
    },
  }
}

test('toasts appear in a polite region, with text content only', () => {
  const timers = fakeTimers()
  const toaster = createToaster({}, { document, ...timers })
  const region = toaster.element
  assert.equal(region.parentNode, document.body)
  assert.equal(region.getAttribute('aria-live'), 'polite')
  assert.equal(region.getAttribute('aria-label'), 'Notifications')
  const toast = toaster.show({ title: 'Docked', message: '<b>safe</b>', tone: 'success' }).element
  assert.ok(toast.classList.contains('ap-c-toast--success'))
  assert.equal(toast.querySelector('.ap-c-toast__message').textContent, '<b>safe</b>')
  assert.equal(toast.querySelector('.ap-c-toast__close').getAttribute('aria-label'), 'Dismiss')
  assert.equal(toast.hasAttribute('role'), false)
  assert.equal(
    toaster.show({ message: 'Breach', urgent: true }).element.getAttribute('role'),
    'alert',
  )
})

test('toasts close after their duration, pause while hovered and fire ap:open/ap:close', () => {
  const timers = fakeTimers()
  const toaster = createToaster({ duration: 3000 }, { document, ...timers })
  const events = []
  toaster.element.addEventListener('ap:open', () => events.push('open'))
  toaster.element.addEventListener('ap:close', () => events.push('close'))
  const toast = toaster.show({ message: 'Scan done' }).element
  assert.deepEqual(
    [...timers.pending.values()].map((t) => t.delay),
    [3000],
  )
  toast.dispatchEvent(new window.PointerEvent('pointerenter'))
  assert.equal(timers.pending.size, 0)
  toast.dispatchEvent(new window.PointerEvent('pointerleave'))
  timers.run()
  assert.equal(toast.isConnected, false)
  assert.deepEqual(events, ['open', 'close'])
})

test('extra toasts wait for room; duration 0 keeps a toast until dismissed', () => {
  const timers = fakeTimers()
  const toaster = createToaster({ max: 1, duration: 0 }, { document, ...timers })
  const first = toaster.show({ message: 'One' })
  const second = toaster.show({ message: 'Two' })
  assert.equal(second.element.isConnected, false)
  assert.equal(timers.pending.size, 0)
  first.element.querySelector('.ap-c-toast__close').click()
  assert.equal(second.element.isConnected, true)
  toaster.destroy()
  assert.equal(toaster.element.isConnected, false)
})

test('a toast action runs its callback and closes the toast', () => {
  const toaster = createToaster({}, { document, ...fakeTimers() })
  let undone = false
  const toast = toaster.show({
    message: 'Cargo sold',
    action: { label: 'Undo', onClick: () => (undone = true) },
  })
  toast.element.querySelector('.ap-c-toast__action').click()
  assert.equal(undone, true)
  assert.equal(toast.element.isConnected, false)
})

test('autoInit enhances pagination and tabs from data attributes', () => {
  document.body.innerHTML = `<nav data-ap-pagination data-ap-page="2" data-ap-count="5" data-ap-href="/log/{page}"></nav>${tabsMarkup.replace('class="ap-c-tabs" id="t"', 'class="ap-c-tabs" id="t" data-ap-tabs="manual"')}`
  const handles = autoInit(document)
  assert.equal(handles.length, 2)
  assert.equal(document.querySelector('[data-step="next"]').getAttribute('href'), '/log/3')
  assert.equal(document.querySelector('[role="tablist"]').getAttribute('role'), 'tablist')
  assert.equal(autoInit(document).length, 0)
})

test('autoInit reports broken markup and still enhances the other elements', (t) => {
  const errors = []
  t.mock.method(console, 'error', (...args) => errors.push(args))
  const broken =
    '<div class="ap-c-tabs" data-ap-tabs><div class="ap-c-tabs__list"><button class="ap-c-tabs__tab">A</button></div></div>'
  document.body.innerHTML =
    broken + tabsMarkup.replace('class="ap-c-tabs" id="t"', 'class="ap-c-tabs" id="t" data-ap-tabs')
  const handles = autoInit(document)
  assert.equal(handles.length, 1)
  assert.equal(errors.length, 1)
  assert.equal(document.querySelector('#t [role="tablist"]').getAttribute('role'), 'tablist')
  assert.equal(document.querySelector('[data-ap-tabs]').hasAttribute('data-ap-enhanced'), false)
})

// A page with an opener, a dialog with a close button, and focus on the opener.
function dialogPage() {
  document.body.innerHTML = `
    <button id="opener" data-ap-dialog-open="d">Open</button>
    <dialog id="d" class="ap-c-dialog">
      <p>Jump now?</p>
      <button id="yes" data-ap-dialog-close value="jump">Jump</button>
    </dialog>`
  document.getElementById('opener').focus()
  return document.getElementById('d')
}

test('an opener shows the dialog as modal and a close button returns its value', () => {
  const dialog = dialogPage()
  const handle = createDialog(dialog, {}, { document })
  const events = []
  dialog.addEventListener('ap:open', () => events.push('open'))
  dialog.addEventListener('ap:close', (event) => events.push(event.detail.returnValue))
  document.getElementById('opener').click()
  assert.equal(handle.isOpen(), true)
  document.getElementById('yes').click()
  assert.equal(handle.isOpen(), false)
  assert.deepEqual(events, ['open', 'jump'])
})

test('closing the dialog puts focus back on the element that opened it', () => {
  const dialog = dialogPage()
  const handle = createDialog(dialog, {}, { document })
  handle.open()
  document.getElementById('yes').focus()
  handle.close('later')
  assert.equal(document.activeElement.id, 'opener')
  assert.equal(dialog.returnValue, 'later')
})

test('a click on the backdrop closes a dismissible dialog only', () => {
  const dialog = dialogPage()
  const box = { left: 100, right: 300, top: 100, bottom: 200 }
  dialog.getBoundingClientRect = () => box
  // Clicks on the dialog element itself at (x, y): inside its box or on the backdrop.
  const clickAt = (x, y) =>
    dialog.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX: x, clientY: y }))
  const handle = createDialog(dialog, {}, { document })
  handle.open()
  clickAt(150, 150)
  assert.equal(handle.isOpen(), true, 'a click on the padding keeps it open')
  clickAt(10, 10)
  assert.equal(handle.isOpen(), false)
  handle.destroy()
  const fixed = createDialog(dialog, { dismissible: false }, { document })
  fixed.open()
  clickAt(10, 10)
  assert.equal(fixed.isOpen(), true)
})

test('destroy() stops the openers', () => {
  const dialog = dialogPage()
  createDialog(dialog, {}, { document }).destroy()
  document.getElementById('opener').click()
  assert.equal(dialog.open, false)
})

test('autoInit enhances dialogs; data-ap-dialog="static" ignores backdrop clicks', () => {
  const dialog = dialogPage()
  dialog.setAttribute('data-ap-dialog', 'static')
  dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 200 })
  const [handle] = autoInit(document)
  document.getElementById('opener').click()
  dialog.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX: 1, clientY: 1 }))
  assert.equal(handle.isOpen(), true)
  assert.ok(dialog.hasAttribute('data-ap-enhanced'))
})

// happy-dom has no Popover API: a minimal stand-in that tracks the state and fires `toggle`.
function stubPopover() {
  const proto = window.HTMLElement.prototype
  // Fires `toggle` with `newState` on `node`.
  const toggle = (node, newState) => {
    const event = new window.Event('toggle')
    event.newState = newState
    node.dispatchEvent(event)
  }
  proto.showPopover = function showPopover() {
    this.popoverOpen = true
    toggle(this, 'open')
  }
  proto.hidePopover = function hidePopover() {
    this.popoverOpen = false
    toggle(this, 'closed')
  }
}

// A menu button and its menu, with a disabled item.
function menuPage() {
  stubPopover()
  document.body.innerHTML = `
    <button id="ship" data-ap-menu="ship-menu">Ship</button>
    <div id="ship-menu" class="ap-c-menu" popover>
      <button class="ap-c-menu__item" value="rename">Rename</button>
      <button class="ap-c-menu__item" aria-disabled="true">Repair</button>
      <button class="ap-c-menu__item" value="refuel">Refuel</button>
      <button class="ap-c-menu__item" value="scrap">Scrap</button>
    </div>`
  return document.getElementById('ship')
}

// Text of the focused element.
const focused = () => document.activeElement.textContent.trim()

test('the menu button opens the menu on the first item and wires the ARIA roles', () => {
  const button = menuPage()
  const handle = createMenu(button, {}, { createId: () => 'x' })
  const menu = document.getElementById('ship-menu')
  assert.equal(button.getAttribute('aria-haspopup'), 'menu')
  assert.equal(button.getAttribute('aria-controls'), 'ship-menu')
  assert.equal(menu.getAttribute('role'), 'menu')
  assert.ok([...menu.children].every((item) => item.getAttribute('role') === 'menuitem'))
  button.click()
  assert.equal(handle.isOpen(), true)
  assert.equal(menu.popoverOpen, true)
  assert.equal(button.getAttribute('aria-expanded'), 'true')
  assert.equal(focused(), 'Rename')
})

test('menu keys move over enabled items, jump by letter and close on Escape', () => {
  const button = menuPage()
  const handle = createMenu(button)
  press(button, 'ArrowUp')
  assert.equal(focused(), 'Scrap')
  press(document.activeElement, 'ArrowDown')
  assert.equal(focused(), 'Rename')
  press(document.activeElement, 'ArrowDown')
  assert.equal(focused(), 'Refuel', 'skips the disabled item')
  press(document.activeElement, 'Home')
  press(document.activeElement, 'r')
  assert.equal(focused(), 'Refuel')
  press(document.activeElement, 'Escape')
  assert.equal(handle.isOpen(), false)
  assert.equal(button.getAttribute('aria-expanded'), 'false')
  assert.equal(document.activeElement, button)
})

test('choosing an item fires ap:select and closes; a disabled item does nothing', () => {
  const button = menuPage()
  const handle = createMenu(button)
  const menu = document.getElementById('ship-menu')
  const chosen = []
  menu.addEventListener('ap:select', (event) => chosen.push(event.detail.value))
  button.click()
  menu.children[1].click()
  assert.equal(handle.isOpen(), true)
  menu.children[2].click()
  assert.deepEqual(chosen, ['refuel'])
  assert.equal(handle.isOpen(), false)
  assert.equal(document.activeElement, button)
})

test('a close by the browser (light dismiss) updates the button; destroy() restores it', () => {
  const button = menuPage()
  const handle = createMenu(button)
  const menu = document.getElementById('ship-menu')
  button.click()
  menu.hidePopover()
  assert.equal(handle.isOpen(), false)
  assert.equal(button.getAttribute('aria-expanded'), 'false')
  handle.destroy()
  assert.equal(button.hasAttribute('aria-haspopup'), false)
  assert.equal(menu.hasAttribute('role'), false)
  assert.equal(menu.children[0].hasAttribute('tabindex'), false)
})

// A trigger with its tooltip, and fake timers that run on demand.
function tooltipPage() {
  stubPopover()
  document.body.innerHTML = `
    <button id="scan" data-ap-tooltip="scan-tip" aria-describedby="scan-tip">Scan</button>
    <span id="scan-tip" class="ap-c-tooltip" role="tooltip" popover="manual">Long-range scan</span>`
  const timers = []
  const env = {
    setTimeout: (callback, ms) => timers.push({ callback, ms }) - 1,
    clearTimeout: (index) => {
      if (timers[index]) timers[index].callback = null
    },
  }
  // Runs the pending timers.
  const flush = () => timers.splice(0).forEach((timer) => timer.callback?.())
  return { trigger: document.getElementById('scan'), env, flush }
}

test('a tooltip shows after the hover delay and right away on focus', () => {
  const { trigger, env, flush } = tooltipPage()
  const handle = createTooltip(trigger, {}, env)
  const tip = document.getElementById('scan-tip')
  trigger.dispatchEvent(new window.Event('pointerenter'))
  assert.equal(handle.isOpen(), false)
  flush()
  assert.equal(handle.isOpen(), true)
  assert.ok(tip.style.top.endsWith('px'))
  assert.ok(tip.hasAttribute('data-ap-side'))
  trigger.dispatchEvent(new window.Event('pointerleave'))
  tip.dispatchEvent(new window.Event('pointerenter'))
  flush()
  assert.equal(handle.isOpen(), true, 'stays while the pointer is on the tooltip')
  handle.hide()
  trigger.dispatchEvent(new window.FocusEvent('focusin'))
  assert.equal(handle.isOpen(), true)
  trigger.dispatchEvent(new window.FocusEvent('focusout'))
  assert.equal(handle.isOpen(), false)
})

test('Escape hides a tooltip; autoInit wires tooltips and menus', () => {
  const { trigger } = tooltipPage()
  document.body.insertAdjacentHTML(
    'beforeend',
    '<button data-ap-menu="m">More</button><div id="m" class="ap-c-menu" popover><button class="ap-c-menu__item">One</button></div>',
  )
  const handles = autoInit(document)
  assert.equal(handles.length, 2)
  const tooltip = handles.find((handle) => handle.tooltip)
  trigger.dispatchEvent(new window.FocusEvent('focusin'))
  press(document.body, 'Escape')
  assert.equal(tooltip.isOpen(), false)
  assert.ok(trigger.hasAttribute('data-ap-enhanced'))
})
