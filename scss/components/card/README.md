# Card

The Design Guide's rounded card: a surface that groups related content. Docs: `site/pages/blocks.html`. Tokens: `$tokens` in `_card.scss`.

## Markup

```html
<article class="ap-c-card ap-o-stack ap-o-stack--gap-sm" aria-labelledby="heron">
  <h3 class="ap-c-card__title" id="heron">Night Heron</h3>
  <p>Light freighter, crew of four.</p>
  <div class="ap-o-cluster"><button class="ap-c-button" type="button">Board</button></div>
</article>

<a class="ap-c-card ap-o-stack ap-o-stack--gap-xs" href="/fleet/heron">
  <strong>Night Heron</strong>
  <span>Light freighter</span>
</a>
```

## Rules

- A card has no layout: add an object (`ap-o-stack`, `ap-o-cluster`, `ap-o-grid`) to the card or inside it.
- A card that is a link (`<a href>`) or a button shows the accent border on hover and the focus ring. Keep only one link or button per clickable card; a card with several actions is an `<article>` with buttons inside.
- The guide's dark card for light content is a card with `data-ap-theme="dark"`: themes nest.
