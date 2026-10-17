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
