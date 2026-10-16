---
'astrostyle': minor
---

First JavaScript module and the searchable select:

- `ap-c-select`: a native `<select>` styled like an input (use with `ap-c-input`).
- `ap-c-combobox` with `createCombobox()` from `astrostyle/js/combobox`: turns a native select into a searchable combobox (WAI-ARIA editable combobox), keeps the select in the form and in sync, supports free text with `creatable`, custom labels and filter, and fires `change`, `ap:change`, `ap:open`, `ap:close`.
- `autoInit()` from `astrostyle/js` enhances every `select[data-ap-combobox]` (`data-ap-creatable` for free text).
- Fields align their content to the top, so controls keep their height next to taller fields.
