---
'astrostyle': patch
---

Accessibility fixes found by the new automated checks: a field no longer dims its label when its select only has a disabled `<option>` (the label dims for a disabled `input`, `select`, `textarea` or `button`), and disabled pagination steps rendered as links get `role="link"`, so their `aria-label` stays valid. The skeleton contract now names the loading region with `role="group"`.
