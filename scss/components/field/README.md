# Field

Label, control, hint and error stacked together. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_field.scss`.

## Markup

```html
<div class="ap-c-field">
  <label class="ap-c-field__label" for="course">Course</label>
  <input class="ap-c-input" id="course" aria-describedby="course-hint course-error" aria-invalid="true">
  <p class="ap-c-field__hint" id="course-hint">Sector or coordinates.</p>
  <p class="ap-c-field__error" id="course-error">Unknown sector.</p>
</div>
```

## Rules

- Elements: `__label` (label role), `__hint` (caption, subtle), `__error` (caption, `danger-text`).
- A field containing a disabled control dims its label.
- Errors: `aria-invalid="true"` on the control, `aria-describedby` pointing at the error.
