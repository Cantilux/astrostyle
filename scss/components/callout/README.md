# Callout

The Design Guide's filled block for a note, a tip or a warning, with an optional title. Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_callout.scss`.

## Markup

```html
<aside class="ap-c-callout ap-c-callout--warning" aria-labelledby="fuel-title">
  <h3 class="ap-c-callout__title" id="fuel-title">Low fuel</h3>
  <p>Two jumps left before the reserve.</p>
</aside>
```

## Modifiers

- Tones: `--accent`, `--success`, `--warning`, `--danger`, `--info`. Each adds a bar on the start edge and tints the fill. Without one, the callout is the guide's plain off-white block.
- Any color: set `--ap-callout-tone` and `--ap-callout-bar-width`.

## Rules

- Pick the element by meaning: `<aside>` for side notes, `<div role="note">` inside text, `role="alert"` only for a message that appears after an action and needs to interrupt.
- The tone never carries meaning alone: say it in the title or the text.
- Children are spaced by `--ap-callout-gap`; put an `ap-o-cluster` of buttons inside for actions.
