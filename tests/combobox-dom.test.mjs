// Combobox behavior in a DOM (happy-dom): enhancement, filtering, keyboard, mouse, free text.
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { Window } from 'happy-dom'
import { autoInit } from '../js/auto-init/index.js'
import { createCombobox } from '../js/combobox/index.js'

let window
let document

const markup = `
  <form>
    <label for="ship">Ship</label>
    <select id="ship" name="ship" aria-describedby="ship-hint">
      <option value="">Choose a ship</option>
      <option value="heron">Night Heron</option>
      <option value="hammer">Hammerhead</option>
      <option value="cyb" disabled>Cybérillic Dawn</option>
      <option value="moth">Iron Moth</option>
    </select>
    <p id="ship-hint">Pick one.</p>
    <button id="after" type="button">After</button>
  </form>`

beforeEach(() => {
  window = new Window()
  document = window.document
  document.body.innerHTML = markup
})

afterEach(() => window.happyDOM.close())

// Enhances the test select and returns handy references.
function setup(options = {}) {
  const select = document.getElementById('ship-native') ?? document.querySelector('select')
  const handle = createCombobox(select, options, { document })
  const input = handle.element.querySelector('[role="combobox"]')
  const listbox = handle.element.querySelector('[role="listbox"]')
  const popup = handle.element.querySelector('.ap-c-combobox__popup')
  return { select, handle, input, listbox, popup }
}

// Types `text` into `input` as a user would.
function type(input, text) {
  input.value = text
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
}

// Presses `key` on `target`.
function press(target, key, init = {}) {
  target.dispatchEvent(
    new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  )
}

// Moves focus out of the combobox to `next` (or nowhere).
function blur(input, next = null) {
  input.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true, relatedTarget: next }))
}

// Labels of the options currently listed.
const listed = (listbox) =>
  [...listbox.querySelectorAll('[role="option"]')].map((o) => o.textContent)

test('the select is hidden and the combobox takes its id, label and description', () => {
  const { select, input, listbox } = setup()
  assert.equal(select.hidden, true)
  assert.equal(select.id, 'ship-native')
  assert.equal(input.id, 'ship')
  assert.equal(document.querySelector('label').htmlFor, 'ship')
  assert.equal(input.getAttribute('aria-describedby'), 'ship-hint')
  assert.equal(input.placeholder, 'Choose a ship')
  assert.equal(input.getAttribute('aria-expanded'), 'false')
  assert.equal(input.getAttribute('aria-controls'), listbox.id)
})

test('typing filters the options and opens the popup with a result count', () => {
  const { input, listbox, popup, handle } = setup()
  type(input, 'he')
  assert.equal(popup.hidden, false)
  assert.equal(input.getAttribute('aria-expanded'), 'true')
  assert.deepEqual(listed(listbox), ['Night Heron', 'Hammerhead'])
  assert.equal(handle.element.querySelector('[role="status"]').textContent, '2 results')
})

test('no match shows the empty message', () => {
  const { input, handle } = setup()
  type(input, 'zzz')
  assert.equal(handle.element.querySelector('.ap-c-combobox__empty').hidden, false)
  assert.equal(handle.element.querySelector('[role="status"]').textContent, 'No results')
})

test('arrows move the active option, skipping disabled ones, and Enter selects it', () => {
  const { select, input, listbox } = setup()
  const changes = []
  select.addEventListener('change', () => changes.push(select.value))
  select.addEventListener('ap:change', (event) => changes.push(event.detail))
  press(input, 'ArrowDown')
  assert.equal(input.getAttribute('aria-expanded'), 'true')
  press(input, 'ArrowDown')
  press(input, 'ArrowDown')
  const active = listbox.querySelector('[data-active]')
  assert.equal(active.textContent, 'Iron Moth')
  assert.equal(input.getAttribute('aria-activedescendant'), active.id)
  press(input, 'Enter')
  assert.equal(select.value, 'moth')
  assert.equal(input.value, 'Iron Moth')
  assert.equal(input.getAttribute('aria-expanded'), 'false')
  assert.deepEqual(changes, ['moth', { value: 'moth', label: 'Iron Moth', created: false }])
})

test('Escape closes the popup and restores the selected label', () => {
  const { select, input } = setup()
  select.value = 'heron'
  type(input, 'Ham')
  press(input, 'Escape')
  assert.equal(input.getAttribute('aria-expanded'), 'false')
  assert.equal(input.value, 'Night Heron')
  assert.equal(select.value, 'heron')
})

