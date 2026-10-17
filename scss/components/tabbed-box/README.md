# Tabbed box

The Design Guide's framed box with a vertical tab label on its start edge, read from bottom to top. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_tabbed-box.scss`.

## Markup

```html
<section class="ap-c-tabbed-box" aria-labelledby="resources">
  <h3 class="ap-c-tabbed-box__tab" id="resources">Free resources</h3>
  <div class="ap-c-tabbed-box__body">…</div>
</section>
```

## Rules

- The tab is a label, not a control: it is not a tab of `ap-c-tabs`. Use a heading and point the box's `aria-labelledby` at it.
- Keep the label short (one or two words): it does not wrap, and the box is at least as tall as the label is long.
- The body has no layout of its own: put an `ap-o-stack` inside, or add it to the body element.
