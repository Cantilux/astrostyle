# Drawer

A native `<dialog>` that slides in along the full height of the end edge, or of the start edge with `--start`. It shares `createDialog()` with the dialog. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_drawer.scss`.

## Markup

```html
<button class="ap-c-button" type="button" data-ap-dialog-open="filters">Filters</button>

<dialog class="ap-c-drawer" id="filters" aria-labelledby="filters-title" data-ap-dialog>
  <header class="ap-c-drawer__header">
    <h2 class="ap-c-drawer__title" id="filters-title">Filters</h2>
    <button class="ap-c-button ap-c-button--quiet ap-c-button--icon" type="button" data-ap-dialog-close aria-label="Close">×</button>
  </header>
  <div class="ap-c-drawer__body">…</div>
  <footer class="ap-c-drawer__footer">…</footer>
</dialog>
```

## Modifiers

- `--start`: slides in from the start edge.

## Rules

- Same behavior and rules as the dialog (`scss/components/dialog/README.md`): openers, close buttons, Escape, backdrop click, focus return, `ap:open` and `ap:close`.
- It takes the full width below `--ap-drawer-width` (24rem by default).
- The backdrop color is `--ap-drawer-backdrop`.
