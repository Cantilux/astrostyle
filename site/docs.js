// Docs-only behavior: the light/dark theme switch (remembered per browser when storage works),
// demo states, and the astrostyle behaviors through autoInit() and createToaster().
import { autoInit, createToaster } from './js/index.js'

const storageKey = 'astrostyle-docs-theme'

// Reads the saved theme, or null when storage is unavailable or empty.
function savedTheme() {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

// Applies `theme` to the page and syncs the toggle button.
function applyTheme(theme, button) {
  document.documentElement.dataset.apTheme = theme
  if (button) {
    button.setAttribute('aria-pressed', String(theme === 'dark'))
    button.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme'
  }
}

// Wires the toggle button once the page is parsed.
function initThemeToggle() {
  const button = document.querySelector('[data-docs-theme-toggle]')
  applyTheme(savedTheme() === 'dark' ? 'dark' : 'light', button)
  button?.addEventListener('click', () => {
    const next = document.documentElement.dataset.apTheme === 'dark' ? 'light' : 'dark'
    applyTheme(next, button)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // Storage blocked: the choice lasts for this page view only.
    }
  })
}

// Marks demo checkboxes with `data-indeterminate`: the state exists only as a DOM property.
function initIndeterminate() {
  for (const box of document.querySelectorAll('input[data-indeterminate]')) box.indeterminate = true
}

// Buttons with `data-docs-toast` show a toast described by their data attributes.
function initToastButtons() {
  const buttons = document.querySelectorAll('[data-docs-toast]')
  if (buttons.length === 0) return
  const toaster = createToaster()
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const { tone, title, message, action, duration } = button.dataset
      toaster.show({
        tone,
        title,
        message,
        urgent: button.hasAttribute('data-urgent'),
        duration: duration === undefined ? undefined : Number(duration),
        action: action ? { label: action } : undefined,
      })
    })
  }
}

// Writes the page picked in a button pagination into the element named by
// `data-docs-page-output`.
function initPageOutputs() {
  for (const nav of document.querySelectorAll('[data-docs-page-output]')) {
    const output = document.getElementById(nav.dataset.docsPageOutput)
    nav.addEventListener('ap:page', (event) => {
      output.textContent = `ap:page → page ${event.detail.page} (was ${event.detail.previous})`
    })
  }
}

// Writes the return value of a closed dialog into the element named by
// `data-docs-dialog-output`.
function initDialogOutputs() {
  for (const dialog of document.querySelectorAll('[data-docs-dialog-output]')) {
    const output = document.getElementById(dialog.dataset.docsDialogOutput)
    dialog.addEventListener('ap:close', (event) => {
      output.textContent = `ap:close → ${dialog.id}, return value "${event.detail.returnValue}"`
    })
  }
}

// Writes the action picked in a menu into the element named by `data-docs-menu-output`.
function initMenuOutputs() {
  for (const menu of document.querySelectorAll('[data-docs-menu-output]')) {
    const output = document.getElementById(menu.dataset.docsMenuOutput)
    menu.addEventListener('ap:select', (event) => {
      output.textContent = `ap:select → "${event.detail.value || event.detail.item.textContent}"`
    })
  }
}

initThemeToggle()
initIndeterminate()
autoInit(document)
initToastButtons()
initPageOutputs()
initDialogOutputs()
initMenuOutputs()
