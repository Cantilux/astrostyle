# Button group

Buttons joined into one segmented control. Docs: `site/pages/buttons.html`. Tokens: `$tokens` in `_button-group.scss`.

## Markup

```html
<div class="ap-c-button-group" role="group" aria-label="View">
  <button class="ap-c-button" type="button" aria-pressed="true">Map</button>
  <button class="ap-c-button" type="button" aria-pressed="false">Crew</button>
</div>
```

## Rules

- Only the outer corners are rounded (`--ap-button-group-radius`); borders overlap by one hairline.
- Hovered, focused and pressed buttons are raised above their neighbors.
- Give the group a `role="group"` and an accessible name; use `aria-pressed` for single or multiple selection.
- Emitted after the button: selecting `button-group` in `$components` without `button` leaves it unstyled.
