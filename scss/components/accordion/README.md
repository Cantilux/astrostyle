# Accordion

A native `<details>` with a full-width summary row and a chevron that turns when it opens. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_accordion.scss`.

## Markup

```html
<div>
  <details class="ap-c-accordion" name="faq">
    <summary class="ap-c-accordion__summary">How far can the ship jump?</summary>
    <div class="ap-c-accordion__body"><p>Three sectors per cycle.</p></div>
  </details>
  <details class="ap-c-accordion" name="faq">
    <summary class="ap-c-accordion__summary">Who can pilot it?</summary>
    <div class="ap-c-accordion__body"><p>Anyone with a license.</p></div>
  </details>
</div>
```

## Rules

- No JavaScript: the browser opens and closes it, with Enter and Space on the summary, and announces the state.
- Accordions with the same `name` open one at a time. Without `name` they open independently.
- Hairlines separate consecutive accordions; the first child of its parent also gets one on top, so wrap a group in its own element.
- Keep the summary short: it is the button that opens the content.
