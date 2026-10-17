# Segment bar

The Design Guide's outlined pill legend, split into labelled segments. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_segment-bar.scss`.

## Markup

```html
<ul class="ap-c-segment-bar" aria-label="Blacks">
  <li class="ap-c-segment-bar__segment">Rich black</li>
  <li class="ap-c-segment-bar__segment">ASTROPRISMA Black</li>
  <li class="ap-c-segment-bar__segment">Basic black</li>
</ul>
```

## Rules

- A legend or a static breakdown, not a control: for a choice between options use `ap-c-button-group`.
- Use a list with an accessible name, so the number of segments is announced.
- Segments share the width and wrap when it runs out; the dividers follow the wrapped rows.
