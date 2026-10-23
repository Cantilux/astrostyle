// Dialog, menu and tooltip in real browsers: top layer, inert page, light dismiss, real geometry.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eachBrowser } from '../helpers/browser.mjs'

const dialog = (mode = '') => `
  <button id="opener" class="ap-c-button" type="button" data-ap-dialog-open="jump">Jump</button>
  <button id="behind" class="ap-c-button" type="button">Behind</button>
  <dialog class="ap-c-dialog" id="jump" aria-labelledby="jump-title" data-ap-dialog="${mode}">
    <header class="ap-c-dialog__header">
      <h2 class="ap-c-dialog__title" id="jump-title">Jump to sector 7G?</h2>
    </header>
    <div class="ap-c-dialog__body"><p>The drive needs two cycles to cool down.</p></div>
    <footer class="ap-c-dialog__footer">
      <button id="cancel" class="ap-c-button" type="button" data-ap-dialog-close value="cancel">Cancel</button>
      <button id="confirm" class="ap-c-button" type="button" data-ap-dialog-close value="jump">Jump</button>
    </footer>
  </dialog>`

// A menu button placed with inline `style`, so tests can push it against a viewport edge.
const menu = (style = 'margin: 16px') => `
  <button id="ship" class="ap-c-button" type="button" data-ap-menu="ship-menu" style="${style}">Ship</button>
  <div class="ap-c-menu" id="ship-menu" popover>
    <button class="ap-c-menu__item" type="button" value="rename">Rename</button>
    <button class="ap-c-menu__item" type="button" value="refuel">Refuel</button>
    <button class="ap-c-menu__item" type="button" value="scrap">Scrap</button>
  </div>
  <button id="outside" class="ap-c-button" type="button" style="position: fixed; inset: auto 8px 8px auto">Outside</button>`

// A tooltip trigger placed with inline `style`, so tests can push it against a viewport edge.
const tooltip = (style = 'margin: 200px') => `
  <button id="scan" class="ap-c-button" type="button" aria-labelledby="scan-tip" data-ap-tooltip="scan-tip" style="${style}">Scan</button>
  <span class="ap-c-tooltip" id="scan-tip" role="tooltip" popover="manual">Long-range scan</span>`

// Viewport box of the element matching `selector`.
const box = (page, selector) =>
  page.$eval(selector, (node) => node.getBoundingClientRect().toJSON())

// Id of the focused element.
const focused = (page) => page.evaluate(() => document.activeElement?.id)

// Whether the popover matching `selector` is open.
const isOpen = (page, selector) => page.$eval(selector, (node) => node.matches(':popover-open'))

// Waits until `predicate(arg)` is true in the page. Closing a dialog or a popover fires its
// `close` or `toggle` event in a later task, so the modules react after the input that caused it.
const until = (page, predicate, arg) => page.waitForFunction(predicate, arg, { timeout: 2000 })

// Asserts that `inner` lies entirely inside the 800 × 600 viewport of the test pages.
function assertInViewport(inner) {
  assert.ok(inner.left >= 0 && inner.top >= 0, `starts inside: ${JSON.stringify(inner)}`)
  assert.ok(inner.right <= 800 && inner.bottom <= 600, `ends inside: ${JSON.stringify(inner)}`)
}

