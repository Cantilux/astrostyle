// Pure combobox logic: matching and keyboard navigation.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterOptions, findByLabel, normalize } from '../js/combobox/filter.js'
import { firstEnabled, moveActive } from '../js/shared/navigation.js'

const ships = [
  { value: 'heron', label: 'Night Heron' },
  { value: 'hammer', label: 'Hammerhead' },
  { value: 'cyb', label: 'Cybérillic Dawn', disabled: true },
  { value: 'moth', label: 'Iron Moth' },
]

test('normalize ignores case, diacritics and surrounding spaces', () => {
  assert.equal(normalize('  Cybérillic '), 'cyberillic')
})

test('filterOptions keeps every option for an empty query', () => {
  assert.equal(filterOptions(ships, '  ').length, 4)
})

test('filterOptions lists labels starting with the query before the others', () => {
  assert.deepEqual(
    filterOptions(ships, 'h').map((ship) => ship.value),
    ['hammer', 'heron', 'moth'],
  )
  assert.deepEqual(
    filterOptions(ships, 'he').map((ship) => ship.value),
    ['heron', 'hammer'],
  )
  assert.deepEqual(
    filterOptions(ships, 'cyberillic').map((ship) => ship.value),
    ['cyb'],
  )
})

test('findByLabel matches whole labels only', () => {
  assert.equal(findByLabel(ships, 'night heron').value, 'heron')
  assert.equal(findByLabel(ships, 'night'), undefined)
})

test('moveActive wraps around and skips disabled options', () => {
  assert.equal(moveActive(ships, -1, 1), 0)
  assert.equal(moveActive(ships, -1, -1), 3)
  assert.equal(moveActive(ships, 1, 1), 3)
  assert.equal(moveActive(ships, 3, 1), 0)
  assert.equal(moveActive(ships, 3, -1), 1)
})

test('with no enabled option there is nothing to activate', () => {
  const disabled = ships.map((ship) => ({ ...ship, disabled: true }))
  assert.equal(moveActive(disabled, -1, 1), -1)
  assert.equal(firstEnabled(disabled), -1)
  assert.equal(firstEnabled(ships), 0)
})
