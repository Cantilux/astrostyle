// Pagination, tabs and toast behavior in a DOM (happy-dom).
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { Window } from 'happy-dom'
import { autoInit } from '../js/auto-init/index.js'
import { createPagination } from '../js/pagination/index.js'
import { createTabs } from '../js/tabs/index.js'
import { createToaster } from '../js/toast/index.js'

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
