// Tooltip: shows a short hint in a popover next to its trigger while the pointer rests on the
// trigger or focus is on it. The tooltip stays while the pointer moves onto it, and Escape hides
// it. Contract: scss/components/tooltip/README.md.
import { positionNear } from '../shared/floating.js'

// Enhances `trigger` and returns its handle. The tooltip is `options.tooltip`, or the element whose
// id is in the trigger's `data-ap-tooltip`; it must have `popover="manual"` and `role="tooltip"`.
// Options: `side` (`top`, the default, or `bottom`), `delay` (ms before showing on hover, 300),
// `hideDelay` (ms before hiding, 100). `env.setTimeout` and `env.clearTimeout` can be injected.
export function createTooltip(trigger, options = {}, env = {}) {
  const doc = trigger.ownerDocument
  const view = doc.defaultView ?? globalThis
  const setTimer = env.setTimeout ?? view.setTimeout.bind(view)
  const clearTimer = env.clearTimeout ?? view.clearTimeout.bind(view)
  const tooltip = options.tooltip ?? doc.getElementById(trigger.dataset.apTooltip)
  if (!tooltip) throw new Error('createTooltip: no tooltip element')
  const side = options.side ?? 'top'
  const delay = options.delay ?? 300
  const hideDelay = options.hideDelay ?? 100
  let open = false
  let timer = null

  // Runs `action` after `ms`, replacing any pending show or hide.
  function schedule(action, ms) {
    clearTimer(timer)
    timer = setTimer(action, ms)
  }

  // Shows the tooltip next to the trigger.
  function show() {
    clearTimer(timer)
    if (open) return
    open = true
    tooltip.showPopover()
    positionNear(tooltip, trigger, { side, align: 'center' })
  }

  // Hides the tooltip.
  function hide() {
    clearTimer(timer)
    if (!open) return
    open = false
    tooltip.hidePopover()
  }

  const onEnter = () => (open ? clearTimer(timer) : schedule(show, delay))
  const onLeave = () => schedule(hide, hideDelay)
  // Hides on Escape, wherever focus is, without moving it.
  const onKeydown = (event) => {
    if (event.key === 'Escape' && open) hide()
  }

  trigger.addEventListener('pointerenter', onEnter)
  trigger.addEventListener('pointerleave', onLeave)
  trigger.addEventListener('focusin', show)
  trigger.addEventListener('focusout', hide)
  tooltip.addEventListener('pointerenter', onEnter)
  tooltip.addEventListener('pointerleave', onLeave)
  doc.addEventListener('keydown', onKeydown)

  return {
    element: trigger,
    tooltip,
    show,
    hide,
    isOpen: () => open,
    // Removes the behavior and hides the tooltip.
    destroy() {
      hide()
      trigger.removeEventListener('pointerenter', onEnter)
      trigger.removeEventListener('pointerleave', onLeave)
      trigger.removeEventListener('focusin', show)
      trigger.removeEventListener('focusout', hide)
      tooltip.removeEventListener('pointerenter', onEnter)
      tooltip.removeEventListener('pointerleave', onLeave)
      doc.removeEventListener('keydown', onKeydown)
    },
  }
}
