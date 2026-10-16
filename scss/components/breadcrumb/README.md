# Breadcrumb

The path from the top of a site to the current page, items joined by the Design Guide's slash. Docs: `site/pages/navigation.html`. Tokens: `$tokens` in `_breadcrumb.scss`.

## Markup

```html
<nav class="ap-c-breadcrumb" aria-label="Breadcrumb">
  <ol class="ap-c-breadcrumb__list">
    <li class="ap-c-breadcrumb__item"><a class="ap-c-breadcrumb__link" href="/fleet">Fleet</a></li>
    <li class="ap-c-breadcrumb__item"><a class="ap-c-breadcrumb__link" href="/fleet/heron">Night Heron</a></li>
    <li class="ap-c-breadcrumb__item"><a class="ap-c-breadcrumb__link" aria-current="page">Console</a></li>
  </ol>
</nav>
```

## Rules

- A `<nav>` with an accessible name around an ordered list; the last item carries `aria-current="page"` (a link without `href`, or plain text in `ap-c-breadcrumb__link`).
- Separators are generated content with empty alternative text, so screen readers skip them. Change them with `--ap-breadcrumb-separator` (a CSS string, e.g. `"›"`).
- Links keep a 40px tall hit area; long paths wrap.
