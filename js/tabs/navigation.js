// Pure keyboard logic of a tablist: which tab a key moves to, skipping disabled tabs.

/** Keys that move between tabs, with the direction of each one. */
const steps = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

// Index of the next enabled tab from `from` in `direction` (wrapping), or `from` when none.
export function nextEnabled(disabled, from, direction) {
  const count = disabled.length
  for (let offset = 1; offset <= count; offset += 1) {
    const index = (((from + direction * offset) % count) + count) % count
    if (!disabled[index]) return index
  }
  return from
}

// Index of the tab `key` moves focus to from `from`, or null for keys tabs do not handle.
// `disabled` lists, per tab, whether it is disabled; `orientation` picks the arrow pair.
export function targetForKey(key, from, disabled, orientation = 'horizontal') {
  const arrows = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  if (arrows.includes(key)) return nextEnabled(disabled, from, steps[key])
  if (key === 'Home') return nextEnabled(disabled, -1, 1)
  if (key === 'End') return nextEnabled(disabled, disabled.length, -1)
  return null
}
