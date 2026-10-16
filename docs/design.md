# astrostyle: design

Design specification for `astrostyle`, a public MIT-licensed CSS/SCSS framework with optional vanilla JavaScript, providing generic interface elements (buttons, inputs, pagination, …) in the ASTROPRISMA visual style. Repository: <https://github.com/Cantilux/astrostyle>; npm package: `astrostyle`. Delivery is tracked by the roadmap issues #2–#9 (§10).

## 1. Decisions

| Topic | Decision |
| --- | --- |
| Name / npm | `astrostyle`, unscoped |
| CSS prefix | `ap` (configurable) |
| License | MIT |
| Core | SCSS (Dart Sass module system), precompiled CSS also shipped |
| Behavior | Vanilla ES modules only, no framework layer; framework adapters live in consuming apps |
| Scope | Generic elements only; no game features |
| Sources of truth | ASTROPRISMA Design Guide first, then the design rules of the author's ASTROPRISMA companion app (§2) |
| Customization | First-class requirement: every visual property is overridable at runtime and at build time (§8) |
| Methodology | ITCSS (Inverted Triangle CSS), mapped 1:1 onto native cascade layers (§6, §7.5) |
| Principles | Design-token system (§7.2); universal box model and reset (§6, Generic layer); mobile first (§7.6); low specificity (§7.5) |
| Paradigm | Component-based (§7.7) |

## 2. Sources and priority

1. **ASTROPRISMA Design Guide** — `06_Design Guide [PDF].pdf` from the official Creator Kit. Authoritative for palette, fonts, textures, shapes and graphic motifs. Exact colors and shapes below are read from the PDF's vector artwork (sRGB IEC 61966-2.1 ICC profile), not sampled from the rendered page, whose halftone filter lightens every swatch.
2. **Companion-app design rules** — the design system of the author's ASTROPRISMA companion app (a tactical-console interface). Starting point for everything the guide does not cover: type roles and sizes, spacing scale, component sizing (40px controls), states, interaction grammar.

Where (1) and (2) disagree, (1) wins.

## 3. Brand foundations (from the Design Guide)

### 3.1 Palette

