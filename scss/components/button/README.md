# Button

Action control in the Design Guide's pill shape. Docs and live states: `site/pages/buttons.html`. Tokens and defaults: `$tokens` in `_button.scss`.

## Markup

```html
<button class="ap-c-button ap-c-button--primary" type="button">Jump</button>
<a class="ap-c-button" href="/crew">Crew</a>
<button class="ap-c-button" type="button">Engage <svg class="ap-c-button__icon" aria-hidden="true">…</svg></button>
<button class="ap-c-button ap-c-button--icon" type="button" aria-label="Next"><svg class="ap-c-button__icon" aria-hidden="true">…</svg></button>
```

## Modifiers

| Modifier | Effect |
| --- | --- |
| none | Secondary: transparent, strong border |
| `--primary` | Accent fill, `on-accent` ink |
| `--quiet` | No border, subtle hover |
| `--danger` | Danger fill, `on-danger` ink |
| `--lg` | 48px tall |
| `--icon` | Square, no inline padding (icon only) |
| `--square` | `radius-control` corners |
| `--cut` | Pixel-cut corners, no radius |

## States

- `:hover`, `:active` (1px press), `:focus-visible` (focus ring).
- `aria-pressed="true"`: toggle on.
- `:disabled` or `aria-disabled="true"` (links): disabled colors, no hover.

## Accessibility

- Use `<button type="button">` for actions and `<a>` for navigation.
- Icon-only buttons need `aria-label`; decorative icons get `aria-hidden="true"`.
