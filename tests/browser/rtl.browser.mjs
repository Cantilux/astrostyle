// Right-to-left layout in real browsers: components drawn without text must look like the mirror
// image of their left-to-right selves, and keys, popups and motion must follow the reading
// direction.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { eachBrowser } from '../helpers/browser.mjs'

/**
 * Components whose drawing depends on the inline direction: a short name and the markup. Their
 * text is hidden in the screenshots (glyphs do not mirror), their shapes are not.
 */
const mirrored = [
  [
    'select',
    '<select class="ap-c-input ap-c-select" aria-label="Class"><option>Frigate</option></select>',
  ],
  [
    'switch',
    `<input class="ap-c-switch" type="checkbox" role="switch" aria-label="On" checked>
     <input class="ap-c-switch" type="checkbox" role="switch" aria-label="Off">`,
  ],
  [
    'meter',
    `<div class="ap-c-meter" role="meter" aria-label="Fuel" aria-valuemin="0" aria-valuemax="8"
       aria-valuenow="3" style="--ap-meter-value: 3; --ap-meter-max: 8"></div>`,
  ],
  [
    'progress',
    '<progress class="ap-c-progress" aria-label="Scan" max="100" value="30"></progress>',
  ],
  [
    'accordion',
    `<details class="ap-c-accordion"><summary class="ap-c-accordion__summary">Closed</summary>
       <div class="ap-c-accordion__body"><p>Body</p></div></details>
     <details class="ap-c-accordion" open><summary class="ap-c-accordion__summary">Open</summary>
       <div class="ap-c-accordion__body"><p>Body</p></div></details>`,
  ],
  [
    'pagination',
    '<nav data-ap-pagination data-ap-page="1" data-ap-count="3" aria-label="Pages"></nav>',
  ],
  [
    'breadcrumb',
    `<nav class="ap-c-breadcrumb" aria-label="Breadcrumb"><ol class="ap-c-breadcrumb__list">
       <li class="ap-c-breadcrumb__item"><a class="ap-c-breadcrumb__link" href="#a">Fleet</a></li>
       <li class="ap-c-breadcrumb__item"><a class="ap-c-breadcrumb__link" aria-current="page">Ship</a></li>
     </ol></nav>`,
  ],
]

/** Differing pixels tolerated between a mirrored capture and its counterpart. */
const maxDiffering = 10

// Hides text but keeps `currentColor` drawings (icons, borders), and freezes the caret.
const hideText =
  '<style>#subject, #subject * { -webkit-text-fill-color: transparent; caret-color: transparent; }</style>'

// Screenshot of `markup` laid out in `dir`, in a fixed-width box, decoded as a PNG.
async function capture(context, markup, dir) {
  await context.open(
    `${hideText}<div id="subject" style="inline-size: 320px; padding: 8px">${markup}</div>`,
    { dir },
  )
  await context.page.evaluate(() => document.fonts.ready)
  await context.page.mouse.move(0, 0)
  const image = await context.page.locator('#subject').screenshot({ animations: 'disabled' })
  return PNG.sync.read(image)
}

// Copy of `image` flipped left to right.
function flipped(image) {
  const out = new PNG({ width: image.width, height: image.height })
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const from = (y * image.width + x) * 4
      const to = (y * image.width + (image.width - 1 - x)) * 4
      image.data.copy(out.data, to, from, from + 4)
    }
  }
  return out
}

// Box of `selector` while its first running animation is held at its first frame, then once the
// animation has finished.
async function animatedBoxes(page, selector) {
  return page.$eval(selector, (node) => {
    const [animation] = node.getAnimations()
    animation.pause()
    animation.currentTime = 0
    const start = node.getBoundingClientRect().toJSON()
    animation.finish()
    return { start, end: node.getBoundingClientRect().toJSON() }
  })
}

// A drawer, `--start` with `start`, opened right away.
const drawer = (start = false) => `
  <dialog class="ap-c-drawer${start ? ' ap-c-drawer--start' : ''}" id="d" aria-label="Filters">
    <p>Filters</p>
  </dialog>
  <script>document.getElementById('d').showModal()</script>`

