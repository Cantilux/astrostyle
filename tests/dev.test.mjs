// Local dev server helpers (scripts/dev.mjs).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { debounce, handle, injectClient, resolveRequest } from '../scripts/dev.mjs'

test('the dev client is injected just before </body>', () => {
  assert.equal(
    injectClient('<body><p>x</p></body>'),
    '<body><p>x</p><script src="/__dev/client.js"></script></body>',
  )
})

test('requests resolve inside the site folder and never outside it', () => {
  assert.equal(resolveRequest('/demo.html?x=1', '/site'), '/site/demo.html')
  assert.equal(resolveRequest('/', '/site'), '/site/index.html')
  assert.equal(resolveRequest('/../package.json', '/site'), null)
  assert.equal(resolveRequest('/%2e%2e/secret', '/site'), null)
  assert.equal(resolveRequest('/../site2/x.html', '/site'), null)
})

test('debounce runs once per burst with the last arguments', async () => {
  const calls = []
  const run = debounce((value) => calls.push(value), 20)
  run(1)
  run(2)
  run(3)
  await new Promise((resolve) => setTimeout(resolve, 60))
  assert.deepEqual(calls, [3])
})

test('a malformed URL gets a 404 instead of crashing the server', async () => {
  const sent = {}
  const response = {
    writeHead: (status) => (sent.status = status),
    end: (body) => (sent.body = body),
  }
  await handle({ url: '/%' }, response)
  assert.deepEqual(sent, { status: 404, body: 'Not found' })
})
