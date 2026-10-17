---
'astrostyle': minor
---

Tooltips, menus and textured surfaces:

- `ap-c-tooltip` with `createTooltip()` from `astrostyle/js/tooltip`: a hint in a popover, in the theme's inverse colors, shown on hover after a delay and on keyboard focus, kept while the pointer is on it, hidden on Escape; placed above the trigger, below when there is no room.
- `ap-c-menu` with `createMenu()` from `astrostyle/js/menu`: a WAI-ARIA menu button over a popover; arrow keys, Home, End, type-to-jump, Escape and light dismiss with focus back on the button, `ap:select` with the chosen item's value, `ap:open` and `ap:close`; `__separator`, `__icon` and `__item--danger`.
- `ap-c-surface` with `--halftone`, `--crt` and `--noise`: the Design Guide's print textures behind a decorative area's content; the `ap.surface($kind)` mixin paints the same textures on any rule.
- `autoInit()` also enhances `[data-ap-menu]` and `[data-ap-tooltip]`.
