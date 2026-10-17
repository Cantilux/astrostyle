// Pure type-to-select for menu items (`{ label, disabled }`): no DOM, no state.

// Index of the next enabled item after `from` whose label starts with `letter` (any case),
// wrapping around; -1 when none does.
export function nextByLetter(items, from, letter) {
  const wanted = letter.toLocaleLowerCase()
  for (let step = 1; step <= items.length; step += 1) {
    const index = (from + step + items.length) % items.length
    const item = items[index]
    if (!item.disabled && item.label.trim().toLocaleLowerCase().startsWith(wanted)) return index
  }
  return -1
}
