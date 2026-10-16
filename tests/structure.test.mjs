// Structural guarantees of the Sass entry points (docs/design.md §6, §7.1).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileEntry, compileFixture } from './helpers/sass.mjs'
import { compileTargets, targets } from '../scripts/build.mjs'

test('the public API module outputs no CSS when used', () => {
  assert.equal(compileFixture("@use 'index';").trim(), '')
})

test('the bundle entry compiles', () => {
  assert.equal(typeof compileEntry('astrostyle.scss'), 'string')
})

test('the build produces one output per target', () => {
  const calls = []
  const fakeCompile = (path, options) => {
    calls.push(options.style)
    return { css: `/* ${options.style} */` }
  }
  const outputs = compileTargets('entry.scss', targets, fakeCompile)
  assert.deepEqual(Object.keys(outputs), ['astrostyle.css', 'astrostyle.min.css'])
  assert.deepEqual(calls, ['expanded', 'compressed'])
})