| Guide name | Token (`palette-*`) | Guide hex | Guide rule |
| --- | --- | --- | --- |
| ASTROPRISMA Black | `black` | `#130d1c` | Dark indigo, not rich or basic black; text and page backgrounds |
| ASTROPRISMA White | `white` | `#f0eee8` | Bone white, not basic white; text and page backgrounds |
| ASTROPRISMA Off-White | `off-white` | `#e9dcd3` | Background details |
| ASTROPRISMA Pink | `pink` | `#ef476e` | Accent for titles and highlights; replaceable by another accent |
| Dark Pink | `pink-dark` | `#d50059` | Variety, e.g. medal designs |
| Shadow Pink | `pink-shadow` | `#ab0048` | Darkest pink |
| Gradient Yellow | `yellow` | `#ffbd5c` | Gradient band 1; Equipment & Loot |
| Gradient Orange | `orange` | `#ff603e` | Gradient band 2 |
| Gradient Magenta | `magenta` | `#d50059` | Gradient band 3 (same value as Dark Pink) |
| Gradient Indigo | `indigo` | `#54009d` | Gradient band 4; Factions |
| WARG Red | `red` | `#ca2632` | Weapons |
| Intersolar Blue | `teal` | `#5fc3b0` | Cybertech |
| Medusa Green | `green` | `#6abd45` | Hacks |
| Wire Teal | `sea` | `#4bba7a` | Drones & Mechs (Medusa's second shade) |
| Corsair Yellow | `amber` | `#faa21e` | — |
| Synth Magenta | `rose` | `#d51b5b` | — |

- The guide contrasts the brand pair with "rich black" `#000000`/`#231f20` and "basic white" `#ffffff`, which are not used.
- Palette tokens use neutral hue names, so the framework stays generic. Game meanings (faction, weapons, hacks) are mapped by the consuming app, e.g. `--astro-faction-warg: var(--ap-palette-red)`.
- Intersolar vs Wire assignment: by draw order in the PDF and by the two-tone Medusa swatch (green + `#4bba7a`).

### 3.2 Gradient

- Four hard-edged equal bands, fixed order Yellow → Orange → Magenta → Indigo. Exposed as `--ap-gradient` and the `ap.spectrum()` mixin; never a smooth blend.

### 3.3 Typography

| Role | Guide font | License note | In astrostyle |
| --- | --- | --- | --- |
| Body | Feature Mono: Light regular, Medium bold, Hairline details | Free (attribution) | `--ap-font-body` |
| Titles, logo | Newake (paid) → Powerr (free alternative) | Paid / free | `--ap-font-display` |
| Accent display | Rimma Sans, Free Fat Font, Genesys, ST-Cyberillic, SCHABO | Free, mixed terms | `--ap-font-accent-*` (opt-in) |
| Italic | Instrument Serif | SIL OFL 1.1 | `--ap-font-serif` |

Type roles and sizes come from the companion-app design rules (display 30, screen-title 24, panel-title 18, body 15, data 14, label 12, caption 12 px; weights and tracking as listed there). A seventh role, `action` (body family, 14px, medium, 0.08em, uppercase), is used by buttons: the label role's hairline weight is too thin for actions. Each role also has a `case` (`uppercase` for display, screen-title, panel-title and label, as the guide's titles and the companion app's labels). The element-to-role map (`$element-roles`: h1 display, h2 screen-title, h3 panel-title, h4 data, h5–h6 label, small caption, …) is configurable. Sizes are written in px in the settings and emitted in rem, so they follow the user's browser font size; `ap.text()` multiplies them by `--ap-font-scale` at the use site, so changing the scale on any element takes effect there.

### 3.4 Texture

- Halftone at 50% layer opacity and a fine noise grain on every page (guide, "Filter"). Shipped as the opt-in `ap-c-surface` component (`.ap-c-surface--halftone`, `.ap-c-surface--noise`) built with CSS gradients/SVG, never applied over text-dense controls by default.

### 3.5 Graphic motifs visible in the guide

Generic patterns the framework turns into components. Shapes are measured in §3.7.

| Motif in the guide | Component |
| --- | --- |
| Small tracked eyebrow ("STYLE GUIDE 1") over a huge black display word | `ap-c-masthead` |
| Pink display heading, hairline rule, right-aligned two-digit index ("GRAPHICS —— 01") | `ap-c-section-heading` |
| Window panel: dark title bar, light tracked title, index badge top right, hairline frame | `ap-c-window` |
| Pill button, pink fill, uppercase text ("WANTED STORE PAGE") | `ap-c-button` (pill shape) |
| Outlined pill legend split into labelled segments ("RICH BLACK · ASTROPRISMA BLACK · BASIC BLACK") | `ap-c-segment-bar` |
| Vertical pink side tab label on a framed box ("FREE RESOURCES") | `ap-c-tabbed-box` |
| Off-white filled callout block | `ap-c-callout` |
| `/ TITLE /` slash-delimited subheading | `ap-c-subheading` |
| Rounded swatch tiles and grouped rounded cards (dark card for white swatches) | `ap-c-card`, `ap-c-swatch` |

### 3.6 Light and dark

The guide uses both pairings ("Astro Black on White", "Astro White on Black"); the companion app uses only dark. astrostyle ships both as complete themes from the same semantic tokens (§7.3). Default: `light`, the guide's own presentation. Theme selection is explicit (`data-ap-theme`), never from OS preferences.

### 3.7 Shapes

Measured on the guide's vector artwork (A4 landscape, 841.92 × 595.44 pt), corner radius along each corner's diagonal:

| Shape in the guide | Height | Corner radius | Ratio |
| --- | --- | --- | --- |
| Window title bar ("EXPORT AS IMAGE") | ≈ 13 pt | ≈ 3 pt | small, fixed |
| Dark swatch card | 62.9 pt | ≈ 11.5 pt | ≈ 18% of height |
| Buttons ("WANTED STORE PAGE", "GIMP DOWNLOAD LINK") | ≈ 10 pt | full | pill |

Print sizes do not map 1:1 to screens. Scaling by body text (≈ 8 pt in the guide, 15px on screen, factor ≈ 1.9) gives the shape tokens:

| Token | Value | Used by |
| --- | --- | --- |
| `radius-control` | 6px | inputs, windows, tiles, square buttons |
| `radius-card` | 22px | cards and grouped panels |
| `radius-pill` | 999px | buttons, tags, segment bars |

## 4. Carried over from the companion-app design rules

- Type roles and sizes (§3.3), spacing scale `2 4 8 12 16 24 32` px.
- Control sizing: minimum 40px height for buttons and inputs; one primary (filled) action per group.
- Interaction grammar: crisp text and controls; atmosphere (halftone, noise, CRT scanlines) only on decorative surfaces.
- Pixel-cut corners and CRT scanlines as opt-in variants (`.ap-c-button--cut`, `.ap-c-surface--crt`), since they are the app's signature, not the guide's.
- State colors paired with a label or shape, never color alone.
- No reaction to OS preferences (`prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`, …). Motion is controlled by duration tokens a consumer can set to `0s`.

Not carried over: the app's dark-only palette values, the "reject rounded containers / pill navigation" rule (the guide uses pills and rounded cards; consumers that want sharp corners set the radius tokens to `0`/`2px`), domain components, map/console layouts.

## 5. Scope

- **In:** the seven ITCSS layers: tokens and themes, tools, universal reset, element defaults, objects, the components in §10 (including texture surfaces), utilities.
- **Out:** combat tracker, hex map, ship builder/log, oracle, rulebook, sheets, OBS views, any game vocabulary in names.

## 6. ITCSS architecture and repository layout

The SCSS tree follows the seven ITCSS layers, ordered from generic, far-reaching and low-specificity to explicit, narrow and higher-specificity. Each emitting layer is also a native cascade layer with the same order (§7.5), so the inverted triangle is enforced by the browser, not only by file order.

| # | ITCSS layer | Folder | Emits CSS | Contents | Selectors allowed | Namespace |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Settings | `scss/settings/` | No | Config (`$prefix`, `$scope`, `$layer`, `$theme-default`, `$components`, `$breakpoints`) and design-token maps | — | — |
| 2 | Tools | `scss/tools/` | No | Functions and mixins (§7.4) | — | — |
| 3 | Generic | `scss/generic/` | Yes | Token emission as custom properties, universal box model, universal reset | `*`, `::before`, `::after`, `:where()`-wrapped root | — |
| 4 | Elements | `scss/elements/` | Yes, opt-in (`$emit-elements`) | Bare HTML element defaults: headings, paragraphs, links, lists, tables, form elements, media | Type selectors inside `:where()` (0,0,0) | — |
| 5 | Objects | `scss/objects/` | Yes | Cosmetic-free layout patterns: container, stack, cluster, grid, sidebar, switcher, frame | One class | `ap-o-` |
| 6 | Components | `scss/components/<name>/` | Yes | Designed UI pieces (§10) | One class (+ `:where()` internals) | `ap-c-` |
| 7 | Utilities | `scss/utilities/` | Yes | Single-purpose helpers that must win: visually-hidden, text roles, truncate, display, spacing overrides; responsive variants with `@bp` suffix | One class | `ap-u-` |

```text
astrostyle/
├── scss/
│   ├── _index.scss            # public API: forwards settings and tools; `emit()` mixin
│   ├── settings/              # _config, _palette, _themes, _typography, _space, _shape, _motion, _breakpoints
│   ├── tools/                 # _functions, _mixins, _media, _variants
│   ├── generic/               # _tokens (custom properties), _box-sizing, _reset
│   ├── elements/              # _page, _headings, _text, _links, _lists, _tables, _forms, _media
│   ├── objects/               # _container, _stack, _cluster, _grid, _sidebar, _switcher, _frame
│   ├── components/
│   │   └── button/            # _button.scss (styles), _tokens.scss (component tokens), README.md (contract)
│   └── utilities/             # _visually-hidden, _text, _truncate, _display, _spacing
├── js/                        # vanilla ES modules, one folder per interactive component
├── dist/                      # build output (gitignored in the repo, shipped on npm)
├── docs/                      # this design + static HTML pages per component
├── tests/
├── LICENSE  README.md  CHANGELOG.md  package.json
```

Rules:

- `@use`/`@forward` only (no `@import`); no cross-module `@extend`; Settings and Tools emit no CSS, so any consumer file can `@use` them for free.
- A layer may use Settings and Tools, never a later layer. Components never restyle objects or other components.
- **Generic layer (box model and universal reset):**

```scss
:where(#{$scope}), :where(#{$scope}) *, :where(#{$scope}) ::before, :where(#{$scope}) ::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
:where(#{$scope}) :is(img, picture, video, canvas, svg) { display: block; max-inline-size: 100%; }
:where(#{$scope}) :is(input, button, textarea, select) { font: inherit; color: inherit; }
:where(#{$scope}) :is(p, h1, h2, h3, h4, h5, h6) { overflow-wrap: break-word; }
```

  With the default `$scope: ':root'` this is a global reset; with `$scope: '.astroprisma'` it touches only that subtree. Everything is zero-specificity, so any consumer rule wins.

## 7. Sass architecture

### 7.1 Entry points

```scss
// Full framework with defaults
@use 'astrostyle' as ap;
@include ap.emit();

// Configured and partial
@use 'astrostyle' as ap with (
  $scope: '.astroprisma',                // all selectors and tokens under this root; default ':root'
  $theme-default: 'dark',
  $accent: #3fa7ff,
);
@include ap.emit($components: (button, field, input, select, pagination));
```

Precompiled alternative for non-Sass projects: `astrostyle/css` (full) or `astrostyle/css/button.css` (per component, requires `astrostyle/css/core.css`).

### 7.2 Token tiers

1. **Palette** — §3.1 values; components never read them directly.
2. **Semantic** — per theme: `bg`, `surface-1..3`, `inset`, `text`, `text-muted`, `text-subtle`, `text-disabled`, `border-subtle`, `border`, `border-strong`, `accent`, `accent-strong`, `accent-deep`, `on-accent`, `success`, `warning`, `danger`, `info`, `focus`, `link`, `link-hover`, `on-danger`, `danger-text`. `danger-text` is the danger hue mixed with the text color so error messages reach 4.5:1 on `bg` and `surface-1` in both themes. Links get their own pair because the guide pink reaches only 3.12:1 on the light background; `link` is Dark Pink there (4.55:1).
3. **Component** — every visual property of a component reads `--ap-{component}-{property}` with a semantic fallback (§8.1).

Token system rules:

- Token categories: color, typography (family, size, weight, line height, tracking), space, size (control heights, icon sizes), shape (radius, border width), elevation, motion (duration, easing), z-index, breakpoints (Sass-only, media queries cannot read custom properties).
- The Sass maps in Settings are the single source. They emit custom properties (Generic layer), the precompiled CSS, and `dist/tokens.json` in the W3C Design Tokens Community Group format for design tools and documentation.
- No raw values outside Settings: components, objects and utilities reference tokens only (enforced by Stylelint, §12).

### 7.3 Themes

```scss
$themes: (
  light: (bg: palette('white'), surface-1: palette('off-white'), text: palette('black'), …),
  dark:  (bg: palette('black'), surface-1: mix-step('black', 'white', 6%), text: palette('white'), …),
) !default;
```

- Emitted as `[data-ap-theme='light']` / `[data-ap-theme='dark']` blocks plus the default theme on `$scope`. Themes nest: a dark `ap-window` inside a light page sets `data-ap-theme="dark"` on itself.
- Derived steps (hover, pressed, subtle fills, surface steps) use `color-mix(in oklab, …)` on custom properties, so overriding a base token on the same element as the theme block (e.g. `:root`) recolors its derived states.
- Theme values are raw colors or references: `(palette: 'pink')`, `(token: text)`, `(mix: (text, bg, 62%))`, `(alpha: (text, 12%))`. References become `var()`/`color-mix()` in CSS and static sRGB colors (or `{palette.*}` aliases) in `tokens.json`.
- A theme may not redefine a theme-independent token; compilation fails on such a collision.

### 7.4 Functions and mixins (public)

| Name | Purpose |
| --- | --- |
| `ap.token($name)` | `var(--ap-$name)`; compile error on unknown names |
| `ap.palette($name)` | Raw palette value (Sass-time) |
| `ap.space($step)` | Spacing token |
| `ap.mq($from)` | Mobile-first viewport query: `@media (min-width: …)` from `$breakpoints`; no max-width variant exists |
| `ap.cq($from, $name)` | Mobile-first container query for components |
| `ap.text($role)` | Mixin: full type role (family, size×scale, weight, line height, tracking) |
| `ap.focus-ring()` | The single focus style |
| `ap.interactive()` | Hover/active/disabled/transition pattern |
| `ap.control-base()` | Shared base of inputs, selects, textareas |
| `ap.button-base()` | Shared base of every button variant |
| `ap.cut-corners($size)` | Pixel-cut `clip-path` |
| `ap.spectrum($direction)` | Four-band gradient |
| `ap.surface($kind)` | halftone / noise / crt |
| `ap.variant($component, $name, $tokens)` | Emit a variant class that only overrides component tokens |
| `ap.theme($name, $tokens)` | Emit an extra theme |
| `ap.emit(...)` | Output selected layers/components |

### 7.5 Cascade, specificity and naming

- Output lives in `@layer astrostyle.generic, astrostyle.elements, astrostyle.objects, astrostyle.components, astrostyle.utilities` (root name configurable via `$layer`), declared once up front so the order holds whatever the import order.
- Specificity budget (enforced by Stylelint):

| Layer | Max specificity | How |
| --- | --- | --- |
| Generic, Elements | (0,0,0); (0,0,1) for selectors ending in a pseudo-element | Everything inside `:where()`; pseudo-elements cannot go inside it |
| Objects, Components, Utilities | (0,1,0) | One class; element parts, states and modifiers combine as `.ap-c-x:where(…)` or are their own class |
| Anywhere | no IDs, no `!important`, no qualified selectors (`button.ap-c-button`), no descendant chains between components | |

- `$scope` never adds specificity: scoped output is `:where(.astroprisma) .ap-c-button`, still (0,1,0).
- Utilities win because their layer is last, not because of `!important`. Unlayered consumer CSS beats every layer.
- States come from native and ARIA attributes first: `:disabled`, `[aria-invalid='true']`, `[aria-pressed='true']`, `[aria-current]`, `[aria-expanded='true']`, `[aria-selected='true']`, written inside `:where()`; `is-*`/`has-*` classes only where no attribute exists.
- Naming: ITCSS namespaces + BEM. `.ap-o-stack`, `.ap-c-button`, `.ap-c-button__icon`, `.ap-c-button--primary`, `.ap-u-truncate`, `.ap-u-hidden@md` (responsive utility, `@` escaped in CSS); states `.is-open`; JS hooks `data-ap-{component}` (never styled); themes `data-ap-theme`; private custom properties `--_name`.

### 7.6 Mobile first

- Base styles target the narrowest viewport; enhancements are added only with `min-width` queries (`ap.mq(md)`). `max-width` media queries are forbidden by lint.
- Breakpoints (Sass map, overridable): `sm 36em`, `md 48em`, `lg 64em`, `xl 80em`, in `em` so they follow user font size.
- Components adapt to their container, not the viewport: each component that changes layout declares `container-type: inline-size` on its root or expects a container from an object, and uses `ap.cq()`; the same component then works in a sidebar or a full page.
- Objects are intrinsically responsive first (`flex-wrap`, `grid-template-columns: repeat(auto-fit, minmax(…))`), using queries only where intrinsic layout is not enough.
- Objects are tuned with their own custom properties (`--ap-stack-gap`, `--ap-grid-min`, `--ap-sidebar-width`, …). Properties an object reads on itself are registered with `@property` as non-inheriting, so a nested object never picks up its parent's setting; properties read by its children (sidebar width and content minimum, switcher threshold) stay inheriting, otherwise the children could not see them. Modifiers are generated from the settings maps: `--gap-<space step>`, cluster `--start/--center/--end/--between`, container `--sm…--xl`, frame `--<ratio>` from `$ratios`, sidebar `--end`.
- Body text is set on `<body>` when the scope is `:root`, never on the root element, so `rem` keeps the browser's base size.
- Logical properties (`inline-size`, `margin-block`, `padding-inline`) everywhere.
- Touch targets: interactive controls ≥ 40px (companion-app value) in every viewport; no hover-only affordances.
- Fluid display type with `clamp()` for masthead and display roles only; body and controls keep fixed token sizes × `--ap-font-scale`.

### 7.7 Component model

- A component is a self-contained folder: styles, component tokens, documented markup contract, optional JS module, docs page, tests. Deleting the folder removes the component completely.
- A component styles only its own block and elements; it never reaches into another component (`.ap-c-card .ap-c-button` is forbidden). Contextual variation is done by the parent setting the child's component tokens, or by a modifier on the child.
- Component roots have no outer margin and no fixed outer width; spacing and placement come from objects (`ap-o-stack`, `ap-o-cluster`) or the consumer.
- Composition over variants: a "card with actions" is `ap-c-card` + `ap-o-cluster` + `ap-c-button`, not a new component.
- Public contract per component (SemVer): class names, element names, modifiers, required attributes/roles, component tokens, JS options and events.
- Implementation (`scss/components/<name>/_<name>.scss`, helpers in `scss/tools/_component.scss`):
  - `$tokens` maps each public token to its default. The root declares `--_<token>: var(--ap-<component>-<token>, <default>)` for each one and every property reads `var(--_<token>)`, so a token set on the element, on a parent or in a modifier wins over the default.
  - Modifiers only set public tokens (`.ap-c-button--primary { --ap-button-bg: … }`); a shape modifier may add the one property tokens cannot express (`--cut` adds its `clip-path`).
  - Inside a rule: declarations first, then state mixins (`interactive`, `focus-ring`), then state rules, so states always come after the base declarations in the output.
  - States: native pseudo-classes and ARIA attributes inside `:where()` (`:hover`, `:focus-visible`, `:disabled`, `[aria-pressed]`, `[aria-invalid]`, `:checked`, `:indeterminate`).
  - Controls are native elements with a class (`input.ap-c-checkbox`, `input.ap-c-switch[role=switch]`, `input.ap-c-range`), so keyboard, forms and assistive technology behave as the browser intends.
- `scss/components/_index.scss` fixes the emission order (`button` before `button-group`, which adjusts it) and applies `$components` (`all` or a list; unknown names fail compilation).
- Each component folder has a `README.md` with markup, modifiers, states and accessibility rules; the docs pages render the token tables from `$tokens` through `scripts/component-tokens.scss`.
- Shipped: button, button group, field, input (and textarea), select (native), combobox (with `js/combobox`), checkbox, radio, switch, range, segmented meter.

## 8. Customization

Customization is a contract: token names and mixin signatures are public API under SemVer.

### 8.1 Runtime, no build step

```css
/* Global retheme */
:root { --ap-accent: #3fa7ff; --ap-radius-control: 2px; --ap-font-scale: 1.1; }

/* One region */
.sidebar { --ap-surface-1: #1b1424; }

/* One component type */
.checkout .ap-c-button { --ap-button-height: 48px; }

/* One instance */
<button class="ap-c-button" style="--ap-button-bg: var(--ap-palette-indigo)">
```

Component token pattern:

```scss
.#{$p}-c-button {
  --_bg: var(--#{$p}-button-bg, #{ap.token('surface-2')});
  --_fg: var(--#{$p}-button-fg, #{ap.token('text')});
  --_radius: var(--#{$p}-button-radius, #{ap.token('radius-pill')});
  …
}
```

Each component's docs page lists its tokens, defaults and states.

### 8.2 Build time with Sass

- Every setting is `!default` and configurable through `@use 'astrostyle' with (…)`.
- Map settings are deep-merged with defaults (`map.deep-merge`), so only changed keys are passed:

```scss
@use 'astrostyle' as ap with (
  $themes: (dark: (bg: #0c0812)),
  $button-variants: (warning: (bg: ap-palette('amber'), fg: ap-palette('black'))),
  $shape: (radius-control: 2px, radius-card: 4px),
);
```

- `$components` selects which components are emitted; unused ones produce no CSS.

### 8.3 Extending

```scss
@include ap.variant(button, 'faction-warg', (bg: var(--astro-faction-warg), fg: ap.token('white')));
@include ap.theme('codex', (bg: ap.palette('off-white'), accent: ap.palette('indigo')));

.my-widget {
  @include ap.control-base;
  @include ap.text('label');
  @include ap.cut-corners(5px);
}
```

### 8.4 Overriding

- Any unlayered consumer CSS beats astrostyle (cascade layers), without `!important` or extra specificity.
- The accent is a single setting as the guide requires ("choose a different color as your accent"). With the default pink, `accent-strong` and `accent-deep` are the guide's Dark and Shadow Pink. With `$accent` configured, they are derived from it with `color-mix()`, `on-accent` becomes the palette black or white with the higher WCAG contrast, and `focus` follows the accent.
- At runtime, `@include ap.accent($color)` declares the same set (accent, shades, ink, focus) in any rule, so one region can be recolored. Setting only `--ap-accent` recolors the accent but keeps the default pink shades.

### 8.5 JavaScript

- Every module takes an options object (labels, filtering function, page window size, …) and emits DOM events, so behavior is adjustable without forking.
- JS never sets visual styles inline except positioning; appearance stays in CSS tokens.
- Modules enhance consumer markup through `data-ap-*` hooks, so custom markup works as long as the documented roles/attributes are present.

## 9. Vanilla JavaScript

Only where native HTML is insufficient. Native first: `<dialog>` + `showModal()`, Popover API, `<details>`, form validation.

| Module | Responsibility |
| --- | --- |
| `combobox` (shipped) | Searchable select from a native `<select>`: filter, keyboard navigation, optional free text (`creatable`) |
| `dialog` | Focus return, backdrop close, stacking over native `<dialog>` |
| `tabs` | Roving tabindex, arrow keys, ARIA selection |
| `pagination` | Pure page-window computation + optional renderer |
| `toast` | Queue, timeout, live region |
| `popover` | Placement fallback where CSS anchor positioning is unavailable (tooltip, menu) |

Contract (implemented by `js/combobox/`, the first module):

```js
// Enhances `select` in place and returns a handle; call destroy() to undo it.
export function createCombobox(select, options = {}, env = {}) {
  return { element, getValue, setValue, open, close, destroy }
}
```

- `env.document` and `env.createId` are injectable; events are created with the constructors of the document's own window, so the module runs unchanged in a test DOM.
- Progressive enhancement: the module starts from native markup (a `<select>`), keeps it in the form, hidden and in sync, and `destroy()` restores it.
- User-facing texts are options (`labels`), with English defaults.
- Pure logic lives in separate files (`js/combobox/filter.js`, `js/combobox/navigation.js`) with unit tests; DOM behavior is tested with happy-dom (pinned to a release older than two weeks).
- `js/index.js` re-exports every module; `js/auto-init/index.js` provides `autoInit(root)`, which enhances `select[data-ap-combobox]` once (`data-ap-enhanced`), with free text when `data-ap-creatable` is present.
- The docs site loads `js/` as native modules, so it must be served over HTTP (`bun run dev`, GitHub Pages).

- ES modules, no dependencies, no consumer build step; import per component (`astrostyle/js/combobox`) or everything from `astrostyle/js`.
- Events: `ap:change`, `ap:open`, `ap:close`, `ap:page`.
- Pure logic in separate files (`js/pagination/range.js`, `js/select/filter.js`), unit-tested.
- Environment (document, timers) injected.
- Optional `autoInit(root)` enhances every `[data-ap-*]` under `root`.

## 10. Roadmap

Each step is a GitHub issue with its checklist and definition of done.

| Step | Issue | Version | Content |
| --- | --- | --- | --- |
| 1 | #2 | 0.0.x | Design closure and repository infrastructure (license, tooling, lint, tests, build, CI, changesets) |
| 2 | #3 | 0.1.0 | Settings, Tools, Generic; `tokens.json`; first npm release |
| 3 | #4 | 0.2.0 | Elements, Objects, Utilities; docs pages |
| 4 | #5 | 0.3.0–0.4.0 | Actions and forms: button, button group, field, input, textarea, checkbox, radio, switch, range, meter; searchable select (first JS module) |
| 5 | #6 | — | Pilot adoption in a real project to prove customization |
| 6 | #7 | 0.5.0–0.6.0 | Navigation and feedback: pagination, tabs, breadcrumb, tag, callout, toast, progress, spinner, empty state |
| 7 | #8 | 0.7.0–0.9.0 | Guide blocks and containers: masthead, section heading, subheading, window, card, tabbed box, segment bar, swatch, dialog, drawer, accordion, table, list, divider, tooltip, menu, kbd, skeleton, surfaces |
| 8 | #9 | 1.0.0 | API freeze, accessibility audit, browser matrix, customization guide |

Definition of done per component: SCSS partial; documented component tokens; HTML markup contract; docs page showing every state in both themes; compile tests (default + customized); specificity check of the compiled output; layout verified from 320px upward; JS module and tests if interactive; keyboard and screen-reader check.

## 11. Fonts, brand and licensing

- The package ships **no font files**. It declares font-family tokens with fallbacks (`'Feature Mono', ui-monospace, monospace`) and documents where to obtain each font. Several guide fonts are only "free for personal and commercial use", which does not grant redistribution in a public package; Newake is paid.
- An optional `astrostyle/fonts.css` with `@font-face` rules pointing to consumer-provided URLs can be added later.
- astrostyle is published under the [ASTROPRISMA Third Party License](https://www.astroprisma.com/license), which allows free or commercial third-party products without explicit permission when its rules are followed:
  - Independence statement, wherever the product is promoted (README, npm page, docs site): "astrostyle is an independent production by Enrico Cantile and is not affiliated with Crescent Chimera. It is published under the ASTROPRISMA Third Party License."
  - Copyright line, legibly included in the product: "ASTROPRISMA is copyright Camila Mera and Crescent Chimera."
  - No Crescent Chimera logo, no ASTROPRISMA logo, no other Crescent Chimera logos; nothing may suggest the product is official or sponsored. The "Compatible with ASTROPRISMA" logos are allowed but optional; the README shows them (`.github/assets/compatible-with-astroprisma-{black,white}.png`, from the Creator Kit, switched by GitHub color scheme).
  - Art and text from the books are not reused; game-world names (factions, equipment) may be used.
- Every compiled stylesheet starts with a preserved comment (`/*! … */`) carrying the package name, version, MIT license, the independence statement and the copyright line, so the notice survives minification.

## 12. Package, tooling, release

```json
{
  "name": "astrostyle",
  "license": "MIT",
  "type": "module",
  "sass": "scss/_index.scss",
  "style": "dist/astrostyle.css",
  "exports": {
    ".": { "sass": "./scss/_index.scss", "style": "./dist/astrostyle.css", "default": "./dist/astrostyle.css" },
    "./css": "./dist/astrostyle.css",
    "./css/min": "./dist/astrostyle.min.css",
    "./css/core": "./dist/core.css",
    "./css/core.min": "./dist/core.min.css",
    "./css/*": "./dist/components/*.css",
    "./js": "./js/index.js",
    "./js/*": "./js/*/index.js",
    "./tokens.json": "./dist/tokens.json",
    "./scss/*": "./scss/*",
    "./package.json": "./package.json"
  },
  "sideEffects": ["*.css"],
  "files": ["scss", "js", "dist", "LICENSE", "README.md", "CHANGELOG.md"],
  "publishConfig": { "access": "public" }
}
```

Split CSS: `astrostyle/css/core` (everything but components) and `astrostyle/css/<component>`, each also as `.min` (`dist/core.css`, `dist/components/<component>.css`). They come from `emit($core, $components)`: `core` is `emit($components: ())`, a component file is `emit($core: false, $components: (<name>))`. Every file starts with the cascade layer declaration, so files can load in any order; core plus every component holds exactly the rules of the full bundle (tested). JavaScript: `astrostyle/js` (`js/index.js`) and `astrostyle/js/<module>` (`js/<module>/index.js`).

| Concern | Choice |
| --- | --- |
| Runtime/package manager | Bun |
| Compile | Dart Sass API (`scripts/build.mjs`) → `dist/astrostyle.css`, `dist/astrostyle.min.css`, `dist/core(.min).css`, `dist/components/<component>(.min).css`, each with the license header; `dist/tokens.json` from `scripts/tokens.scss`, which serializes the settings and reports the JSON through `@debug` |
| Sass consumers | `@use 'pkg:astrostyle'` (Dart Sass ≥ 1.71 `NodePackageImporter`) or bare `astrostyle` resolved by Vite |
| Lint | Stylelint + `stylelint-config-standard-scss` + `stylelint-scss`: no raw colors, px font sizes, radii, durations or z-index outside `settings/`; `selector-max-specificity: 0,1,0`; `selector-max-id: 0`; `declaration-no-important`; `selector-no-qualifying-type`; `max-width` disallowed in media features; class namespaces per layer are checked on the compiled CSS by tests. Prettier formats JS, JSON and YAML only: it breaks Sass expressions and pads Markdown tables |
| Tests | `node --test`: compile fixtures (default and customized configs) and assert CSS; specificity budget and layers of the compiled CSS; WCAG contrast of the themes from `tokens.json`; lint rules; package contract; later pure JS logic and DOM behavior with happy-dom or jsdom |
| Package check | `bun run check:package` (CI, after build): `npm pack` file list (including every split stylesheet), `@use 'pkg:astrostyle'` and every `exports` subpath resolved from a scratch consumer project |
| Docs | <https://cantilux.github.io/astrostyle/>: static pages in `site/pages/` wrapped in `site/layout.html` by `scripts/build-docs.mjs` (no bundler); token sections are generated from `tokens.json`, the stylesheet `site/docs.scss` uses only the public API; `.github/workflows/pages.yml` deploys `_site/` from `master`. One page per component from roadmap step 4. The **Demo** page (`site/pages/demo.html`) is a sample screen built only with what astrostyle ships; every new component is added to it. `bun run dev` (`scripts/dev.mjs`) serves the site locally with readable CSS, rebuilds on changes in `scss/`, `site/` and `scripts/`, and reloads the pages through server-sent events or shows the Sass error in them |
| Versioning | SemVer, `0.x` until 1.0.0; Changesets for the changelog; versions are bumped in a release PR with `bun run release:version` |
| Publish | `.github/workflows/release.yml` on every push to `master`: when the package is not `private` and its version is not on npm, it runs lint, tests, build and the package check, publishes with npm trusted publishing (provenance included) and tags `vX.Y.Z`. The very first version is published by hand, because npm accepts a trusted publisher only for an existing package |

## 13. Adoption in consuming projects

- Depend on the published package with an exact version (`"astrostyle": "0.3.1"`); never commit `file:`/`link:` dependencies or bundler aliases into a local checkout.
- To try unpublished changes: `bun link` in the astrostyle checkout, then `bun link astrostyle` in the project; do not commit the result.
- Sass projects need the `pkg:` importer (`NodePackageImporter`) or a bundler that resolves bare package names in `@use`.
- Map project vocabulary onto astrostyle tokens (e.g. `--faction-warg: var(--ap-palette-red)`) instead of adding project names to the framework.

## 14. Decisions log

No open items.

Confirmed by the maintainer:

- `light` is the default theme; both themes are shipped.
- Shape tokens of §3.7.
- Licensing under the ASTROPRISMA Third Party License (§11).

Calls made without explicit instruction:

- Palette token names are neutral hues (`red`, `teal`, …) instead of faction names.
- Default shapes follow the guide (pill buttons, rounded cards); pixel-cut and sharp corners are variants.
- No font files in the package.
- `on-accent` defaults to Astroprisma Black: bone white on `#ef476e` is 3.12:1, below 4.5:1 for button text; black on pink is 5.26:1. For the same reason pink text on the light theme (3.12:1) is limited to display-size headings, as in the guide.
- ITCSS namespaces in class names (`ap-o-`, `ap-c-`, `ap-u-`), so the layer of every class is readable in markup.
- The Elements layer is opt-in (`$emit-elements`, default `true`): a consumer embedding astrostyle in an existing site can switch off bare-element styling.
- Breakpoints `36/48/64/80em`; components respond to container width rather than viewport width.
