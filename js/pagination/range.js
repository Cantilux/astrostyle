// Pure page-window computation for pagination: which page numbers to show and where to put gaps.

/** Marker of a run of hidden pages in a page window. */
export const GAP = 'gap'

// Integers from `start` to `end`, both included; empty when `end < start`.
function range(start, end) {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index)
}

// Clamps `page` to 1…`count` (1 when there are no pages).
export function clampPage(page, count) {
  return Math.min(Math.max(Math.trunc(page) || 1, 1), Math.max(count, 1))
}

// Page numbers and `GAP` markers to show for `page` of `count`: `boundaries` pages at each end and
// `siblings` on each side of the current page. The number of items stays constant while the
// current page moves, so the control does not jump around.
export function pageWindow({ page, count, siblings = 1, boundaries = 1 }) {
  if (count < 1) return []
  const current = clampPage(page, count)
  const start = range(1, Math.min(boundaries, count))
  const end = range(Math.max(count - boundaries + 1, boundaries + 1), count)
  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    end.length > 0 ? end[0] - 2 : count - 1,
  )
  const before =
    siblingsStart > boundaries + 2
      ? [GAP]
      : boundaries + 1 < count - boundaries
        ? [boundaries + 1]
        : []
  const after =
    siblingsEnd < count - boundaries - 1
      ? [GAP]
      : count - boundaries > boundaries
        ? [count - boundaries]
        : []
  return [...start, ...before, ...range(siblingsStart, siblingsEnd), ...after, ...end]
}
