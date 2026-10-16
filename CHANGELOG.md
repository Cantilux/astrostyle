# astrostyle

## 0.2.0

### Minor Changes

- e8d7452: First JavaScript module and the searchable select:
  
  - `ap-c-select`: a native `<select>` styled like an input (use with `ap-c-input`).
  - `ap-c-combobox` with `createCombobox()` from `astrostyle/js/combobox`: turns a native select into a searchable combobox (WAI-ARIA editable combobox), keeps the select in the form and in sync, supports free text with `creatable`, custom labels and filter, and fires `change`, `ap:change`, `ap:open`, `ap:close`.
  - `autoInit()` from `astrostyle/js` enhances every `select[data-ap-combobox]` (`data-ap-creatable` for free text).
  - Fields align their content to the top, so controls keep their height next to taller fields.
- 399978c: Elements, Objects and Utilities layers:
  
  - Elements: themed page colors, body text, headings mapped to type roles (`$element-roles`), Design Guide emphasis (Medium bold, Instrument Serif italics), code, quotes, links with dedicated `link`/`link-hover` tokens, content lists, tables, fieldsets, captions, focus ring and selection. Switch off with `$emit-elements: false`.
  - Objects: `ap-o-container`, `ap-o-stack`, `ap-o-cluster`, `ap-o-grid`, `ap-o-sidebar`, `ap-o-switcher`, `ap-o-frame`, tuned with non-inheriting custom properties and generated modifiers.
  - Utilities: `ap-u-visually-hidden(-focusable)`, `ap-u-text-<role>`, `ap-u-truncate` and display utilities with mobile-first `@sm`/`@md`/`@lg`/`@xl` variants.
  - Type roles gain a `case` (uppercase titles and labels).
- 6f6ab34: First components:
  
  - `ap-c-button` with `--primary`, `--quiet`, `--danger`, `--lg`, `--icon`, `--square`, `--cut`, pressed and disabled states; `ap-c-button-group` for segmented controls.
  - `ap-c-field` (label, hint, error) and `ap-c-input` for text inputs and textareas.
  - `ap-c-checkbox` (with indeterminate), `ap-c-radio`, `ap-c-switch` and `ap-c-range` on native inputs.
  - `ap-c-meter`, a segmented meter drawn with CSS only, with status colors.
  - Every component reads public `--ap-<component>-<token>` tokens with defaults; `$components` selects which ones are emitted.
  - New `action` type role and `on-danger`, `danger-text` theme tokens.
- d96376a: Per-component CSS for projects without Sass: `astrostyle/css/core` (tokens, themes, reset, elements, layouts, utilities) and `astrostyle/css/<component>` (for example `astrostyle/css/button`), each also minified as `.min`. `emit()` gains `$core` and `$components` parameters to produce the same split from Sass.

## 0.1.0

### Minor Changes

- ab0be1d: First foundation of the framework:
  
  - Design Guide palette, type roles, spacing, sizes, shapes, elevation, motion, z-index and breakpoints as CSS custom properties, plus light and dark themes selectable with `data-ap-theme`.
  - Universal box model and reset at zero specificity, inside the `astrostyle.*` cascade layers.
  - Sass API: configure everything with `@use 'astrostyle' with (...)` (`$accent`, `$scope`, `$prefix`, `$themes`, …) and use `token()`, `space()`, `text()`, `mq()`, `cq()`, `focus-ring`, `interactive`, `cut-corners`, `spectrum`, `variant()`, `theme()` and `accent()`.
  - `dist/astrostyle.css`, `dist/astrostyle.min.css` and `dist/tokens.json` (W3C Design Tokens format).
