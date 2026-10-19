// Pure queue of toasts: at most `max` visible at once, the others wait in arrival order.

/**
 * @template T
 * @typedef {{ visible: T[], waiting: T[] }} QueueState
 */

/**
 * Empty queue state.
 * @template T
 * @returns {QueueState<T>}
 */
export function emptyQueue() {
  return { visible: [], waiting: [] }
}

/**
 * Adds `id`: visible when there is room, waiting otherwise. Returns the new state.
 * @template T
 * @param {QueueState<T>} state
 * @param {T} id
 * @param {number} max
 * @returns {QueueState<T>}
 */
export function enqueue(state, id, max) {
  return state.visible.length < max
    ? { visible: [...state.visible, id], waiting: state.waiting }
    : { visible: state.visible, waiting: [...state.waiting, id] }
}

/**
 * Removes `id` wherever it is and moves waiting ids up while there is room. Returns the new
 * state and the ids that just became visible.
 * @template T
 * @param {QueueState<T>} state
 * @param {T} id
 * @param {number} max
 * @returns {{ state: QueueState<T>, promoted: T[] }}
 */
export function remove(state, id, max) {
  const visible = state.visible.filter((item) => item !== id)
  const waiting = state.waiting.filter((item) => item !== id)
  const room = Math.max(max - visible.length, 0)
  const promoted = waiting.slice(0, room)
  return {
    state: { visible: [...visible, ...promoted], waiting: waiting.slice(room) },
    promoted,
  }
}
