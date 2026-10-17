# astrostyle

## 0.3.5

### Minor Changes

- 4867ef5: Fixes from a code audit. **Breaking:** `astrostyle/js` now exports only the public API: `autoInit`, `createCombobox`, `createPagination`, `createTabs`, `createToaster`, `pageWindow` and the default texts as `comboboxLabels` (was `defaultLabels`), `paginationLabels`, `toastLabels`. Internal helpers (`filterOptions`, `findByLabel`, `normalize`, `moveActive`, `firstEnabled`, `PAGE_GAP`, `clampPage`, `nextEnabledTab`, `tabTargetForKey`, `emptyToastQueue`, `enqueueToast`, `removeToast`) are no longer exported.
  
  - Builds with `$scope` now apply child, state and pseudo-class rules to the right elements. Before, rules such as `.ap-c-button-group > *`, the sidebar, switcher and frame children, the disabled field label and `ap-u-visually-hidden-focusable` matched the container (or every field) instead. Scoped selectors are now `.ap-c-x:where(<scope>, <scope> *)`, still one class of specificity.
  - The toast region is never hidden with `display: none`, so screen readers announce the first toast too.
  - The combobox reads the native select again when the list opens and in `setValue()`, so options added after setup are listed.
  - `autoInit()` reports an element it cannot enhance on the console and goes on with the others, instead of stopping.

### Patch Changes

- 0c9ef83: `ap-c-callout`: the default gap between title, text and actions grows from `--ap-space-xs` to `--ap-space-sm`, so the content no longer looks cramped. Set `--ap-callout-gap` to keep the old value.

## 0.3.0

### Minor Changes

- 646c71c: Navigation and feedback components, CSS only:
  
  - `ap-c-breadcrumb`: the path to the current page, joined by the guide's slash (`--ap-breadcrumb-separator` to change it); separators are hidden from screen readers.
  - `ap-c-tag`: pill label for statuses, categories and counts, with `--accent`, `--success`, `--warning`, `--danger`, `--info` tones, `--solid` fill and any color through `--ap-tag-tone`.
  - `ap-c-callout`: the guide's filled block with an optional title; tones add a start bar and tint the fill.
  - `ap-c-progress`: a native `<progress>` as a pill bar, with status colors and an indeterminate sweep.
  - `ap-c-spinner`: a CSS-only turning ring, with `--sm`, `--lg` and the guide's four-band `--spectrum`.
  - `ap-c-empty-state`: icon, title, text and actions for empty lists and panels.
- 48c04b3: Pagination, tabs and toasts, with their JavaScript modules:
  
  - `ap-c-pagination` with `createPagination()` from `astrostyle/js/pagination`: renders links (`href(page)`) or buttons with previous and next steps and a constant-length page window (`siblings`, `boundaries`), fires a cancelable `ap:page`; `pageWindow()` is exported as pure logic.
  - `ap-c-tabs` with `createTabs()` from `astrostyle/js/tabs`: WAI-ARIA tabs from plain buttons and panels, roving tabindex, arrows, Home and End, automatic or manual activation, horizontal or vertical, `ap:change`.
  - `ap-c-toast` with `createToaster()` from `astrostyle/js/toast`: toasts in a polite live region, tones, optional action, `urgent` alerts, a timeout that pauses on hover and focus, at most `max` visible at once, `ap:open` and `ap:close`.
  - `autoInit()` also enhances `nav[data-ap-pagination]` (`data-ap-page`, `data-ap-count`, `data-ap-href`) and `[data-ap-tabs]` (`data-ap-tabs="manual"`).

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
