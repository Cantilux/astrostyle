// Pure text matching for the combobox: no DOM, no state.

/**
 * Lowercase text without diacritics or surrounding spaces, so "Cybérillic" matches "cyberillic".
 * @param {unknown} text
 */
export function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Options whose label contains `query`, labels that start with it first, otherwise in their
 * original order; every option when the query is empty. Options are `{ value, label, disabled }`.
 * @param {import('../shared/types.js').ComboboxOption[]} options
 * @param {string} query
 */
export function filterOptions(options, query) {
  const needle = normalize(query)
  if (!needle) return [...options]
  /** @type {typeof options} */
  const starts = []
  /** @type {typeof options} */
  const contains = []
  for (const option of options) {
    const label = normalize(option.label)
    if (label.startsWith(needle)) starts.push(option)
    else if (label.includes(needle)) contains.push(option)
  }
  return [...starts, ...contains]
}

/**
 * The option whose label equals `text` (ignoring case and diacritics), or undefined.
 * @param {import('../shared/types.js').ComboboxOption[]} options
 * @param {string} text
 */
export function findByLabel(options, text) {
  const needle = normalize(text)
  return options.find((option) => normalize(option.label) === needle)
}
