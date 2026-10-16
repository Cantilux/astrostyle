---
'astrostyle': minor
---

Pagination, tabs and toasts, with their JavaScript modules:

- `ap-c-pagination` with `createPagination()` from `astrostyle/js/pagination`: renders links (`href(page)`) or buttons with previous and next steps and a constant-length page window (`siblings`, `boundaries`), fires a cancelable `ap:page`; `pageWindow()` is exported as pure logic.
- `ap-c-tabs` with `createTabs()` from `astrostyle/js/tabs`: WAI-ARIA tabs from plain buttons and panels, roving tabindex, arrows, Home and End, automatic or manual activation, horizontal or vertical, `ap:change`.
- `ap-c-toast` with `createToaster()` from `astrostyle/js/toast`: toasts in a polite live region, tones, optional action, `urgent` alerts, a timeout that pauses on hover and focus, at most `max` visible at once, `ap:open` and `ap:close`.
- `autoInit()` also enhances `nav[data-ap-pagination]` (`data-ap-page`, `data-ap-count`, `data-ap-href`) and `[data-ap-tabs]` (`data-ap-tabs="manual"`).
