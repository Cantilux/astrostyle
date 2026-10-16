// Pure keyboard logic of a tablist: which tab a key moves to, skipping disabled tabs.
import { moveActive } from '../shared/navigation.js'

/** Keys that move between tabs, with the direction of each one. */
const steps = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

// Index of the tab `key` moves focus to from `from`, or null for keys tabs do not handle (or when
// no tab is enabled). `disabled` lists, per tab, whether it is disabled; `orientation` picks the
// arrow pair.
export function targetForKey(key, from, disabled, orientation = 'horizontal') {
  const arrows = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  const tabs = disabled.map((isDisabled) => ({ disabled: isDisabled }))
  let target = null
  if (arrows.includes(key)) target = moveActive(tabs, from, steps[key])
  else if (key === 'Home') target = moveActive(tabs, -1, 1)
  else if (key === 'End') target = moveActive(tabs, -1, -1)
  return target === -1 ? null : target
}
