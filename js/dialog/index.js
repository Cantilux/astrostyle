// Dialog: enhances a native `<dialog>` (an `ap-c-dialog` or an `ap-c-drawer`) with openers, close
// buttons, backdrop close and focus return, and reports opening and closing as `ap:` events.
// Contract: scss/components/dialog/README.md.

/**
 * Whether a click at (`x`, `y`) falls outside the box of `node`, on its backdrop.
 * @param {Element} node
 * @param {number} x
 * @param {number} y
 */
function isOutside(node, x, y) {
  const box = node.getBoundingClientRect()
  return x < box.left || x > box.right || y < box.top || y > box.bottom
}

/**
 * Enhances `dialog` and returns its handle. Options: `modal` (default true: `showModal()`,
 * otherwise `show()`), `dismissible` (default true: a click on the backdrop closes it). Buttons
 * with `data-ap-dialog-open="<dialog id>"` anywhere in the document open it; buttons inside it
 * with `data-ap-dialog-close` close it, their `value` becoming the return value. `env.document`
 * can be injected for tests.
 * @param {HTMLDialogElement} dialog
 * @param {{ modal?: boolean, dismissible?: boolean }} [options]
 * @param {{ document?: Document }} [env]
 */
export function createDialog(dialog, options = {}, env = {}) {
  const doc = env.document ?? dialog.ownerDocument
  const view = doc.defaultView ?? /** @type {Window & typeof globalThis} */ (globalThis)
  const modal = options.modal ?? true
  const dismissible = options.dismissible ?? true
  /** @type {Element | null} */
  let opener = null
  let pressedOnBackdrop = false

  // Fires `ap:<name>` on the dialog.
  const emit = (/** @type {string} */ name, /** @type {object} */ detail) =>
    dialog.dispatchEvent(new view.CustomEvent(`ap:${name}`, { bubbles: true, detail }))

  // Opens the dialog, remembering where focus was so it can go back there.
  function open() {
    if (dialog.open) return
    opener = doc.activeElement
    if (modal) dialog.showModal()
    else dialog.show()
    emit('open', {})
  }

  /**
   * Closes the dialog with an optional return value.
   * @param {string} [returnValue]
   */
  function close(returnValue) {
    if (dialog.open) dialog.close(returnValue)
  }

  // Runs however the dialog closed (Escape, a form with method="dialog", close()): puts focus
  // back on the opener and fires `ap:close`.
  function onClose() {
    const target = opener
    opener = null
    if (target?.isConnected && typeof (/** @type {HTMLElement} */ (target).focus) === 'function') {
      ;/** @type {HTMLElement} */ (target).focus()
    }
    emit('close', { returnValue: dialog.returnValue })
  }

  /**
   * Remembers whether a press started on the backdrop: a drag that starts inside the dialog and
   * ends outside (selecting text) must not close it.
   * @param {MouseEvent} event
   */
  function onMousedown(event) {
    pressedOnBackdrop = event.target === dialog
  }

  /**
   * Closes on a close button, or on a backdrop click when dismissible.
   * @param {MouseEvent} event
   */
  function onClick(event) {
    const button = /** @type {HTMLButtonElement | null} */ (
      /** @type {Element} */ (event.target).closest('[data-ap-dialog-close]')
    )
    if (button && dialog.contains(button)) {
      close(button.value)
      return
    }
    const pressed = pressedOnBackdrop
    pressedOnBackdrop = false
    if (
      dismissible &&
      pressed &&
      event.target === dialog &&
      isOutside(dialog, event.clientX, event.clientY)
    ) {
      close('')
    }
  }

  /**
   * Opens on a click on one of this dialog's openers.
   * @param {MouseEvent} event
   */
  function onDocumentClick(event) {
    const trigger = /** @type {Element} */ (event.target).closest?.('[data-ap-dialog-open]')
    if (trigger && dialog.id && trigger.getAttribute('data-ap-dialog-open') === dialog.id) {
      open()
    }
  }

  dialog.addEventListener('close', onClose)
  dialog.addEventListener('mousedown', onMousedown)
  dialog.addEventListener('click', onClick)
  doc.addEventListener('click', onDocumentClick)

  return {
    element: dialog,
    open,
    close,
    isOpen: () => dialog.open,
    // Removes the behavior; an open dialog stays open.
    destroy() {
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('mousedown', onMousedown)
      dialog.removeEventListener('click', onClick)
      doc.removeEventListener('click', onDocumentClick)
    },
  }
}
