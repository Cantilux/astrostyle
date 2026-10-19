# Dialog

A native `<dialog>` centered over a dimmed page, with a header, a scrolling body and a footer for actions. Behavior: `createDialog()` from `astrostyle/js/dialog`. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_dialog.scss`.

## Markup

```html
<button class="ap-c-button" type="button" data-ap-dialog-open="jump">Jump</button>

<dialog class="ap-c-dialog" id="jump" aria-labelledby="jump-title" data-ap-dialog>
  <header class="ap-c-dialog__header">
    <h2 class="ap-c-dialog__title" id="jump-title">Jump to sector 7G?</h2>
    <button class="ap-c-button ap-c-button--quiet ap-c-button--icon" type="button" data-ap-dialog-close aria-label="Close">×</button>
  </header>
  <div class="ap-c-dialog__body"><p>The drive needs two cycles to cool down afterwards.</p></div>
  <footer class="ap-c-dialog__footer">
    <button class="ap-c-button ap-c-button--quiet" type="button" data-ap-dialog-close value="cancel">Cancel</button>
    <button class="ap-c-button ap-c-button--primary" type="button" data-ap-dialog-close value="jump">Jump</button>
  </footer>
</dialog>
```

## JavaScript

```js
import { createDialog } from 'astrostyle/js/dialog'

const jump = createDialog(document.querySelector('#jump'), { dismissible: true })
jump.element.addEventListener('ap:close', (event) => console.log(event.detail.returnValue))
jump.open()
```

- Options: `modal` (default `true`: opens with `showModal()`, the rest of the page is inert), `dismissible` (default `true`: a click on the backdrop closes it; a press that starts inside the dialog and ends on the backdrop does not).
- Handle: `element`, `open()`, `close(returnValue)`, `isOpen()`, `destroy()`.
- Buttons with `data-ap-dialog-open="<dialog id>"` open it. Buttons inside it with `data-ap-dialog-close` close it, and their `value` becomes the dialog's `returnValue`. A `<form method="dialog">` works too.
- Events on the dialog: `ap:open`, then `ap:close` with `detail.returnValue`, however it closed (button, Escape, form, `close()`).
- On close, focus goes back to the element that opened it.
- `autoInit()` enhances `dialog[data-ap-dialog]`; `data-ap-dialog="static"` ignores backdrop clicks.

## Rules

- Give the dialog a name: `aria-labelledby` pointing at its title.
- Escape always closes a modal dialog, as the browser intends; `dismissible: false` only keeps backdrop clicks from closing it.
- The body scrolls when the content is taller than the screen; header and footer stay in place.
- The backdrop color is `--ap-dialog-backdrop`, read on `::backdrop`: set it on the dialog or a parent.
