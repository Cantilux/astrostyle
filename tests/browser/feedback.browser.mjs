// Toasts in real browsers: placement of the region and the timeout paused by pointer and focus.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { eachBrowser } from '../helpers/browser.mjs'

// Shows one toast with an action, closing after `duration` ms, and exposes it as `window.toast`.
const showToast = (page, duration) =>
  page.evaluate((ms) => {
    window.toaster = window.ap.createToaster({ duration: ms })
    window.toast = window.toaster.show({
      title: 'Docked',
      message: 'All systems online.',
      action: { label: 'Undo', onClick: () => {} },
    }).element
  }, duration)

// Whether the toast shown by `showToast()` is still on the page.
const present = (page) => page.evaluate(() => window.toast.isConnected)

eachBrowser((context) => {
  test('the toast region sits at the bottom end corner of a wide viewport', async () => {
    const { page } = context
    await context.open('', { init: false })
    await showToast(page, 0)
    const toast = await page.evaluate(() => window.toast.getBoundingClientRect().toJSON())
    assert.ok(toast.width > 0 && toast.width < 800, `narrower than the page: ${toast.width}px`)
    assert.ok(toast.right <= 800 && toast.right > 700, `at the end edge: ${toast.right}px`)
    assert.ok(toast.bottom <= 600 && toast.bottom > 500, `at the bottom: ${toast.bottom}px`)
  })

  test('a toast closes after its duration, but not while the pointer rests on it', async () => {
    const { page } = context
    await context.open('', { init: false })
    await showToast(page, 400)
    const toast = await page.evaluate(() => window.toast.getBoundingClientRect().toJSON())
    await page.mouse.move(toast.left + 8, toast.top + 8)
    await page.waitForTimeout(800)
    assert.equal(await present(page), true, 'paused under the pointer')
    await page.mouse.move(4, 4)
    await page.waitForFunction(() => !window.toast.isConnected, null, { timeout: 2000 })
  })

  test('focus on the action pauses the timeout until it leaves the toast', async () => {
    const { page } = context
    await context.open('<button id="elsewhere" type="button">Elsewhere</button>', { init: false })
    await showToast(page, 400)
    await page.focus('.ap-c-toast__action')
    await page.waitForTimeout(800)
    assert.equal(await present(page), true, 'paused while focused')
    await page.focus('#elsewhere')
    await page.waitForFunction(() => !window.toast.isConnected, null, { timeout: 2000 })
  })
})
