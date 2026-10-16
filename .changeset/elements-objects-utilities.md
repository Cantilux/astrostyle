---
'astrostyle': minor
---

Elements, Objects and Utilities layers:

- Elements: themed page colors, body text, headings mapped to type roles (`$element-roles`), Design Guide emphasis (Medium bold, Instrument Serif italics), code, quotes, links with dedicated `link`/`link-hover` tokens, content lists, tables, fieldsets, captions, focus ring and selection. Switch off with `$emit-elements: false`.
- Objects: `ap-o-container`, `ap-o-stack`, `ap-o-cluster`, `ap-o-grid`, `ap-o-sidebar`, `ap-o-switcher`, `ap-o-frame`, tuned with non-inheriting custom properties and generated modifiers.
- Utilities: `ap-u-visually-hidden(-focusable)`, `ap-u-text-<role>`, `ap-u-truncate` and display utilities with mobile-first `@sm`/`@md`/`@lg`/`@xl` variants.
- Type roles gain a `case` (uppercase titles and labels).
