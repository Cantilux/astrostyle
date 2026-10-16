# Segmented meter

Discrete pips filled up to a value, drawn with CSS only (no child elements). Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_meter.scss`.

## Markup

```html
<div class="ap-c-meter ap-c-meter--danger" role="meter" aria-label="Hull"
     aria-valuemin="0" aria-valuemax="8" aria-valuenow="3"
     style="--ap-meter-value: 3; --ap-meter-max: 8"></div>
```

## Rules

- `--ap-meter-max` is the number of segments; `--ap-meter-value` the filled ones.
- Keep `aria-valuenow`/`aria-valuemax` in sync with the two properties.
- Modifiers: `--success`, `--warning`, `--danger` (fill color).