eachBrowser((context) => {
  for (const [name, markup] of mirrored) {
    test(`${name} right to left is the mirror image of left to right`, async () => {
      const ltr = await capture(context, markup, 'ltr')
      const rtl = await capture(context, markup, 'rtl')
      assert.deepEqual([rtl.width, rtl.height], [ltr.width, ltr.height])
      const differing = pixelmatch(flipped(ltr).data, rtl.data, null, ltr.width, ltr.height, {
        threshold: 0.2,
      })
      // Anti-aliasing of diagonal edges can land on a few different pixels once mirrored; a shape
      // drawn the wrong way round (a chevron is about 25 pixels) cannot.
      assert.ok(differing <= maxDiffering, `${differing} pixels differ`)
    })
  }

  test('horizontal tabs: ArrowLeft moves to the next tab, ArrowRight to the previous', async () => {
    const { page } = context
    await context.open(
      `<div class="ap-c-tabs" data-ap-tabs>
        <div class="ap-c-tabs__list" aria-label="Ship">
          <button class="ap-c-tabs__tab" type="button">Crew</button>
          <button class="ap-c-tabs__tab" type="button">Cargo</button>
          <button class="ap-c-tabs__tab" type="button">Systems</button>
        </div>
        <div class="ap-c-tabs__panel">1</div><div class="ap-c-tabs__panel">2</div><div class="ap-c-tabs__panel">3</div>
      </div>`,
      { dir: 'rtl' },
    )
    const selected = () => page.$eval('[aria-selected="true"]', (tab) => tab.textContent)
    await page.focus('[aria-selected="true"]')
    await page.keyboard.press('ArrowLeft')
    assert.equal(await selected(), 'Cargo')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    assert.equal(await selected(), 'Systems')
  })

  test('the menu opens aligned with the start edge of its button, which is the right one', async () => {
    const { page } = context
    await context.open(
      `<button id="ship" class="ap-c-button" type="button" data-ap-menu="ship-menu" style="margin: 16px 200px">Ship</button>
      <div class="ap-c-menu" id="ship-menu" popover>
        <button class="ap-c-menu__item" type="button">Rename the ship</button>
        <button class="ap-c-menu__item" type="button">Refuel</button>
      </div>`,
      { dir: 'rtl' },
    )
    await page.click('#ship')
    const button = await page.$eval('#ship', (node) => node.getBoundingClientRect().toJSON())
    const popup = await page.$eval('#ship-menu', (node) => node.getBoundingClientRect().toJSON())
    assert.ok(Math.abs(popup.right - button.right) <= 1, `${popup.right} vs ${button.right}`)
  })

  test('the combobox list opens under the input, across its whole width', async () => {
    const { page } = context
    await context.open(
      `<div style="margin: 16px"><label for="c">Ship</label>
        <select class="ap-c-input ap-c-select" id="c" data-ap-combobox>
          <option value="">Search</option><option>Night Heron</option><option>Iron Moth</option>
        </select></div>`,
      { dir: 'rtl' },
    )
    await page.click('.ap-c-combobox__toggle')
    const input = await page.$eval('[role="combobox"]', (node) =>
      node.getBoundingClientRect().toJSON(),
    )
    const popup = await page.$eval('.ap-c-combobox__popup', (node) =>
      node.getBoundingClientRect().toJSON(),
    )
    assert.ok(Math.abs(popup.right - input.right) <= 1 && Math.abs(popup.left - input.left) <= 1)
    const toggle = await page.$eval('.ap-c-combobox__toggle', (node) =>
      node.getBoundingClientRect().toJSON(),
    )
    assert.ok(toggle.right <= input.left + input.width / 2, 'the toggle sits at the inline end')
  })

  test('drawers slide in from their own edge', async () => {
    const { page } = context
    await context.open(drawer(), { dir: 'rtl' })
    const end = await animatedBoxes(page, '#d')
    assert.equal(
      Math.round(end.end.left),
      0,
      'the default drawer sits at the end edge, the left one',
    )
    assert.ok(end.start.left < end.end.left, 'and comes in from the left')
    await context.open(drawer(true), { dir: 'rtl' })
    const start = await animatedBoxes(page, '#d')
    assert.ok(start.start.left > start.end.left, 'the --start drawer comes in from the right')
  })

  test('the indeterminate progress sweeps toward the inline end', async () => {
    const { page } = context
    await context.open('<progress class="ap-c-progress" aria-label="Loading"></progress>', {
      dir: 'rtl',
    })
    const direction = await page.$eval(
      'progress',
      (node) => getComputedStyle(node).animationDirection,
    )
    assert.equal(direction, 'reverse')
  })
})
