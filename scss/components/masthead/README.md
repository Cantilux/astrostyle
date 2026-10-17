# Masthead

The Design Guide's page opener: a small tracked eyebrow over a huge display word. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_masthead.scss`.

## Markup

```html
<header class="ap-c-masthead">
  <p class="ap-c-masthead__eyebrow">Style guide 01</p>
  <h1 class="ap-c-masthead__title">Night Heron</h1>
</header>
```

## Rules

- One per page, at the top. The title is the page's `<h1>`; the eyebrow comes first in the source, so read it as a lead-in, not as the title.
- The title grows with the viewport between 1.2× and 2.4× the display size (`--ap-masthead-title-size`), times `--ap-font-scale`.
- Keep the title to one or two words: it is a display word, not a sentence.
