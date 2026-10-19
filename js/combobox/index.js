// Searchable combobox built on a native <select> (WAI-ARIA editable combobox with a listbox
// popup). The select stays in the form, hidden and in sync; the combobox replaces it on screen.
// Contract: scss/components/combobox/README.md.
import { filterOptions, findByLabel } from './filter.js'
import { element, nextId } from '../shared/dom.js'
import { firstEnabled, moveActive } from '../shared/navigation.js'

/** Default texts; every one can be replaced through `options.labels`. */
export const defaultLabels = {
  noResults: 'No results',
  create: (text) => `Press Enter to use “${text}”`,
  results: (count) => (count === 1 ? '1 result' : `${count} results`),
  toggle: 'Show options',
}

// Reads the choices of a <select>: options with an empty value act as its placeholder.
function readOptions(select) {
  return [...select.options]
    .filter((option) => option.value !== '')
    .map((option) => ({
      value: option.value,
      label: option.label || option.textContent.trim(),
      disabled: option.disabled,
    }))
}

// Enhances `select` with a searchable combobox and returns its handle. Options:
// `creatable` (accept free text), `placeholder`, `labels`, `filter(options, query)`.
// `env.document` and `env.createId` can be injected for tests.
export function createCombobox(select, options = {}, env = {}) {
  const doc = env.document ?? select.ownerDocument
  const view = doc.defaultView ?? globalThis
  const createId = env.createId ?? (() => nextId('ap-combobox'))
  const labels = { ...defaultLabels, ...options.labels }
  const filter = options.filter ?? filterOptions
  const creatable = Boolean(options.creatable)
  const placeholderOption = [...select.options].find((option) => option.value === '')
  const originalId = select.id
  const wasRequired = select.required

  let choices = readOptions(select)
  let visible = []
  let active = -1
  let isOpen = false

  const root = element(doc, 'div', 'ap-c-combobox')
  const inputId = originalId || createId()
  const listId = createId()
  const input = element(doc, 'input', 'ap-c-input ap-c-combobox__input', {
    type: 'text',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': listId,
    autocomplete: 'off',
    spellcheck: 'false',
  })
  input.id = inputId
  input.placeholder =
    options.placeholder ?? (placeholderOption?.label || placeholderOption?.textContent.trim() || '')
  for (const name of ['aria-describedby', 'aria-invalid', 'aria-label', 'aria-labelledby']) {
    if (select.hasAttribute(name)) input.setAttribute(name, select.getAttribute(name))
  }
  input.required = wasRequired
  input.disabled = select.disabled

  const toggle = element(doc, 'button', 'ap-c-combobox__toggle', {
    type: 'button',
    tabindex: '-1',
    'aria-label': labels.toggle,
    'aria-controls': listId,
    'aria-expanded': 'false',
  })
  toggle.disabled = select.disabled
  toggle.innerHTML =
    '<svg viewBox="0 0 12 8" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1.5l5 5 5-5"/></svg>'

  const popup = element(doc, 'div', 'ap-c-combobox__popup')
  popup.hidden = true
  const listbox = element(doc, 'ul', 'ap-c-combobox__listbox', { role: 'listbox', id: listId })
  const labelledBy = select.labels?.[0]
  if (labelledBy) {
    if (!labelledBy.id) labelledBy.id = createId()
    listbox.setAttribute('aria-labelledby', labelledBy.id)
  }
  const empty = element(doc, 'p', 'ap-c-combobox__empty')
  empty.textContent = labels.noResults
  empty.hidden = true
  const status = element(doc, 'span', 'ap-u-visually-hidden', {
    role: 'status',
    'aria-live': 'polite',
  })
  popup.append(listbox, empty)
  root.append(input, toggle, popup, status)

  // Label of the option currently selected in the native select, or ''.
  const selectedLabel = () => choices.find((choice) => choice.value === select.value)?.label ?? ''

  // Dispatches an `ap:<name>` event on the native select.
  const emit = (name, detail) =>
    select.dispatchEvent(new view.CustomEvent(`ap:${name}`, { bubbles: true, detail }))

  // Marks option `index` of the visible list as active and keeps it in view.
  function setActive(index) {
    active = index
    for (const [position, item] of [...listbox.children].entries()) {
      item.toggleAttribute('data-active', position === index)
    }
    const current = listbox.children[index]
    if (current) {
      input.setAttribute('aria-activedescendant', current.id)
      current.scrollIntoView?.({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  // Rebuilds the listbox for `query` and announces the result count.
  function render(query) {
    visible = filter(choices, query)
    listbox.replaceChildren(
      ...visible.map((choice) => {
        const item = element(doc, 'li', 'ap-c-combobox__option', {
          role: 'option',
          id: createId(),
          'aria-selected': String(choice.value === select.value),
        })
        if (choice.disabled) item.setAttribute('aria-disabled', 'true')
        item.dataset.value = choice.value
        item.textContent = choice.label
        return item
      }),
    )
    empty.hidden = visible.length > 0
    empty.textContent = creatable && query.trim() ? labels.create(query.trim()) : labels.noResults
    status.textContent = visible.length ? labels.results(visible.length) : empty.textContent
    setActive(query ? firstEnabled(visible) : visible.findIndex((c) => c.value === select.value))
  }

  // Opens the popup filtered by `query`, reading the options again so ones added to the native
  // select after setup are listed too.
  function open(query = '') {
    if (input.disabled) return
    choices = readOptions(select)
    render(query)
    popup.hidden = false
    input.setAttribute('aria-expanded', 'true')
    toggle.setAttribute('aria-expanded', 'true')
    if (!isOpen) emit('open', {})
    isOpen = true
  }

  // Closes the popup.
  function close() {
    popup.hidden = true
    input.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-expanded', 'false')
    setActive(-1)
    if (isOpen) emit('close', {})
    isOpen = false
  }

  // Sets the native select to `value`, shows its label and notifies listeners.
  function commit(value, created = false) {
    const changed = select.value !== value
    select.value = value
    input.value = selectedLabel()
    if (changed) {
      select.dispatchEvent(new view.Event('input', { bubbles: true }))
      select.dispatchEvent(new view.Event('change', { bubbles: true }))
      emit('change', { value, label: input.value, created })
    }
  }

  // Adds free text as a new option of the native select and selects it.
  function create(text) {
    const option = element(doc, 'option', '', { 'data-ap-created': '' })
    option.value = text
    option.textContent = text
    select.append(option)
    choices = readOptions(select)
    commit(text, true)
  }

  // Applies what the user typed when leaving the field: an exact match, free text or a revert.
  function settle() {
    const text = input.value.trim()
    const match = findByLabel(choices, text)
    if (match && !match.disabled) commit(match.value)
    else if (!text && placeholderOption) commit('')
    else if (text && creatable && !match) create(text)
    else input.value = selectedLabel()
  }

  // Keyboard behavior of the editable combobox.
  function onKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      if (!isOpen) {
        // Opening with an arrow also activates an option: the selected one, else the first
        // (Down) or the last (Up) enabled one. Alt+Down only opens.
        open(input.value === selectedLabel() ? '' : input.value)
        if (active === -1 && !event.altKey) setActive(moveActive(visible, -1, direction))
      } else {
        setActive(moveActive(visible, active, direction))
      }
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault()
      const choice = visible[active]
      if (choice && !choice.disabled) commit(choice.value)
      else settle()
      close()
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      input.value = selectedLabel()
      close()
    }
  }

  // Filters as the user types.
  const onInput = () => open(input.value)

  // Settles the value when focus leaves the whole combobox.
  function onFocusOut(event) {
    if (root.contains(event.relatedTarget)) return
    close()
    settle()
  }

  // Keeps focus in the input while clicking the toggle or an option.
  const keepFocus = (event) => event.preventDefault()

  // Toggles the full list from the chevron button.
  function onToggle() {
    if (isOpen) close()
    else open('')
    input.focus()
  }

  // Selects a clicked option.
  function onOptionClick(event) {
    const item = event.target.closest('[role="option"]')
    if (!item || item.getAttribute('aria-disabled') === 'true') return
    commit(item.dataset.value)
    close()
  }

  // Shows the label of the value a form reset gives back; the reset applies after its event.
  function onReset() {
    view.setTimeout(() => {
      input.value = selectedLabel()
    })
  }

  select.form?.addEventListener('reset', onReset)
  input.addEventListener('keydown', onKeydown)
  input.addEventListener('input', onInput)
  root.addEventListener('focusout', onFocusOut)
  toggle.addEventListener('mousedown', keepFocus)
  toggle.addEventListener('click', onToggle)
  listbox.addEventListener('mousedown', keepFocus)
  listbox.addEventListener('click', onOptionClick)

  if (originalId) select.id = `${originalId}-native`
  // The hidden select cannot take focus, so a required one would block the form without a message:
  // the input carries `required` instead.
  select.required = false
  select.hidden = true
  select.after(root)
  input.value = selectedLabel()

  return {
    element: root,
    getValue: () => select.value,
    // Selects `value` without firing change events (programmatic update).
    setValue(value) {
      choices = readOptions(select)
      select.value = value
      input.value = selectedLabel()
    },
    open: () => open(''),
    close,
    // Removes the combobox and gives the native select back its place and id.
    destroy() {
      close()
      root.remove()
      select.hidden = false
      select.required = wasRequired
      select.form?.removeEventListener('reset', onReset)
      if (originalId) select.id = originalId
    },
  }
}
