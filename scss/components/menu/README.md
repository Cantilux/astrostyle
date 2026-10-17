# Menu

A list of actions in a popover under its button (WAI-ARIA menu button). Behavior: `createMenu()` from `astrostyle/js/menu`. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_menu.scss`.

## Markup

```html
<button class="ap-c-button" type="button" data-ap-menu="ship-menu">Ship</button>
<div class="ap-c-menu" id="ship-menu" popover>
  <button class="ap-c-menu__item" type="button" value="rename">Rename</button>
  <button class="ap-c-menu__item" type="button" value="refuel">Refuel</button>
  <a class="ap-c-menu__item" href="/ship/log">Open the log</a>
  <div class="ap-c-menu__separator" role="separator"></div>
  <button class="ap-c-menu__item ap-c-menu__item--danger" type="button" value="scrap">Scrap</button>
</div>
```

## JavaScript

```js
import { createMenu } from 'astrostyle/js/menu'

const ship = createMenu(document.querySelector('[data-ap-menu="ship-menu"]'))
ship.menu.addEventListener('ap:select', (event) => console.log(event.detail.value))
```

- Options: `menu` (the element; default: the id in `data-ap-menu`), `side` (`bottom`, the default, or `top`; it flips when there is no room).
- Handle: `element`, `menu`, `open(focus)` (`first` or `last` item), `close()`, `isOpen()`, `destroy()`.
- The button opens it on click, ArrowDown (first item) and ArrowUp (last item). Inside: ArrowUp and ArrowDown wrap over enabled items, Home and End, a letter jumps to the next item starting with it, Escape closes and focuses the button, Tab closes and moves on. A click outside closes it (native light dismiss).
- Choosing an item fires `ap:select` on the menu with `{ item, value }` (`value` or `data-value`), then closes it. The menu also fires `ap:open` and `ap:close`.
- The module sets `role="menu"`, `role="menuitem"`, `tabindex="-1"` on the items, and `aria-haspopup`, `aria-expanded`, `aria-controls` on the button; `destroy()` restores them.
- `autoInit()` enhances every `[data-ap-menu]`.

## Modifiers

- `ap-c-menu__item--danger`: a destructive action, in the danger text color.

## Rules

- A menu holds actions or links, not form fields. For a choice of values use a select or the combobox.
- Disabled items stay in the list (`aria-disabled="true"`, or `disabled` on a button) and are skipped by the arrows.
- `ap-c-menu__icon` sizes an icon inside an item; keep the text, an icon is never the only label.
