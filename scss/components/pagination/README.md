# Pagination

Page links (or buttons) with previous and next steps, rendered into a `<nav>` by `createPagination()` or `autoInit()`. Docs: `site/pages/navigation.html`. Tokens: `$tokens` in `_pagination.scss`. Behavior: `js/pagination/`.

## Markup you write

```html
<!-- Links: works as plain navigation; the server renders the page -->
<nav data-ap-pagination data-ap-page="2" data-ap-count="12" data-ap-href="?page={page}" aria-label="Log pages"></nav>
```

```js
import { autoInit, createPagination } from 'astrostyle/js'
autoInit(document)
// Buttons: the page changes in place and `ap:page` tells you which one to load
const pages = createPagination(nav, { page: 1, count: 12, labels: { previous: 'Pagina precedente' } })
nav.addEventListener('ap:page', (event) => loadPage(event.detail.page))
```

Without JavaScript, write the same structure by hand (below) with links: the styles do not depend on the script.

## What the script builds

`ul.ap-c-pagination__list` with `li.ap-c-pagination__item`, each holding an `a` (with `href`) or a `button.ap-c-pagination__link`: the previous step (`.ap-c-pagination__step` with an `svg.ap-c-pagination__icon`), the page window, gaps (`span.ap-c-pagination__gap`, hidden from assistive technology) and the next step. The current page has `aria-current="page"`; every link has an `aria-label` ("Page 3"); steps at either end are `disabled` (buttons) or `aria-disabled="true"` without `href` (links). The `<nav>` gets `aria-label="Pagination"` unless it already has a name.

## API

- Options: `page`, `count`, `siblings` (pages on each side of the current one, default 1), `boundaries` (pages kept at each end, default 1), `href(page)` (render links), `labels` (`nav`, `previous`, `next`, `page(n)`).
- Handle: `element`, `getPage()`, `getCount()`, `setPage(page)` and `setCount(count)` (no events), `destroy()` (restores the original content).
- `ap:page` on the `<nav>` (`detail: { page, previous }`, cancelable). Buttons: canceling keeps the current page. Links: they navigate, unless a listener cancels the event, which turns the click into client-side routing (the control updates, the browser does not navigate).
- Pure logic: `pageWindow({ page, count, siblings, boundaries })` returns page numbers and `'gap'` markers with a constant length, so the control does not jump while paging.
