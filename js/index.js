// astrostyle JavaScript entry point: every behavior module plus the declarative autoInit().
export { autoInit } from './auto-init/index.js'
export { createCombobox, defaultLabels } from './combobox/index.js'
export { filterOptions, findByLabel, normalize } from './combobox/filter.js'
export { firstEnabled, moveActive } from './combobox/navigation.js'
export { createPagination, defaultLabels as paginationLabels } from './pagination/index.js'
export { GAP as PAGE_GAP, clampPage, pageWindow } from './pagination/range.js'
export { createTabs } from './tabs/index.js'
export {
  nextEnabled as nextEnabledTab,
  targetForKey as tabTargetForKey,
} from './tabs/navigation.js'
export { createToaster, defaultLabels as toastLabels } from './toast/index.js'
export {
  emptyQueue as emptyToastQueue,
  enqueue as enqueueToast,
  remove as removeToast,
} from './toast/queue.js'
