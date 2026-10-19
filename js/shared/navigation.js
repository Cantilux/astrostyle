// Pure keyboard navigation over a list of items (`{ disabled }`): no DOM, no state. Shared by the
// combobox options and the tabs.

/**
 * Index of the next enabled option from `current` in `direction` (1 or -1), wrapping around;
 * from -1 it starts at the first (or last) enabled option. Returns -1 when none is enabled.
 * @param {import('./types.js').Disableable[]} options
 * @param {number} current
 * @param {number} direction
 */
export function moveActive(options, current, direction) {
  const count = options.length
  if (!options.some((option) => !option.disabled)) return -1
  let index = current
  for (let step = 0; step < count; step += 1) {
    if (index === -1) index = direction > 0 ? 0 : count - 1
    else index = (index + direction + count) % count
    if (!options[index].disabled) return index
  }
  return -1
}

/**
 * Index of the first enabled option, or -1.
 * @param {import('./types.js').Disableable[]} options
 */
export function firstEnabled(options) {
  return options.findIndex((option) => !option.disabled)
}
