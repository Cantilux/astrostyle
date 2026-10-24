// Tabs and pagination in real browsers: keyboard focus, roving tabindex, rendered visibility.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eachBrowser } from '../helpers/browser.mjs'

// Tabs with three tabs (the last disabled); `mode` is the `data-ap-tabs` value.
const tabs = (mode = '') => `
  <div class="ap-c-tabs" data-ap-tabs="${mode}">
    <div class="ap-c-tabs__list" aria-label="Ship">
      <button class="ap-c-tabs__tab" type="button">Crew</button>
      <button class="ap-c-tabs__tab" type="button">Cargo</button>
      <button class="ap-c-tabs__tab" type="button" disabled>Vault</button>
    </div>
    <section class="ap-c-tabs__panel">Crew panel</section>
    <section class="ap-c-tabs__panel">Cargo panel</section>
    <section class="ap-c-tabs__panel">Vault panel</section>
  </div>`

// Rendered state of the tabs: focused tab, selected tab, tab order and visible panels.
const tabState = (page) =>
  page.evaluate(() => ({
    focused: document.activeElement.textContent.trim(),
    selected: document.querySelector('[aria-selected="true"]').textContent.trim(),
    tabIndex: [...document.querySelectorAll('[role="tab"]')].map((tab) => tab.tabIndex),
    visible: [...document.querySelectorAll('[role="tabpanel"]')]
      .filter((panel) => panel.checkVisibility())
      .map((panel) => panel.textContent.trim()),
  }))

eachBrowser((context) => {
  test('tabs: arrows move focus and selection, skipping disabled tabs; one panel is visible', async () => {
    const { page } = context
    await context.open(tabs())
    assert.deepEqual((await tabState(page)).visible, ['Crew panel'])
    await page.focus('[role="tab"]')
    await page.keyboard.press('ArrowRight')
    assert.deepEqual(await tabState(page), {
      focused: 'Cargo',
      selected: 'Cargo',
      tabIndex: [-1, 0, -1],
      visible: ['Cargo panel'],
    })
    await page.keyboard.press('ArrowRight')
    assert.equal((await tabState(page)).focused, 'Crew', 'wraps over the disabled tab')
  })

  test('tabs with manual activation move focus only; Space selects', async () => {
    const { page } = context
    await context.open(tabs('manual'))
    await page.focus('[role="tab"]')
    await page.keyboard.press('ArrowRight')
    let state = await tabState(page)
    assert.equal(state.focused, 'Cargo')
    assert.deepEqual(state.visible, ['Crew panel'])
    await page.keyboard.press('Space')
    state = await tabState(page)
    assert.equal(state.selected, 'Cargo')
    assert.deepEqual(state.visible, ['Cargo panel'])
  })

  test('pagination keeps keyboard focus on the step, then on the current page at the end', async () => {
    const { page } = context
    await context.open(
      '<nav class="ap-c-pagination" data-ap-pagination data-ap-page="1" data-ap-count="3"></nav>',
    )
    await page.focus('[data-step="next"]')
    await page.keyboard.press('Enter')
    assert.equal(await page.evaluate(() => document.activeElement.dataset.step), 'next')
    await page.keyboard.press('Enter')
    const current = await page.evaluate(() => ({
      page: document.querySelector('[aria-current="page"]').textContent.trim(),
      focused: document.activeElement.getAttribute('aria-current'),
      nextDisabled: document.querySelector('[data-step="next"]').disabled,
    }))
    assert.deepEqual(current, { page: '3', focused: 'page', nextDisabled: true })
  })
})
