# Subheading

The Design Guide's slash-delimited subheading, "/ TITLE /". Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_subheading.scss`.

## Markup

```html
<h3 class="ap-c-subheading">Colors</h3>
```

## Rules

- Use it on a real heading. Write the title only: the slashes are generated content with empty alternative text, so screen readers skip them.
- Change the delimiter with `--ap-subheading-slash` (a CSS string, e.g. `"//"`) and its color with `--ap-subheading-slash-color`.
