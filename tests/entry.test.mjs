// The `astrostyle/js` entry exposes the public API only: every export is part of the SemVer
// contract.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as entry from '../js/index.js'

test('astrostyle/js exports exactly the public API', () => {
  assert.deepEqual(Object.keys(entry).sort(), [
    'autoInit',
    'comboboxLabels',
    'createCombobox',
    'createDialog',
    'createPagination',
    'createTabs',
    'createToaster',
    'pageWindow',
    'paginationLabels',
    'toastLabels',
  ])
})
