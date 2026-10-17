# Divider

A hairline that separates content, on an `<hr>` or around a short label. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_divider.scss`.

## Markup

```html
<hr class="ap-c-divider">
<div class="ap-c-divider">Or</div>
```

## Modifiers

- `--strong`: a thicker, stronger line.

## Rules

- `<hr>` for a thematic break: screen readers announce a separator. A `<div>` with a label reads only the label; the lines are generated content.
- Keep the label to a word or two. The divider has no margins: space it with an object.
