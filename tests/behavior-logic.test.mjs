// Pure logic of the pagination, tabs, toast and menu modules and of the popover placement.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextByLetter } from '../js/menu/typeahead.js'
import { GAP, clampPage, pageWindow } from '../js/pagination/range.js'
import { place } from '../js/shared/position.js'
import { targetForKey } from '../js/tabs/navigation.js'
import { emptyQueue, enqueue, remove } from '../js/toast/queue.js'

test('pageWindow lists every page when they fit', () => {
  assert.deepEqual(pageWindow({ page: 1, count: 1 }), [1])
  assert.deepEqual(pageWindow({ page: 4, count: 7 }), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(pageWindow({ page: 1, count: 0 }), [])
})

test('pageWindow puts gaps around the current page and keeps a constant length', () => {
  assert.deepEqual(pageWindow({ page: 1, count: 10 }), [1, 2, 3, 4, 5, GAP, 10])
  assert.deepEqual(pageWindow({ page: 5, count: 10 }), [1, GAP, 4, 5, 6, GAP, 10])
  assert.deepEqual(pageWindow({ page: 10, count: 10 }), [1, GAP, 6, 7, 8, 9, 10])
  for (let page = 1; page <= 30; page += 1) {
    assert.equal(pageWindow({ page, count: 30 }).length, 7, `page ${page}`)
  }
})

test('pageWindow honors siblings and boundaries', () => {
  assert.deepEqual(pageWindow({ page: 10, count: 20, siblings: 2, boundaries: 2 }), [
    1,
    2,
    GAP,
    8,
    9,
    10,
    11,
    12,
    GAP,
    19,
    20,
  ])
})

test('clampPage keeps pages in range and defaults to 1', () => {
  assert.equal(clampPage(0, 5), 1)
  assert.equal(clampPage(9, 5), 5)
  assert.equal(clampPage(Number.NaN, 5), 1)
  assert.equal(clampPage(3, 0), 1)
})

test('targetForKey wraps with the arrows of the orientation and skips disabled tabs', () => {
  const disabled = [false, true, false, false]
  assert.equal(targetForKey('ArrowRight', 0, disabled), 2)
  assert.equal(targetForKey('ArrowLeft', 0, disabled), 3)
  assert.equal(targetForKey('ArrowDown', 0, disabled), null)
  assert.equal(targetForKey('ArrowDown', 0, disabled, 'vertical'), 2)
  assert.equal(targetForKey('Home', 3, [true, false, false]), 1)
  assert.equal(targetForKey('End', 0, [false, false, true]), 1)
  assert.equal(targetForKey('Enter', 0, disabled), null)
})

test('targetForKey stays put when every other tab is disabled, and gives up when all are', () => {
  assert.equal(targetForKey('ArrowRight', 0, [false, true, true]), 0)
  assert.equal(targetForKey('Home', 0, [true, true]), null)
})

test('the toast queue shows up to max and promotes waiting toasts in order', () => {
  let queue = emptyQueue()
  for (const id of [1, 2, 3, 4]) queue = enqueue(queue, id, 2)
  assert.deepEqual(queue, { visible: [1, 2], waiting: [3, 4] })
  const first = remove(queue, 1, 2)
  assert.deepEqual(first, { state: { visible: [2, 3], waiting: [4] }, promoted: [3] })
  const waiting = remove(first.state, 4, 2)
  assert.deepEqual(waiting, { state: { visible: [2, 3], waiting: [] }, promoted: [] })
})

// A 100×20 anchor at (200, 300) in a 1000×800 viewport, with its box edges.
const anchor = { left: 200, right: 300, top: 300, bottom: 320, width: 100, height: 20 }
const viewport = { width: 1000, height: 800 }
const floating = { width: 160, height: 100 }

test('place() puts the box on the preferred side, start-aligned or centered', () => {
  assert.deepEqual(place({ anchor, floating, viewport }), { x: 200, y: 328, side: 'bottom' })
  assert.deepEqual(place({ anchor, floating, viewport, side: 'top', align: 'center' }), {
    x: 170,
    y: 192,
    side: 'top',
  })
  assert.equal(place({ anchor, floating, viewport, rtl: true }).x, 140)
})

test('place() flips to the side with more room and stays inside the viewport', () => {
  const low = { ...anchor, top: 740, bottom: 760 }
  assert.deepEqual(place({ anchor: low, floating, viewport }), { x: 200, y: 632, side: 'top' })
  const high = { ...anchor, top: 10, bottom: 30 }
  assert.equal(place({ anchor: high, floating, viewport, side: 'top' }).side, 'bottom')
  const edge = { ...anchor, left: 950, right: 990 }
  assert.equal(place({ anchor: edge, floating, viewport }).x, 1000 - 8 - 160)
  assert.equal(place({ anchor, floating: { width: 2000, height: 10 }, viewport }).x, 8)
})

test('nextByLetter() finds the next enabled item by its first letter, wrapping around', () => {
  const items = [
    { label: 'Rename', disabled: false },
    { label: ' Repair', disabled: true },
    { label: 'Refuel', disabled: false },
    { label: 'Scrap', disabled: false },
  ]
  assert.equal(nextByLetter(items, 0, 'r'), 2)
  assert.equal(nextByLetter(items, 2, 'R'), 0)
  assert.equal(nextByLetter(items, -1, 's'), 3)
  assert.equal(nextByLetter(items, 0, 'x'), -1)
})
