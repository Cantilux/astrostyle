---
'astrostyle': minor
---

First components:

- `ap-c-button` with `--primary`, `--quiet`, `--danger`, `--lg`, `--icon`, `--square`, `--cut`, pressed and disabled states; `ap-c-button-group` for segmented controls.
- `ap-c-field` (label, hint, error) and `ap-c-input` for text inputs and textareas.
- `ap-c-checkbox` (with indeterminate), `ap-c-radio`, `ap-c-switch` and `ap-c-range` on native inputs.
- `ap-c-meter`, a segmented meter drawn with CSS only, with status colors.
- Every component reads public `--ap-<component>-<token>` tokens with defaults; `$components` selects which ones are emitted.
- New `action` type role and `on-danger`, `danger-text` theme tokens.
