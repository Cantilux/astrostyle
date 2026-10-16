// Package contract checks used by scripts/check-package.mjs (docs/design.md §12).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { packageProblems, requiredFiles } from '../scripts/check-package.mjs'

test('a complete file list has no problems', () => {
  assert.deepEqual(packageProblems(requiredFiles), [])
})

test('missing required files and forbidden paths are reported', () => {
  const files = requiredFiles
    .filter((file) => file !== 'dist/tokens.json')
    .concat('tests/x.test.mjs')
  assert.deepEqual(packageProblems(files), [
    'missing dist/tokens.json',
    'unexpected tests/x.test.mjs',
  ])
})
