# List

Rows of related items split by hairlines, each with optional meta text on the end side. A row can be one link or button that fills it. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_list.scss`.

## Markup

```html
<ul class="ap-c-list">
  <li class="ap-c-list__item">Vega <span class="ap-c-list__meta">Pilot</span></li>
  <li class="ap-c-list__item">
    <a class="ap-c-list__link" href="/crew/okonkwo" aria-current="page">Okonkwo <span class="ap-c-list__meta">Engineer</span></a>
  </li>
</ul>
```

## Modifiers

- `--plain`: no hairlines.

## Rules

- Use `<ul>` or `<ol>`; markers are removed.
- A row with an `ap-c-list__link` (`<a href>` or `<button>`) gives it the whole row, a 40px target, the hover tint and the focus ring. One link per row.
- `aria-current` on a link marks the current item (navigation lists).
- Meta text wraps under the label on narrow rows.
