# Checkbox

A native checkbox restyled. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_checkbox.scss`.

## Markup

```html
<label class="ap-o-cluster"><input class="ap-c-checkbox" type="checkbox"> Shields</label>
```

## States

- `:checked` (accent fill and check mark), `:indeterminate` (bar; set `input.indeterminate = true` in JS).
- `aria-invalid="true"`: danger border. `:disabled`: muted box.
- Keyboard and form behavior are the browser's: `Space` toggles.
