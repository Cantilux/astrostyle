# Empty state

What a list, a panel or a search result shows when there is nothing to show: an optional icon, a title, a short text and actions. Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_empty-state.scss`.

## Markup

```html
<section class="ap-c-empty-state" aria-labelledby="inbox-empty">
  <svg class="ap-c-empty-state__icon" aria-hidden="true">…</svg>
  <h3 class="ap-c-empty-state__title" id="inbox-empty">No transmissions</h3>
  <p class="ap-c-empty-state__text">Nobody has hailed the ship in this cycle.</p>
  <div class="ap-o-cluster"><button class="ap-c-button ap-c-button--primary" type="button">Open a channel</button></div>
</section>
```

## Rules

- Say why it is empty and what to do next; keep the text short (`--ap-empty-state-text-max`, default 48ch).
- The icon is decorative (`aria-hidden="true"`); use a heading level that fits the page outline.
- The dashed frame marks a placeholder; remove it with `--ap-empty-state-border-color: transparent`.
