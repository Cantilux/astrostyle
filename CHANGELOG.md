# astrostyle

## 0.5.1

### Patch Changes

- c3a4337: Behavior fixes: a `required` combobox no longer blocks form submission silently (the input carries `required`), a form reset updates the combobox text, `creatable` no longer duplicates a disabled option, a drag from inside a dialog to its backdrop no longer closes it, menus and tooltips follow page scroll and resize while open, menus pick up items added after setup, and the dev server listens on `127.0.0.1` only.

## 0.5.0

### Minor Changes

- 0a769f9: `$emit-objects` and `$emit-utilities` leave the Objects (`ap-o-*`) and Utilities (`ap-u-*`) layers out of `emit()`, like `$emit-elements` does for the Elements layer. Both default to `true`; the cascade layer order is still declared in full.

## 0.4.1

### Patch Changes

- d77187e: Bundle the Design Guide fonts whose license allows redistribution (Feature Mono, Instrument Serif, Genesys, ST-Cyberillic) in `fonts/`, with the optional `astrostyle/fonts.css` and the `scss/fonts` module declaring them. Powerr, Rimma Sans and SCHABO get their faces from the project's own files through `$licensed-path`. The docs site now uses the bundled fonts.
- The Foundations page gets a Fonts section: a sample of each font-family token, its intended use and how its files are loaded. The README typography table lists the tokens and what uses them.
- `bun run dev` no longer stalls after a few page changes: each page closes its reload stream when it is left, so earlier pages stop holding the browser's connections.

## 0.4.0

### Minor Changes

- 5958f1f: The Design Guide's blocks, CSS only:
  
  - `ap-c-masthead`: a small tracked eyebrow over a display title that grows with the viewport (`--ap-masthead-title-size`).
  - `ap-c-section-heading`: pink title, hairline rule and an optional two-digit index on the end side.
  - `ap-c-subheading`: the guide's `/ TITLE /` subheading; the slashes are generated content screen readers skip (`--ap-subheading-slash`).
  - `ap-c-window`: a hairline frame under a title bar in the theme's inverse colors, with an optional index badge.
  - `ap-c-card`: the rounded card surface, without layout of its own; as a link or a button it reacts to hover and focus.
  - `ap-c-tabbed-box`: a framed box with a vertical tab label on its start edge.
  - `ap-c-segment-bar`: an outlined pill legend split into labelled segments that wrap on narrow widths.
  - `ap-c-swatch`: a rounded color tile with a name and a value (`--ap-swatch-color`).
- 933bac8: Containers and data:
  
  - `ap-c-dialog` with `createDialog()` from `astrostyle/js/dialog`: a native modal `<dialog>` with header, scrolling body and footer; openers (`data-ap-dialog-open`), close buttons whose `value` becomes the return value (`data-ap-dialog-close`), backdrop close (`dismissible`), focus return, `ap:open` and `ap:close`.
  - `ap-c-drawer`: the same dialog along the full height of the end edge, `--start` for the start edge.
  - `ap-c-accordion`: a native `<details>` with a chevron; the same `name` opens one at a time.
  - `ap-c-table`: a framed, focusable region that scrolls a native table sideways, with `--striped`, `--compact` and end-aligned `__numeric` cells.
  - `ap-c-list`: rows split by hairlines, end-side meta text and full-row links (`--plain` without hairlines).
  - `ap-c-divider`: a hairline on an `<hr>` or around a short label, `--strong`.
  - `ap-c-kbd`: a key cap.
  - `ap-c-skeleton`: a pulsing placeholder line, `--block` and `--circle`.
  - `autoInit()` also enhances `dialog[data-ap-dialog]` (`data-ap-dialog="static"` ignores backdrop clicks).
- aa63e88: Tooltips, menus and textured surfaces:
  
  - `ap-c-tooltip` with `createTooltip()` from `astrostyle/js/tooltip`: a hint in a popover, in the theme's inverse colors, shown on hover after a delay and on keyboard focus, kept while the pointer is on it, hidden on Escape; placed above the trigger, below when there is no room.
  - `ap-c-menu` with `createMenu()` from `astrostyle/js/menu`: a WAI-ARIA menu button over a popover; arrow keys, Home, End, type-to-jump, Escape and light dismiss with focus back on the button, `ap:select` with the chosen item's value, `ap:open` and `ap:close`; `__separator`, `__icon` and `__item--danger`.
  - `ap-c-surface` with `--halftone`, `--crt` and `--noise`: the Design Guide's print textures behind a decorative area's content; the `ap.surface($kind)` mixin paints the same textures on any rule.
  - `autoInit()` also enhances `[data-ap-menu]` and `[data-ap-tooltip]`.

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
