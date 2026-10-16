# Combobox

The searchable select built by `createCombobox()` (or `autoInit()`) from a native `<select>`, following the WAI-ARIA editable combobox with a listbox popup. The native select stays in the form, hidden and in sync. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_combobox.scss`. Behavior: `js/combobox/`.

## Markup you write

```html
<label for="ship">Ship</label>
<select class="ap-c-input ap-c-select" id="ship" name="ship" data-ap-combobox aria-describedby="ship-hint">
  <option value="">Search the registry</option>   <!-- empty value: placeholder and "no choice" -->
  <option value="heron">Night Heron</option>
  <option value="dawn" disabled>Cybérillic Dawn</option>
</select>
```

```js
import { autoInit, createCombobox } from 'astrostyle/js'
autoInit(document) // every select[data-ap-combobox]; data-ap-creatable accepts free text
const handle = createCombobox(select, { creatable: true, labels: { noResults: 'Nessun risultato' } })
```

## What the script builds

`div.ap-c-combobox` after the select, with `input.ap-c-input.ap-c-combobox__input[role=combobox]` (takes the select's id, `aria-describedby`, `aria-invalid`, `required`, `disabled`), `button.ap-c-combobox__toggle`, `div.ap-c-combobox__popup` (`ul.ap-c-combobox__listbox[role=listbox]` with `li.ap-c-combobox__option[role=option]`, `p.ap-c-combobox__empty`) and a polite live region announcing the result count.

## Behavior

| Input | Effect |
| --- | --- |
| Typing | Filters (case and diacritics ignored, prefix matches first) and opens; the first match becomes active |
| `↓` / `↑` | Opens and activates the selected, first or last option; then moves, skipping disabled options |
| `Alt` + `↓` | Opens without activating |
| `Enter` | Chooses the active option; with `creatable`, unmatched text becomes a new option |
| `Esc` | Closes and restores the selected label |
| Leaving the field | Exact label → chosen; empty → placeholder value; other text → reverted (or created if `creatable`) |
| Toggle button, clicks | Open the full list; clicking an enabled option chooses it |

## API

- Options: `creatable`, `placeholder`, `labels` (`noResults`, `results(count)`, `create(text)`, `toggle`), `filter(options, query)`.
- The native select stays the source of truth: options added or removed later are picked up the next time the list opens or `setValue()` runs.
- Handle: `element`, `getValue()`, `setValue(value)` (no events), `open()`, `close()`, `destroy()` (restores the select and its id).
- Events on the select: `input` and `change` on user choices, `ap:change` (`detail: { value, label, created }`), `ap:open`, `ap:close`.
