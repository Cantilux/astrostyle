// astrostyle JavaScript entry point: the public API of every behavior module plus the declarative
// autoInit(). Pure helpers stay internal to their modules.
export { autoInit } from './auto-init/index.js'
export { createCombobox, defaultLabels as comboboxLabels } from './combobox/index.js'
export { createDialog } from './dialog/index.js'
export { createMenu } from './menu/index.js'
export { createPagination, defaultLabels as paginationLabels } from './pagination/index.js'
export { pageWindow } from './pagination/range.js'
export { createTabs } from './tabs/index.js'
export { createToaster, defaultLabels as toastLabels } from './toast/index.js'
export { createTooltip } from './tooltip/index.js'

// Named types of the public API, for TypeScript consumers.
/** @typedef {import('./auto-init/index.js').Handle} Handle */
/** @typedef {import('./combobox/index.js').ComboboxOption} ComboboxOption */
/** @typedef {import('./combobox/index.js').ComboboxOptions} ComboboxOptions */
/** @typedef {import('./combobox/index.js').ComboboxHandle} ComboboxHandle */
/** @typedef {import('./dialog/index.js').DialogOptions} DialogOptions */
/** @typedef {import('./dialog/index.js').DialogHandle} DialogHandle */
/** @typedef {import('./menu/index.js').MenuOptions} MenuOptions */
/** @typedef {import('./menu/index.js').MenuHandle} MenuHandle */
/** @typedef {import('./pagination/index.js').PaginationOptions} PaginationOptions */
/** @typedef {import('./pagination/index.js').PaginationHandle} PaginationHandle */
/** @typedef {import('./tabs/index.js').TabsOptions} TabsOptions */
/** @typedef {import('./tabs/index.js').TabsHandle} TabsHandle */
/** @typedef {import('./toast/index.js').ToastContent} ToastContent */
/** @typedef {import('./toast/index.js').ToasterOptions} ToasterOptions */
/** @typedef {import('./toast/index.js').ToasterHandle} ToasterHandle */
/** @typedef {import('./tooltip/index.js').TooltipOptions} TooltipOptions */
/** @typedef {import('./tooltip/index.js').TooltipHandle} TooltipHandle */
