# Tag

A small pill label for a status, a category or a count (badge). Docs: `site/pages/feedback.html`. Tokens: `$tokens` in `_tag.scss`.

## Markup

```html
<span class="ap-c-tag ap-c-tag--success">Ready</span>
<span class="ap-c-tag ap-c-tag--danger ap-c-tag--solid" aria-label="3 unread messages">3</span>
<span class="ap-c-tag"><svg class="ap-c-tag__icon" aria-hidden="true">…</svg> Hacks</span>
```

## Modifiers

- Tones: `--accent`, `--success`, `--warning`, `--danger`, `--info` (set `--ap-tag-tone` and `--ap-tag-ink`). Without one, the tag is neutral.
- `--solid`: filled with the tone, text in its ink color. Combine it with a tone.
- Any color: set `--ap-tag-tone` (and `--ap-tag-ink` for `--solid`), e.g. `style="--ap-tag-tone: var(--ap-palette-indigo)"`.

## Rules

- A tag is not interactive. For a removable or clickable tag, put an `ap-c-button` next to it.
- The tone never carries meaning alone: the text says it ("Wounded", not a red dot). A count needs an accessible name that says what is counted.
