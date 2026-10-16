# Toast

Short messages stacked in a fixed region at the bottom edge of the screen, created by `createToaster()`. Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_toast.scss`. Behavior: `js/toast/`.

## Usage

```js
import { createToaster } from 'astrostyle/js/toast'

const toaster = createToaster({ duration: 6000, labels: { dismiss: 'Chiudi' } })
toaster.show({ title: 'Docked', message: 'All systems online.', tone: 'success' })
toaster.show({
  message: 'Cargo sold.',
  action: { label: 'Undo', onClick: () => undoSale() },
})
toaster.show({ title: 'Hull breach', message: 'Seal deck 3.', tone: 'danger', urgent: true, duration: 0 })
```

## What the script builds

`section.ap-c-toast__region` (appended to `<body>`, or the element passed as `region`) with `aria-live="polite"` and `aria-label="Notifications"`. Each toast is `div.ap-c-toast` (`--accent`, `--success`, `--warning`, `--danger` or `--info` from `tone`) with `div.ap-c-toast__body` (`p.ap-c-toast__title`, `p.ap-c-toast__message`), an optional `button.ap-c-toast__action` (a quiet `ap-c-button`) and `button.ap-c-toast__close`.

## Rules

- Texts are set as text, never as HTML; pass a DOM node as `message` for richer content.
- `urgent: true` gives the toast `role="alert"`, so it interrupts screen readers: keep it for errors that need attention now.
- A toast closes after `duration` ms (default 5000; `0` keeps it until dismissed). The timer stops while the pointer or the focus is on the toast and starts again when they leave.
- At most `max` toasts (default 3) are visible; later ones wait their turn.
- Toasts disappear: never put the only way to do something in one. Repeat important actions elsewhere on the page.
- On narrow screens the region spans the width; from the `sm` breakpoint it sits at the end corner, `--ap-toast-width` wide.

## API

- Options: `region`, `duration`, `max`, `labels` (`region`, `dismiss`).
- `show({ title, message, tone, urgent, duration, action: { label, onClick } })` returns `{ element, dismiss() }`.
- Toaster handle: `element` (the region), `show()`, `clear()`, `destroy()` (also removes a region it created).
- `ap:open` and `ap:close` on the region (`detail: { toast }`) when a toast appears and when it closes.
