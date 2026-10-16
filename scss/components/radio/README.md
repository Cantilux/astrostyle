# Radio

A native radio restyled. Docs: `site/pages/forms.html`. Tokens: `$tokens` in `_radio.scss`.

## Markup

```html
<fieldset>
  <legend>Thrust</legend>
  <label class="ap-o-cluster"><input class="ap-c-radio" type="radio" name="thrust" checked> Cruise</label>
  <label class="ap-o-cluster"><input class="ap-c-radio" type="radio" name="thrust"> Overdrive</label>
</fieldset>
```

## States

- `:checked` (accent ring and dot), `aria-invalid="true"`, `:disabled`.
- Arrow keys move within the group, as the browser provides.
