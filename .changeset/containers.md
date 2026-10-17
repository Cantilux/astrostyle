---
'astrostyle': minor
---

Containers and data:

- `ap-c-dialog` with `createDialog()` from `astrostyle/js/dialog`: a native modal `<dialog>` with header, scrolling body and footer; openers (`data-ap-dialog-open`), close buttons whose `value` becomes the return value (`data-ap-dialog-close`), backdrop close (`dismissible`), focus return, `ap:open` and `ap:close`.
- `ap-c-drawer`: the same dialog along the full height of the end edge, `--start` for the start edge.
- `ap-c-accordion`: a native `<details>` with a chevron; the same `name` opens one at a time.
- `ap-c-table`: a framed, focusable region that scrolls a native table sideways, with `--striped`, `--compact` and end-aligned `__numeric` cells.
- `ap-c-list`: rows split by hairlines, end-side meta text and full-row links (`--plain` without hairlines).
- `ap-c-divider`: a hairline on an `<hr>` or around a short label, `--strong`.
- `ap-c-kbd`: a key cap.
- `ap-c-skeleton`: a pulsing placeholder line, `--block` and `--circle`.
- `autoInit()` also enhances `dialog[data-ap-dialog]` (`data-ap-dialog="static"` ignores backdrop clicks).
