# Window

The Design Guide's window panel: a hairline frame under a title bar, with an optional index badge. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_window.scss`.

## Markup

```html
<section class="ap-c-window" aria-labelledby="export">
  <div class="ap-c-window__bar">
    <h3 class="ap-c-window__title" id="export">Export as image</h3>
    <span class="ap-c-window__index">02</span>
  </div>
  <div class="ap-c-window__body">…</div>
</section>
```

## Rules

- The bar uses the theme's inverse colors (`--ap-window-bar-bg` is the text color, `--ap-window-bar-fg` the page color): dark on the light theme, light on the dark one.
- Give the window a name through its title (`aria-labelledby`) when it groups a region; a plain `<div>` is fine for decoration.
- The body has no layout of its own: put an `ap-o-stack` inside, or add it to the body element.
- Content is clipped to the rounded frame (`overflow: clip`); scrolling content needs its own scroll container.
