// Toasts: short messages in a live region at the edge of the screen, dismissed by the user or
// after a timeout that pauses while the pointer or focus is on them.
// Contract: scss/components/toast/README.md.
import { element, windowOf } from '../shared/dom.js'
import { emptyQueue, enqueue, remove } from './queue.js'

/** Default texts; every one can be replaced through `options.labels`. */
export const defaultLabels = {
  region: 'Notifications',
  dismiss: 'Dismiss',
}

/** Tones a toast accepts, mapped to its modifier class. */
const tones = ['accent', 'success', 'warning', 'danger', 'info']

const closeIcon =
  '<svg class="ap-c-toast__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'

/**
 * @typedef {object} ToastContent
 * @property {string} [title]
 * @property {string | Node} [message]
 * @property {string} [tone] One of accent, success, warning, danger, info.
 * @property {boolean} [urgent] Announces the toast as an alert.
 * @property {number} [duration] Overrides the toaster's duration; 0 keeps the toast.
 * @property {{ label: string, onClick?: () => void }} [action]
 */

/** @typedef {{ element: HTMLElement, duration: number, timer: number | undefined, paused: boolean }} ToastEntry */

/**
 * Creates a toaster and returns its handle. Options: `region` (an existing element to use;
 * otherwise one is appended to the body), `duration` (ms before a toast closes, 0 to keep it),
 * `max` (toasts visible at once; later ones wait), `labels`. `env.document`, `env.setTimeout`
 * and `env.clearTimeout` can be injected for tests.
 * @param {{
 *   region?: HTMLElement,
 *   duration?: number,
 *   max?: number,
 *   labels?: Partial<typeof defaultLabels>,
 * }} [options]
 * @param {{
 *   document?: Document,
 *   setTimeout?: (action: () => void, ms: number) => number,
 *   clearTimeout?: (id: number | undefined) => void,
 * }} [env]
 */
export function createToaster(options = {}, env = {}) {
  const doc = env.document ?? options.region?.ownerDocument ?? globalThis.document
  const view = windowOf(doc)
  const setTimer = env.setTimeout ?? view.setTimeout.bind(view)
  const clearTimer = env.clearTimeout ?? view.clearTimeout.bind(view)
  const labels = { ...defaultLabels, ...options.labels }
  const defaultDuration = options.duration ?? 5000
  const max = options.max ?? 3
  const ownRegion = !options.region

  const region = options.region ?? element(doc, 'section', 'ap-c-toast__region')
  region.classList.add('ap-c-toast__region')
  region.setAttribute('aria-live', 'polite')
  if (!region.hasAttribute('aria-label')) region.setAttribute('aria-label', labels.region)
  if (ownRegion) doc.body.append(region)

  /** @type {Map<number, ToastEntry>} */
  const toasts = new Map()
  let queue = /** @type {import('./queue.js').QueueState<number>} */ (emptyQueue())
  let lastId = 0

  // Fires `ap:<name>` on the region with the toast element.
  const emit = (/** @type {string} */ name, /** @type {HTMLElement} */ toast) =>
    region.dispatchEvent(new view.CustomEvent(`ap:${name}`, { bubbles: true, detail: { toast } }))

  /**
   * Starts (or restarts) the closing timer of toast `id`.
   * @param {number} id
   */
  function startTimer(id) {
    const entry = toasts.get(id)
    if (!entry || entry.duration <= 0 || entry.paused) return
    clearTimer(entry.timer)
    entry.timer = setTimer(() => dismiss(id), entry.duration)
  }

  /**
   * Stops the closing timer of toast `id` while the user looks at or works in it.
   * @param {number} id
   */
  function pause(id) {
    const entry = toasts.get(id)
    if (!entry) return
    entry.paused = true
    clearTimer(entry.timer)
  }

  /**
   * Lets the timer of toast `id` run again, for its whole duration.
   * @param {number} id
   */
  function resume(id) {
    const entry = toasts.get(id)
    if (!entry) return
    entry.paused = false
    startTimer(id)
  }

  /**
   * Inserts toast `id` in the region and starts its timer.
   * @param {number} id
   */
  function reveal(id) {
    const entry = /** @type {ToastEntry} */ (toasts.get(id))
    region.append(entry.element)
    startTimer(id)
    emit('open', entry.element)
  }

  /**
   * Closes toast `id` and reveals the next waiting one.
   * @param {number} id
   */
  function dismiss(id) {
    const entry = toasts.get(id)
    if (!entry) return
    clearTimer(entry.timer)
    toasts.delete(id)
    const wasVisible = entry.element.isConnected
    entry.element.remove()
    const result = remove(queue, id, max)
    queue = result.state
    if (wasVisible) emit('close', entry.element)
    result.promoted.forEach(reveal)
  }

  /**
   * Builds the element of a toast.
   * @param {number} id
   * @param {ToastContent} content
   */
  function build(id, { title, message, tone, urgent, action }) {
    const toast = element(doc, 'div', 'ap-c-toast', urgent ? { role: 'alert' } : {})
    if (tone && tones.includes(tone)) toast.classList.add(`ap-c-toast--${tone}`)
    const body = element(doc, 'div', 'ap-c-toast__body')
    if (title) {
      const heading = element(doc, 'p', 'ap-c-toast__title')
      heading.textContent = title
      body.append(heading)
    }
    if (message) {
      const text = element(doc, 'p', 'ap-c-toast__message')
      if (message instanceof view.Node) text.append(message)
      else text.textContent = message
      body.append(text)
    }
    toast.append(body)
    if (action) {
      const button = element(doc, 'button', 'ap-c-button ap-c-button--quiet ap-c-toast__action', {
        type: 'button',
      })
      button.textContent = action.label
      button.addEventListener('click', () => {
        action.onClick?.()
        dismiss(id)
      })
      toast.append(button)
    }
    const close = element(doc, 'button', 'ap-c-toast__close', {
      type: 'button',
      'aria-label': labels.dismiss,
    })
    close.innerHTML = closeIcon
    close.addEventListener('click', () => dismiss(id))
    toast.append(close)
    toast.addEventListener('pointerenter', () => pause(id))
    toast.addEventListener('pointerleave', () => resume(id))
    toast.addEventListener('focusin', () => pause(id))
    toast.addEventListener('focusout', (event) => {
      if (!toast.contains(/** @type {Node | null} */ (event.relatedTarget))) resume(id)
    })
    return toast
  }

  // Closes every toast, waiting ones first so none is revealed on the way.
  function clear() {
    for (const id of [...queue.waiting, ...queue.visible]) dismiss(id)
  }

  return {
    element: region,
    /**
     * Shows a toast ({ title, message, tone, urgent, duration, action: { label, onClick } }) and
     * returns its handle.
     * @param {ToastContent} [content]
     */
    show(content = {}) {
      lastId += 1
      const id = lastId
      const toast = build(id, content)
      toasts.set(id, {
        element: toast,
        duration: content.duration ?? defaultDuration,
        timer: undefined,
        paused: false,
      })
      queue = enqueue(queue, id, max)
      if (queue.visible.includes(id)) reveal(id)
      return { element: toast, dismiss: () => dismiss(id) }
    },
    clear,
    // Closes every toast and removes the region it created.
    destroy() {
      clear()
      if (ownRegion) region.remove()
    },
  }
}

/** Options of `createToaster()`. @typedef {NonNullable<Parameters<typeof createToaster>[0]>} ToasterOptions */
/** Handle returned by `createToaster()`. @typedef {ReturnType<typeof createToaster>} ToasterHandle */