eachBrowser((context) => {
  test('dialog opens modal from its opener, makes the page inert and moves focus inside', async () => {
    const { page } = context
    await context.open(dialog())
    await page.click('#opener')
    assert.equal(await page.$eval('#jump', (node) => node.matches(':modal')), true)
    assert.equal(
      await page.evaluate(() => document.querySelector('#jump').contains(document.activeElement)),
      true,
    )
    const behind = await box(page, '#behind')
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('dialog')?.id,
      { x: behind.left + 4, y: behind.top + 4 },
    )
    assert.equal(hit, 'jump')
  })

  test('dialog closes on Escape with an empty return value and focus goes back', async () => {
    const { page } = context
    await context.open(dialog())
    await page.evaluate(() => {
      window.closes = []
      document
        .querySelector('#jump')
        .addEventListener('ap:close', (event) => window.closes.push(event.detail.returnValue))
    })
    await page.click('#opener')
    await page.keyboard.press('Escape')
    await until(page, () => window.closes.length > 0)
    assert.equal(await page.$eval('#jump', (node) => node.open), false)
    assert.deepEqual(await page.evaluate(() => window.closes), [''])
    assert.equal(await focused(page), 'opener')
  })

  test('dialog close buttons set the return value and focus goes back to the opener', async () => {
    const { page } = context
    await context.open(dialog())
    await page.click('#opener')
    await page.click('#confirm')
    await until(page, () => document.activeElement?.id === 'opener')
    assert.equal(await page.$eval('#jump', (node) => node.returnValue), 'jump')
  })

  test('dialog closes on a backdrop click, but not when the press starts inside', async () => {
    const { page } = context
    await context.open(dialog())
    await page.click('#opener')
    const body = await box(page, '#jump .ap-c-dialog__body')
    await page.mouse.move(body.left + 8, body.top + 8)
    await page.mouse.down()
    await page.mouse.move(4, 4)
    await page.mouse.up()
    assert.equal(await page.$eval('#jump', (node) => node.open), true)
    await page.mouse.click(4, 4)
    await until(page, () => !document.querySelector('#jump').open)
  })

  test('a static dialog ignores backdrop clicks', async () => {
    const { page } = context
    await context.open(dialog('static'))
    await page.click('#opener')
    await page.mouse.click(4, 4)
    assert.equal(await page.$eval('#jump', (node) => node.open), true)
  })

  test('menu opens in the top layer under its button and focuses the first item', async () => {
    const { page } = context
    await context.open(menu())
    await page.click('#ship')
    assert.equal(await isOpen(page, '#ship-menu'), true)
    assert.equal(await page.$eval('#ship', (node) => node.getAttribute('aria-expanded')), 'true')
    assert.equal(await page.evaluate(() => document.activeElement.value), 'rename')
    const button = await box(page, '#ship')
    const list = await box(page, '#ship-menu')
    assert.equal(await page.$eval('#ship-menu', (node) => node.dataset.apSide), 'bottom')
    assert.ok(list.top >= button.bottom, 'below the button')
    assertInViewport(list)
  })

  test('menu keyboard: arrows move, Enter chooses, focus returns to the button', async () => {
    const { page } = context
    await context.open(menu())
    await page.evaluate(() => {
      window.chosen = []
      document
        .querySelector('#ship-menu')
        .addEventListener('ap:select', (event) => window.chosen.push(event.detail.value))
    })
    await page.focus('#ship')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    assert.deepEqual(await page.evaluate(() => window.chosen), ['refuel'])
    assert.equal(await isOpen(page, '#ship-menu'), false)
    assert.equal(await focused(page), 'ship')
  })

  test('menu closes on a click outside (light dismiss)', async () => {
    const { page } = context
    await context.open(menu())
    await page.click('#ship')
    await page.click('#outside')
    await until(
      page,
      () => document.querySelector('#ship').getAttribute('aria-expanded') === 'false',
    )
    assert.equal(await isOpen(page, '#ship-menu'), false)
  })

  test('a second click on the button closes the menu instead of reopening it', async () => {
    const { page } = context
    await context.open(menu())
    await page.click('#ship')
    await page.click('#ship')
    await until(
      page,
      () => document.querySelector('#ship').getAttribute('aria-expanded') === 'false',
    )
    assert.equal(await isOpen(page, '#ship-menu'), false)
  })

  test('menu flips above a button at the bottom edge of the viewport', async () => {
    const { page } = context
    await context.open(menu('position: fixed; inset: auto auto 8px 16px'))
    await page.click('#ship')
    const button = await box(page, '#ship')
    const list = await box(page, '#ship-menu')
    assert.equal(await page.$eval('#ship-menu', (node) => node.dataset.apSide), 'top')
    assert.ok(list.bottom <= button.top, 'above the button')
    assertInViewport(list)
  })

  test('tooltip shows on hover after its delay, centered above the trigger, and hides on leave', async () => {
    const { page } = context
    await context.open(tooltip())
    await page.hover('#scan')
    await until(page, () => document.querySelector('#scan-tip').matches(':popover-open'))
    const trigger = await box(page, '#scan')
    const tip = await box(page, '#scan-tip')
    assert.equal(await page.$eval('#scan-tip', (node) => node.dataset.apSide), 'top')
    assert.ok(tip.bottom <= trigger.top, 'above the trigger')
    const offCenter = tip.left + tip.width / 2 - (trigger.left + trigger.width / 2)
    assert.ok(Math.abs(offCenter) <= 1, `centered (off by ${offCenter}px)`)
    await page.mouse.move(4, 590)
    await until(page, () => !document.querySelector('#scan-tip').matches(':popover-open'))
  })

  test('tooltip shows at once on focus and hides on Escape, keeping focus', async () => {
    const { page } = context
    await context.open(tooltip())
    await page.focus('#scan')
    assert.equal(await isOpen(page, '#scan-tip'), true)
    await page.keyboard.press('Escape')
    assert.equal(await isOpen(page, '#scan-tip'), false)
    assert.equal(await focused(page), 'scan')
  })

  test('tooltip flips below a trigger at the top edge and stays inside the viewport', async () => {
    const { page } = context
    await context.open(tooltip('position: fixed; inset: 4px 4px auto auto'))
    await page.focus('#scan')
    const trigger = await box(page, '#scan')
    const tip = await box(page, '#scan-tip')
    assert.equal(await page.$eval('#scan-tip', (node) => node.dataset.apSide), 'bottom')
    assert.ok(tip.top >= trigger.bottom, 'below the trigger')
    assertInViewport(tip)
  })
})
