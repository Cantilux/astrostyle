// Automated accessibility checks of the docs site in Chromium: every page, which shows each
// component and state, in both themes, plus the open states of the overlays. A violation of
// WCAG 2.2 A/AA or of an axe best practice fails the test; checks axe cannot decide (for example
// contrast over a gradient) are printed as diagnostics for a manual look.
import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { chromium } from 'playwright'
import { navigation } from '../../scripts/build-docs.mjs'
import { describeResults, runAxe } from '../helpers/a11y.mjs'
import { startSiteServer } from '../helpers/visual.mjs'

const themes = ['light', 'dark']

/**
 * Open states that the static pages do not show: page, a short name, the action that reaches it
 * and a selector that matches only once the overlay is really open, so a broken opener fails the
 * test instead of scanning the closed page.
 */
const states = [
  [
    'containers.html',
    'dialog-open',
    (page) => page.click('[data-ap-dialog-open="k-jump"]'),
    '#k-jump[open]',
  ],
  [
    'containers.html',
    'drawer-open',
    (page) => page.click('[data-ap-dialog-open="k-filters"]'),
    '#k-filters[open]',
  ],
  [
    'containers.html',
    'menu-open',
    (page) => page.click('[data-ap-menu="k-ship-menu"]'),
    '#k-ship-menu:popover-open',
  ],
  [
    'containers.html',
    'tooltip-open',
    (page) => page.focus('[data-ap-tooltip="k-tip-scan"]'),
    '#k-tip-scan:popover-open',
  ],
  [
    'demo.html',
    'combobox-open',
    (page) => page.click('.ap-c-combobox__toggle'),
    '[role="combobox"][aria-expanded="true"]',
  ],
  [
    'feedback.html',
    'toast',
    (page) => page.click('[data-docs-toast][data-urgent]'),
    '.ap-c-toast__region .ap-c-toast',
  ],
]

let server
let browser
let context
let page

before(async () => {
  server = await startSiteServer()
  browser = await chromium.launch()
})

after(async () => {
  await browser?.close()
  await server?.close()
})

beforeEach(async () => {
  context = await browser.newContext({ viewport: { width: 800, height: 600 } })
  page = await context.newPage()
})

afterEach(async () => context?.close())

// Loads docs page `file` in `theme` (saved where the docs theme switch reads it) and waits for
// fonts, which change the measured contrast.
async function openPage(file, theme) {
  await page.addInitScript((name) => localStorage.setItem('astrostyle-docs-theme', name), theme)
  await page.goto(`${server.url}/${file}`)
  await page.evaluate(() => document.fonts.ready)
}

// Waits until every finite animation and transition has ended, so contrast is measured on the
// settled colors rather than halfway through a fade.
const settle = () =>
  page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every(
          (animation) =>
            animation.playState !== 'running' ||
            animation.effect?.getComputedTiming().iterations === Infinity,
        ),
    null,
    { timeout: 5000 },
  )

// Runs axe on the current page: fails on violations, prints undecided checks as diagnostics.
async function check(t) {
  const results = await runAxe(page)
  for (const line of describeResults(results.incomplete)) t.diagnostic(`to check: ${line}`)
  assert.deepEqual(describeResults(results.violations), [])
}

for (const theme of themes) {
  for (const [file] of navigation) {
    test(`${file} · ${theme}`, async (t) => {
      await openPage(file, theme)
      await settle()
      await check(t)
    })
  }

  for (const [file, name, reach, open] of states) {
    test(`${file} ${name} · ${theme}`, async (t) => {
      await openPage(file, theme)
      await reach(page)
      await page.waitForSelector(open, { state: 'visible', timeout: 5000 })
      await settle()
      await check(t)
    })
  }
}
