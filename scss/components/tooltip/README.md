# Tooltip

A short hint in a popover, in the theme's inverse colors, placed next to its trigger. Behavior: `createTooltip()` from `astrostyle/js/tooltip`. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_tooltip.scss`.

## Markup

```html
<button class="ap-c-button ap-c-button--icon" type="button" aria-labelledby="scan-tip" data-ap-tooltip="scan-tip">
  <svg class="ap-c-button__icon" aria-hidden="true">…</svg>
</button>
<span class="ap-c-tooltip" id="scan-tip" role="tooltip" popover="manual">Long-range scan</span>
```

## JavaScript

```js
import { createTooltip } from 'astrostyle/js/tooltip'

createTooltip(document.querySelector('[data-ap-tooltip="scan-tip"]'), { side: 'bottom' })
```

- Options: `tooltip` (the element; default: the id in `data-ap-tooltip`), `side` (`top`, the default, or `bottom`; it flips when there is no room), `delay` (ms before showing on hover, 300), `hideDelay` (ms before hiding, 100).
- Handle: `element`, `tooltip`, `show()`, `hide()`, `isOpen()`, `destroy()`.
- It shows on hover after the delay and right away on keyboard focus, stays while the pointer moves onto it, and hides when the pointer or focus leaves or on Escape.
- `autoInit()` enhances every `[data-ap-tooltip]`.

## Rules

- Link the tooltip to its trigger yourself: `aria-labelledby` when it is the trigger's only name (icon buttons), `aria-describedby` when it adds to a visible label.
- Plain text only, a few words: no links or buttons inside; those belong in a menu or a dialog.
- Never put information only in a tooltip that touch users need: there is no hover on touch screens.
- The module sets `left`, `top` and `data-ap-side` on the tooltip; everything else is CSS.
