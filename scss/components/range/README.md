# Range

A native range input with a pill track and a round thumb; the hit area stays 40px tall. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_range.scss`.

## Markup

```html
<div class="ap-c-field">
  <label class="ap-c-field__label" for="thrust">Thrust</label>
  <input class="ap-c-range" id="thrust" type="range" min="0" max="10" value="6">
</div>
```

## States

- `:focus-visible` (focus ring), `:disabled` (muted thumb).
- Arrow keys, Page Up/Down, Home and End work as the browser provides.
