# Select

A native `<select>` drawn like an input, with a chevron that follows the theme. Works without JavaScript; add `data-ap-combobox` to upgrade it to a searchable combobox. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_select.scss`.

## Markup

```html
<select class="ap-c-input ap-c-select" id="class" name="class">
  <option value="">Choose a class</option>
  <option>Courier</option>
</select>
```

## Rules

- Always combined with `ap-c-input`, which provides box, colors and states; `ap-c-select` adds the chevron and its padding (emitted after the input).
- `:disabled` shows a not-allowed cursor; other states come from the input.
