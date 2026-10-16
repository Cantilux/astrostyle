# astrostyle

## 0.1.0

### Minor Changes

- ab0be1d: First foundation of the framework:
  
  - Design Guide palette, type roles, spacing, sizes, shapes, elevation, motion, z-index and breakpoints as CSS custom properties, plus light and dark themes selectable with `data-ap-theme`.
  - Universal box model and reset at zero specificity, inside the `astrostyle.*` cascade layers.
  - Sass API: configure everything with `@use 'astrostyle' with (...)` (`$accent`, `$scope`, `$prefix`, `$themes`, …) and use `token()`, `space()`, `text()`, `mq()`, `cq()`, `focus-ring`, `interactive`, `cut-corners`, `spectrum`, `variant()`, `theme()` and `accent()`.
  - `dist/astrostyle.css`, `dist/astrostyle.min.css` and `dist/tokens.json` (W3C Design Tokens format).
