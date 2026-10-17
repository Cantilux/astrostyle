# Table

A framed region that scrolls sideways around a native `<table>`, with a tinted header, optional stripes and a compact density. Cells keep the element defaults: label-style headers and tabular numbers. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_table.scss`.

## Markup

```html
<div class="ap-c-table" role="region" aria-labelledby="manifest" tabindex="0">
  <table>
    <caption id="manifest">Manifest, cycle 7</caption>
    <thead><tr><th scope="col">Item</th><th class="ap-c-table__numeric" scope="col">Qty</th></tr></thead>
    <tbody><tr><td>Plasma cells</td><td class="ap-c-table__numeric">12</td></tr></tbody>
  </table>
</div>
```

## Modifiers

- `--striped`: tints every other body row.
- `--compact`: smaller cell padding.

## Rules

- The class goes on the wrapper. Give it `role="region"`, a name (`aria-labelledby` on the caption) and `tabindex="0"`, so keyboard users can scroll a wide table.
- `ap-c-table__numeric` aligns a cell to the end; use it on the column's header too.
- Use `<th scope="col">` and `<th scope="row">` for headers; layout grids are objects, not tables.
