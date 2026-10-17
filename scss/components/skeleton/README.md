# Skeleton

A pulsing placeholder that holds the place of content while it loads. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_skeleton.scss`.

## Markup

```html
<div class="ap-o-stack ap-o-stack--gap-sm" aria-busy="true" aria-label="Loading crew">
  <span class="ap-c-skeleton ap-c-skeleton--circle"></span>
  <span class="ap-c-skeleton" style="--ap-skeleton-inline-size: 60%"></span>
  <span class="ap-c-skeleton"></span>
  <span class="ap-c-skeleton ap-c-skeleton--block"></span>
</div>
```

## Modifiers

- Default: a text line, `1em` tall.
- `--block`: a tall rounded block, for media and cards.
- `--circle`: a round avatar.

## Rules

- Skeletons are decoration: mark the region that is loading with `aria-busy="true"` and a name, and remove the skeletons when the content arrives.
- Size them like the content they stand for (`--ap-skeleton-inline-size`, `--ap-skeleton-block-size`), so the page does not jump.
- `--ap-skeleton-duration: 0s` stops the pulse.
