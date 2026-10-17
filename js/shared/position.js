// Pure placement of a floating box (tooltip, menu) next to its anchor, inside the viewport: no
// DOM, no state. Boxes are `{ top, bottom, left, right, width, height }` in viewport pixels.

// Keeps `value` between `min` and `max`; `min` wins when the range is empty.
const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

// Viewport position `{ x, y, side }` of `floating` on the preferred `side` of `anchor` (`top` or
// `bottom`), `offset` pixels away. It flips to the other side when the preferred one has no room
// and the other has more. `align` is `start` (the anchor's start edge, the right one when `rtl`)
// or `center`. The result stays `margin` pixels inside `viewport` (`{ width, height }`).
export function place({
  anchor,
  floating,
  viewport,
  side = 'bottom',
  align = 'start',
  rtl = false,
  offset = 8,
  margin = 8,
}) {
  const room = {
    top: anchor.top - offset - margin,
    bottom: viewport.height - anchor.bottom - offset - margin,
  }
  const other = side === 'top' ? 'bottom' : 'top'
  const chosen = room[side] < floating.height && room[other] > room[side] ? other : side
  const y = chosen === 'bottom' ? anchor.bottom + offset : anchor.top - offset - floating.height
  let x
  if (align === 'center') x = anchor.left + (anchor.width - floating.width) / 2
  else x = rtl ? anchor.right - floating.width : anchor.left
  return {
    x: clamp(x, margin, viewport.width - margin - floating.width),
    y: clamp(y, margin, viewport.height - margin - floating.height),
    side: chosen,
  }
}
