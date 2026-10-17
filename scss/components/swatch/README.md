# Swatch

The Design Guide's rounded color tile, with the color's name and value beside it. Docs: `site/pages/blocks.html` and the palette on `site/pages/foundations.html`. Tokens: `$tokens` in `_swatch.scss`.

## Markup

```html
<div class="ap-c-swatch" style="--ap-swatch-color: var(--ap-palette-pink)">
  <span class="ap-c-swatch__chip"></span>
  <strong class="ap-c-swatch__name">ASTROPRISMA Pink</strong>
  <code class="ap-c-swatch__value">#ef476e</code>
</div>
```

## Rules

- Set the color with `--ap-swatch-color` on each swatch.
- The chip is decoration: the name and value carry the information, so never leave them out.
- The value is optional; long values break anywhere instead of overflowing.
