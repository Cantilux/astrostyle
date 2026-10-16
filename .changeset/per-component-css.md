---
'astrostyle': minor
---

Per-component CSS for projects without Sass: `astrostyle/css/core` (tokens, themes, reset, elements, layouts, utilities) and `astrostyle/css/<component>` (for example `astrostyle/css/button`), each also minified as `.min`. `emit()` gains `$core` and `$components` parameters to produce the same split from Sass.
