// Combobox in real browsers: typed keys, mouse choice, native form validation, list scrolling.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eachBrowser } from '../helpers/browser.mjs'

const ships = ['Night Heron', 'Hammerhead', 'Iron Moth', 'Grey Lantern', 'Salt Wolf', 'Ember Kite']

// A form with a combobox over `count` ship options; `required` makes the choice mandatory.
const form = ({ count = 6, required = false } = {}) => `
  <form id="f" style="margin: 16px">
    <label for="ship">Ship</label>
    <select class="ap-c-input ap-c-select" id="ship" name="ship" data-ap-combobox ${required ? 'required' : ''}>
      <option value="">Search the registry</option>
      ${Array.from({ length: count }, (_, index) => {
        const name = ships[index] ?? `Ship ${index + 1}`
        return `<option value="v${index + 1}">${name}</option>`
      }).join('')}
    </select>
    <button id="after" type="button">After</button>
  </form>`

// Viewport box of the element matching `selector`.
const box = (page, selector) =>
  page.$eval(selector, (node) => node.getBoundingClientRect().toJSON())

// Value of the native select and of the form field it submits.
const submitted = (page) =>
  page.evaluate(() => ({
    select: document.querySelector('select').value,
    form: new FormData(document.querySelector('#f')).get('ship'),
  }))

eachBrowser((context) => {
  test('typing filters the list under the input; Enter chooses and syncs the native select', async () => {
    const { page } = context
    await context.open(form())
    await page.evaluate(() => {
      window.changes = 0
      document.querySelector('select').addEventListener('change', () => window.changes++)
    })
    await page.click('[role="combobox"]')
    await page.keyboard.type('mo')
    const labels = await page.$$eval('[role="option"]:not([hidden])', (nodes) =>
      nodes.map((node) => node.textContent.trim()),
    )
    assert.deepEqual(labels, ['Iron Moth'])
    const input = await box(page, '[role="combobox"]')
    const popup = await box(page, '.ap-c-combobox__popup')
    assert.ok(popup.top >= input.bottom - 1, 'the list opens under the input')
    assert.ok(popup.height > 0 && popup.bottom <= 600, 'the list is visible in the viewport')
    await page.keyboard.press('Enter')
    assert.equal(await page.inputValue('[role="combobox"]'), 'Iron Moth')
    assert.deepEqual(await submitted(page), { select: 'v3', form: 'v3' })
    assert.equal(await page.evaluate(() => window.changes), 1)
  })

  test('a mouse click on an option chooses it and keeps focus in the input', async () => {
    const { page } = context
    await context.open(form())
    await page.click('.ap-c-combobox__toggle')
    await page.click('[role="option"]:has-text("Salt Wolf")')
    assert.equal(await page.inputValue('[role="combobox"]'), 'Salt Wolf')
    assert.deepEqual(await submitted(page), { select: 'v5', form: 'v5' })
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('role')), 'combobox')
  })

  test('leaving the field with unmatched text reverts it to the chosen label', async () => {
    const { page } = context
    await context.open(form())
    await page.click('[role="combobox"]')
    await page.keyboard.type('Hammerhead')
    await page.keyboard.press('Enter')
    await page.keyboard.type('zz')
    await page.focus('#after')
    assert.equal(await page.inputValue('[role="combobox"]'), 'Hammerhead')
    assert.deepEqual(await submitted(page), { select: 'v2', form: 'v2' })
  })

  test('a required combobox blocks submission through native validation on the input', async () => {
    const { page } = context
    await context.open(form({ required: true }))
    const valid = await page.evaluate(() => {
      let sent = false
      const target = document.querySelector('#f')
      target.addEventListener('submit', (event) => {
        sent = true
        event.preventDefault()
      })
      target.requestSubmit()
      return { sent, invalid: document.querySelector('[role="combobox"]').matches(':invalid') }
    })
    assert.deepEqual(valid, { sent: false, invalid: true })
  })

  test('ArrowUp on a long list activates the last option and scrolls it into view', async () => {
    const { page } = context
    await context.open(form({ count: 40 }))
    await page.focus('[role="combobox"]')
    await page.keyboard.press('ArrowUp')
    const view = await page.evaluate(() => {
      const listbox = document.querySelector('[role="listbox"]')
      const active = document.getElementById(
        document.querySelector('[role="combobox"]').getAttribute('aria-activedescendant'),
      )
      const outer = listbox.getBoundingClientRect()
      const inner = active.getBoundingClientRect()
      return {
        label: active.textContent.trim(),
        scrolled: listbox.scrollTop > 0,
        visible: inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1,
      }
    })
    assert.deepEqual(view, { label: 'Ship 40', scrolled: true, visible: true })
  })
})
