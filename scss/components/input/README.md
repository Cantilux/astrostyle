# Input

Text-like inputs and textareas. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_input.scss`.

## Markup

```html
<input class="ap-c-input" id="course" placeholder="Sector 7G">
<textarea class="ap-c-input" id="log"></textarea>
```

## States

- `:hover` (stronger border), `:focus`/`:focus-visible` (focus border and ring).
- `aria-invalid="true"`: danger border.
- `:disabled`: surface background, disabled text. `[readonly]`: dashed border.
- Textareas get 2.5× the control height and resize vertically.
- Wrap in `ap-c-field` for label, hint and error.
