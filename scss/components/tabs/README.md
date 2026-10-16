# Tabs

A tablist of buttons over its panels, following the WAI-ARIA tabs pattern, wired by `createTabs()` or `autoInit()`. Docs: `site/pages/navigation.html`. Tokens: `$tokens` in `_tabs.scss`. Behavior: `js/tabs/`.

## Markup you write

```html
<div class="ap-c-tabs" data-ap-tabs>
  <div class="ap-c-tabs__list" aria-label="Ship">
    <button class="ap-c-tabs__tab" type="button">Crew</button>
    <button class="ap-c-tabs__tab" type="button" aria-selected="true">Cargo</button>
    <button class="ap-c-tabs__tab" type="button" disabled>Vault</button>
  </div>
  <section class="ap-c-tabs__panel">…</section>
  <section class="ap-c-tabs__panel">…</section>
  <section class="ap-c-tabs__panel">…</section>
</div>
```

```js
import { autoInit, createTabs } from 'astrostyle/js'
autoInit(document)                          // every [data-ap-tabs]; data-ap-tabs="manual" for manual activation
const tabs = createTabs(root, { activation: 'manual' })
```

One panel per tab, in the same order. Without JavaScript every panel stays visible, one after the other.

## What the script adds

`role="tablist"` on the list (`aria-orientation="vertical"` with `orientation: 'vertical'`), `role="tab"`, `aria-selected`, `aria-controls` and a roving `tabindex` on the tabs, `role="tabpanel"`, `aria-labelledby`, `tabindex="0"` and `hidden` on the panels. Missing ids are generated. The first tab with `aria-selected="true"` starts selected, else the first enabled one.

## Behavior

| Input | Effect |
| --- | --- |
| `Tab` | Enters the tablist on the selected tab, then moves to its panel |
| `←` / `→` (`↑` / `↓` when vertical) | Previous or next enabled tab, wrapping; selects it with automatic activation |
| `Home` / `End` | First or last enabled tab |
| `Enter`, `Space`, click | Selects the focused tab (manual activation) |

## API

- Options: `selected` (index), `activation` (`automatic`, the default, or `manual`), `orientation` (`horizontal` or `vertical`).
- Handle: `element`, `getSelected()`, `select(index)` (no event), `destroy()` (restores the original attributes).
- `ap:change` on the root (`detail: { index, previous, tab, panel }`) when the user selects a tab.
