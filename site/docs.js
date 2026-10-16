// Docs-only behavior: the light/dark theme switch, remembered per browser when storage works.
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

initThemeToggle()
initIndeterminate()
