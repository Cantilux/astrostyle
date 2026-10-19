// Positions an open popover next to its anchor in the viewport, with the pure `place()`.
import { place } from './position.js'

/**
 * Moves `floating` (a popover in the top layer, `position: fixed`) next to `anchor` and marks the
 * side it ended on with `data-ap-side`. `options` are passed to `place()`.
 * @param {HTMLElement} floating
 * @param {Element} anchor
 * @param {Partial<Pick<Parameters<typeof place>[0], 'side' | 'align' | 'offset' | 'margin'>>} [options]
 */
export function positionNear(floating, anchor, options = {}) {
  const view = /** @type {Window} */ (anchor.ownerDocument.defaultView)
  const { x, y, side } = place({
    ...options,
    anchor: anchor.getBoundingClientRect(),
    floating: floating.getBoundingClientRect(),
    viewport: { width: view.innerWidth, height: view.innerHeight },
    rtl: view.getComputedStyle(anchor).direction === 'rtl',
  })
  floating.style.left = `${x}px`
  floating.style.top = `${y}px`
  floating.setAttribute('data-ap-side', side)
}
