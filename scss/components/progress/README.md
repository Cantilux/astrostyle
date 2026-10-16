# Progress

A native `<progress>` drawn as a continuous pill bar; without a value it is indeterminate and a band sweeps along the track. For discrete steps or a level that is not a task's progress, use the segmented `ap-c-meter`. Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_progress.scss`.

## Markup

```html
<label for="scan">Sector scan</label>
<progress class="ap-c-progress" id="scan" max="100" value="40">40%</progress>

<progress class="ap-c-progress" aria-label="Downloading charts"></progress>  <!-- indeterminate -->
```

## Rules

- Native semantics: `value` and `max` are announced by screen readers; the text inside is the fallback for old browsers. Remove `value` (not `value="0"`) to make it indeterminate.
- Give it an accessible name: a `<label>`, `aria-label` or `aria-labelledby`.
- Modifiers: `--success`, `--warning`, `--danger` (fill color).
- The sweep lasts `--ap-progress-duration` (default 5 × `--ap-duration-slow`); set it, or the duration tokens, to `0s` to stop it.
