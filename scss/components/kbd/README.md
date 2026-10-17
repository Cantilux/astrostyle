# Keyboard key

A key cap for shortcuts and key names, with a thicker bottom edge. Docs: `site/pages/containers.html`. Tokens: `$tokens` in `_kbd.scss`.

## Markup

```html
<p>Press <kbd class="ap-c-kbd">Ctrl</kbd> + <kbd class="ap-c-kbd">K</kbd> to search.</p>
```

## Rules

- One `<kbd>` per key; join a combination with text (`+`), not inside the cap.
- Bare `<kbd>` elements keep the smaller element style; the class makes the full key cap.
