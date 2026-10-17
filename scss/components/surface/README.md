# Surface

A decorative area with the Design Guide's print textures behind its content: halftone dots or CRT scanlines, plus an optional noise grain. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_surface.scss`.

## Markup

```html
<div class="ap-c-surface ap-c-surface--halftone ap-c-surface--noise">…</div>
<div class="ap-c-surface ap-c-surface--crt" data-ap-theme="dark">…</div>
```

## Modifiers

- `--halftone`: the guide's halftone dots.
- `--crt`: horizontal scanlines (the companion app's signature, not the guide's).
- `--noise`: a fine grain; combine it with either of the others.
- `--halftone` and `--crt` share one layer: use one of them.

## Sass

`ap.surface($kind)` (`halftone`, `noise` or `crt`) paints the same texture as the background image of any rule:

```scss
.hero { @include ap.surface(halftone); }
```

## Rules

- Decoration only: keep surfaces behind headings, art and empty areas, never under forms, tables or long text.
- The textures sit behind the content (`isolation: isolate`), so children stay crisp and clickable. They follow the theme: halftone dots use the text color.
- Tune them with `--ap-surface-pattern-opacity` and `--ap-surface-grain-opacity`.
