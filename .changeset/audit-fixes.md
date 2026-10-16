---
'astrostyle': minor
---

Fixes from a code audit. **Breaking (0.x minor):** `astrostyle/js` now exports only the public API: `autoInit`, `createCombobox`, `createPagination`, `createTabs`, `createToaster`, `pageWindow` and the default texts as `comboboxLabels` (was `defaultLabels`), `paginationLabels`, `toastLabels`. Internal helpers (`filterOptions`, `findByLabel`, `normalize`, `moveActive`, `firstEnabled`, `PAGE_GAP`, `clampPage`, `nextEnabledTab`, `tabTargetForKey`, `emptyToastQueue`, `enqueueToast`, `removeToast`) are no longer exported.

- Builds with `$scope` now apply child, state and pseudo-class rules to the right elements. Before, rules such as `.ap-c-button-group > *`, the sidebar, switcher and frame children, the disabled field label and `ap-u-visually-hidden-focusable` matched the container (or every field) instead. Scoped selectors are now `.ap-c-x:where(<scope>, <scope> *)`, still one class of specificity.
- The toast region is never hidden with `display: none`, so screen readers announce the first toast too.
- The combobox reads the native select again when the list opens and in `setValue()`, so options added after setup are listed.
- `autoInit()` reports an element it cannot enhance on the console and goes on with the others, instead of stopping.
