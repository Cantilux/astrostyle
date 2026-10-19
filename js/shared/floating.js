// Positions an open popover next to its anchor in the viewport, with the pure `place()`.
import { place } from './position.js'

// Moves `floating` (a popover in the top layer, `position: fixed`) next to `anchor` and marks the
// side it ended on with `data-ap-side`. `options` are passed to `place()`.
export function positionNear(floating, anchor, options = {}) {
  const view = anchor.ownerDocument.defaultView
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

// Calls `onChange` when the page scrolls (outside `inside`, if given) or the window is resized,
// the moments an open popover must be placed again to stay next to its anchor. Returns a function that
// stops listening.
export function watchViewport(doc, onChange, inside = null) {
  const view = doc.defaultView
  const onScroll = (event) => {
    if (!inside?.contains(event.target)) onChange()
  }
  doc.addEventListener('scroll', onScroll, true)
  view.addEventListener('resize', onChange)
  return () => {
    doc.removeEventListener('scroll', onScroll, true)
    view.removeEventListener('resize', onChange)
  }
}
