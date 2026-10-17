# Section heading

The Design Guide's section title: pink display text, a hairline rule and a two-digit index on the end side. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_section-heading.scss`.

## Markup

```html
<h2 class="ap-c-section-heading" id="graphics">Graphics <span class="ap-c-section-heading__index">01</span></h2>
```

## Rules

- Use it on a real heading (`<h2>`, `<h3>`) at the start of a section, and point the section's `aria-labelledby` at it.
- The index is optional and is read as part of the heading ("Graphics 01"). Hide it with `aria-hidden="true"` when the number means nothing to a listener.
- The rule fills the space between title and index and is drawn with generated content, so it is never announced. Long titles wrap; the rule keeps at least `--ap-space-xl`.