test('clicking an option selects it; disabled options ignore clicks', () => {
  const { select, input, listbox, handle } = setup()
  handle.open()
  const disabled = [...listbox.children].find((item) => item.textContent === 'Cybérillic Dawn')
  disabled.click()
  assert.equal(select.value, '')
  ;[...listbox.children].find((item) => item.textContent === 'Hammerhead').click()
  assert.equal(select.value, 'hammer')
  assert.equal(input.value, 'Hammerhead')
})

test('leaving the field commits an exact label, reverts unknown text, or clears to the placeholder', () => {
  const { select, input } = setup()
  type(input, 'iron moth')
  blur(input, document.getElementById('after'))
  assert.equal(select.value, 'moth')
  type(input, 'Starlight')
  blur(input)
  assert.equal(select.value, 'moth')
  assert.equal(input.value, 'Iron Moth')
  type(input, '')
  blur(input)
  assert.equal(select.value, '')
})

test('creatable comboboxes add free text as a new option', () => {
  const { select, input, handle } = setup({ creatable: true })
  let detail = null
  select.addEventListener('ap:change', (event) => (detail = event.detail))
  type(input, 'Starlight')
  assert.equal(
    handle.element.querySelector('.ap-c-combobox__empty').textContent,
    'Press Enter to use “Starlight”',
  )
  press(input, 'Enter')
  assert.equal(select.value, 'Starlight')
  assert.ok(select.querySelector('option[data-ap-created]'))
  assert.deepEqual(detail, { value: 'Starlight', label: 'Starlight', created: true })
})

test('the toggle opens the full list', () => {
  const { input, listbox, handle } = setup()
  type(input, 'h')
  handle.element.querySelector('.ap-c-combobox__toggle').click()
  handle.element.querySelector('.ap-c-combobox__toggle').click()
  assert.equal(listed(listbox).length, 4)
  assert.equal(input.getAttribute('aria-expanded'), 'true')
})

test('setValue updates without events; destroy gives the select back', () => {
  const { select, input, handle } = setup()
  let fired = false
  select.addEventListener('change', () => (fired = true))
  handle.setValue('heron')
  assert.equal(input.value, 'Night Heron')
  assert.equal(fired, false)
  handle.destroy()
  assert.equal(select.hidden, false)
  assert.equal(select.id, 'ship')
  assert.equal(document.querySelector('.ap-c-combobox'), null)
})

test('a disabled select gives a disabled combobox', () => {
  document.querySelector('select').disabled = true
  const { input, handle } = setup()
  assert.equal(input.disabled, true)
  handle.open()
  assert.equal(input.getAttribute('aria-expanded'), 'false')
})

test('autoInit enhances data-ap-combobox selects once, with free text when asked', () => {
  const select = document.querySelector('select')
  select.setAttribute('data-ap-combobox', '')
  select.setAttribute('data-ap-creatable', '')
  const handles = autoInit(document)
  assert.equal(handles.length, 1)
  assert.equal(autoInit(document).length, 0)
  const input = handles[0].element.querySelector('[role="combobox"]')
  type(input, 'Starlight')
  press(input, 'Enter')
  assert.equal(select.value, 'Starlight')
})

test('options added to the select after setup are searchable', () => {
  const { select, input, listbox } = setup()
  const option = document.createElement('option')
  option.value = 'gull'
  option.textContent = 'Grey Gull'
  select.append(option)
  type(input, 'gull')
  assert.deepEqual(listed(listbox), ['Grey Gull'])
})

test('setValue shows the label of an option added after setup', () => {
  const { select, input, handle } = setup()
  const option = document.createElement('option')
  option.value = 'gull'
  option.textContent = 'Grey Gull'
  select.append(option)
  handle.setValue('gull')
  assert.equal(input.value, 'Grey Gull')
})

test('a required select hands `required` to the input and gets it back on destroy', () => {
  const select = document.querySelector('select')
  select.required = true
  const handle = createCombobox(select, {}, { document })
  assert.equal(select.required, false, 'a hidden required select would block the form silently')
  assert.equal(handle.element.querySelector('input').required, true)
  handle.destroy()
  assert.equal(select.required, true)
})

test('a form reset shows the label of the restored value', async () => {
  const { select, input } = setup()
  select.value = 'moth'
  input.value = 'Iron Moth'
  // The browser restores the select after the reset event (happy-dom does not), so do the same.
  select.form.dispatchEvent(new window.Event('reset'))
  select.value = 'heron'
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(input.value, 'Night Heron')
})

test('creatable: text equal to a disabled option reverts instead of duplicating it', () => {
  const { select, input } = setup({ creatable: true })
  type(input, 'Cybérillic Dawn')
  blur(input)
  assert.equal(select.querySelectorAll('option[data-ap-created]').length, 0)
  assert.equal(input.value, '')
})
