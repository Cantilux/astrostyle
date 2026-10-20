---
'astrostyle': minor
---

The JavaScript modules now ship TypeScript declarations. `astrostyle/js` and `astrostyle/js/<component>` resolve their types from `dist/types/` through a `types` export condition, and every module exports its `<Name>Options` and `<Name>Handle` types; the runtime behavior is unchanged.
