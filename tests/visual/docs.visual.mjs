// Visual regression of the docs site in Chromium: every section of every page, which shows each
// component and state, in both themes, plus the open states of the overlays. Run it in the
// Playwright Linux image (see README), where the baselines were taken.
import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { chromium } from 'playwright'
import { navigation } from '../../scripts/build-docs.mjs'
import { compareScreenshot, startSiteServer } from '../helpers/visual.mjs'

const themes = ['light', 'dark']

// Hides what is documentation text rather than component look (code samples, token tables) or
// changes with every release (the version), and unsticks the header, which would otherwise cover
// sections scrolled under it.
const stableStyle = `
  .docs-header { position: static; }
  .docs-version { visibility: hidden; }
  pre, .docs-visual-hidden { display: none !important; }
`

/**
 * Open states that the static pages do not show: page, a short name, the action that reaches the
 * state and what to capture (the viewport, since overlays live in the top layer).
 */
const states = [
  ['containers.html', 'dialog-open', (page) => page.click('[data-ap-dialog-open="k-jump"]')],
  ['containers.html', 'menu-open', (page) => page.click('[data-ap-menu="k-ship-menu"]')],
  ['containers.html', 'tooltip-open', (page) => page.focus('[data-ap-tooltip="k-tip-scan"]')],
  ['demo.html', 'combobox-open', (page) => page.click('.ap-c-combobox__toggle')],
  ['feedback.html', 'toast', (page) => page.click('[data-docs-toast]')],
  [
    'buttons.html',
    'focus-visible',
    async (page) => {
      await page.$eval('#looks', (heading) => (heading.tabIndex = -1))
      await page.focus('#looks')
      await page.keyboard.press('Tab')
    },
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
// fonts; token tables are hidden.
async function openPage(file, theme) {
  await page.addInitScript((name) => localStorage.setItem('astrostyle-docs-theme', name), theme)
  await page.goto(`${server.url}/${file}`)
  await page.evaluate(() => {
    for (const caption of document.querySelectorAll('caption')) {
      if (caption.textContent.startsWith('Tokens of ')) {
        caption.closest('table').parentElement.classList.add('docs-visual-hidden')
      }
    }
  })
  await page.addStyleTag({ content: stableStyle })
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
}

// Waits until every finite animation and transition has ended (infinite ones, like spinners, are
// frozen by the screenshot itself), so a state is captured once it has settled.
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

// Screenshot options that keep captures stable: no animations, no text caret.
const shot = { animations: 'disabled', caret: 'hide' }

/** Sections to capture: top-level ones, and labeled ones not inside another labeled section. */
const sectionSelector =
  'main > section:not([aria-labelledby]), main section[aria-labelledby]:not(section[aria-labelledby] *)'

for (const theme of themes) {
  for (const [file] of navigation) {
    test(`${file} · ${theme}`, async () => {
      await openPage(file, theme)
      await settle()
      const sections = await page.$$(sectionSelector)
      const failures = []
      for (const [index, section] of sections.entries()) {
        const id = (await section.getAttribute('aria-labelledby')) ?? `section-${index + 1}`
        const name = `${file.replace('.html', '')}/${id}.${theme}`
        const failure = await compareScreenshot(name, await section.screenshot(shot))
        if (failure) failures.push(`${name}: ${failure}`)
      }
      assert.ok(sections.length > 0, 'the page has sections')
      assert.deepEqual(failures, [])
    })
  }

  for (const [file, name, reach] of states) {
    test(`${file} ${name} · ${theme}`, async () => {
      await openPage(file, theme)
      await reach(page)
      await settle()
      const failure = await compareScreenshot(
        `states/${name}.${theme}`,
        await page.screenshot(shot),
      )
      assert.equal(failure, null)
    })
  }
}
