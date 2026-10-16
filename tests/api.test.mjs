// The public Sass API exposes every setting, so all of them work with `@use ... with ()`.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const scss = fileURLToPath(new URL('../scss/', import.meta.url))
const index = readFileSync(`${scss}_index.scss`, 'utf8')

// Public `!default` variables declared by a settings partial.
function configurableVariables(file) {
  const source = readFileSync(`${scss}settings/${file}`, 'utf8')
  return [...source.matchAll(/^\$([a-z][\w-]*):[^;]*!default;/gm)].map((match) => match[1])
}

// Members a `@forward 'settings/<module>'` rule exposes: 'all', or the names after `show`.
function forwardedMembers(module) {
  const rule = index.match(new RegExp(`@forward 'settings/${module}'([^;]*);`))
  assert.ok(rule, `settings/${module} is not forwarded`)
  const show = rule[1].match(/show([^;]*)/)
  return show ? show[1].split(',').map((name) => name.trim().replace(/^\$/, '')) : 'all'
}

for (const file of readdirSync(`${scss}settings`).filter((name) => name.endsWith('.scss'))) {
  const module = file.replace(/^_|\.scss$/g, '')
  test(`every setting in settings/${file} is configurable`, () => {
    const members = forwardedMembers(module)
    if (members === 'all') return
    for (const name of configurableVariables(file)) {
      assert.ok(members.includes(name), `$${name} is not forwarded by _index.scss`)
    }
  })
}
