// Declarative setup: enhances every element that asks for it with a `data-ap-*` attribute.
import { createCombobox } from '../combobox/index.js'

// Enhances `select[data-ap-combobox]` under `root` (free text with `data-ap-creatable`) and
// returns the handles; elements already enhanced are skipped.
export function autoInit(root = document) {
  const handles = []
  for (const select of root.querySelectorAll('select[data-ap-combobox]:not([data-ap-enhanced])')) {
    select.setAttribute('data-ap-enhanced', '')
    handles.push(createCombobox(select, { creatable: select.hasAttribute('data-ap-creatable') }))
  }
  return handles
}
