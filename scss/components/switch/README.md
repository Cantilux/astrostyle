# Switch

A native checkbox with `role="switch"`, drawn as a track and a thumb. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_switch.scss`.

## Markup

```html
<label class="ap-o-cluster"><input class="ap-c-switch" type="checkbox" role="switch"> Autopilot</label>
```

## States

- `:checked` (accent track, thumb moves to the end), `:disabled` (half opacity).
- `Space` toggles; screen readers announce on/off thanks to `role="switch"`.
