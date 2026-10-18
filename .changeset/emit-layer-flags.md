---
'astrostyle': minor
---

`$emit-objects` and `$emit-utilities` leave the Objects (`ap-o-*`) and Utilities (`ap-u-*`) layers out of `emit()`, like `$emit-elements` does for the Elements layer. Both default to `true`; the cascade layer order is still declared in full.
