# Spinner

A turning ring for short waits, drawn with CSS only. For a task with known progress, use `ap-c-progress`. Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_spinner.scss`.

## Markup

```html
<span class="ap-o-cluster ap-o-cluster--gap-sm" role="status">
  <span class="ap-c-spinner" aria-hidden="true"></span> Plotting course…
</span>

<button class="ap-c-button" type="button" disabled>
  <span class="ap-c-spinner ap-c-spinner--sm" aria-hidden="true"></span> Saving
</button>
```

## Rules

- The ring is decorative (`aria-hidden="true"`); the text next to it, inside a `role="status"` region, tells assistive technology what is happening. Without visible text, put it in an `ap-u-visually-hidden` span.
- Modifiers: `--sm` (16px), `--lg` (48px, thicker ring), `--spectrum` (the guide's four bands).
- One turn lasts `--ap-spinner-duration` (default 3 × `--ap-duration-slow`); set it, or the duration tokens, to `0s` to stop it.
