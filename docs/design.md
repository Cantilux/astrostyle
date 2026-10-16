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

Type roles and sizes come from the companion-app design rules (display 30, screen-title 24, panel-title 18, body 15, data 14, label 12, caption 12 px; weights and tracking as listed there), multiplied by `--ap-font-scale`.

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

The guide uses both pairings ("Astro Black on White", "Astro White on Black"); the companion app uses only dark. astrostyle ships both as complete themes from the same semantic tokens (§7.3). Default: `light`, the guide's own presentation (pending confirmation, §14). Theme selection is explicit (`data-ap-theme`), never from OS preferences.

### 3.7 Shapes

Measured on the guide's vector artwork (A4 landscape, 841.92 × 595.44 pt), corner radius along each corner's diagonal:

| Shape in the guide | Height | Corner radius | Ratio |
| --- | --- | --- | --- |
| Window title bar ("EXPORT AS IMAGE") | ≈ 13 pt | ≈ 3 pt | small, fixed |
| Dark swatch card | 62.9 pt | ≈ 11.5 pt | ≈ 18% of height |
| Buttons ("WANTED STORE PAGE", "GIMP DOWNLOAD LINK") | ≈ 10 pt | full | pill |

Print sizes do not map 1:1 to screens. Scaling by body text (≈ 8 pt in the guide, 15px on screen, factor ≈ 1.9) gives the proposed tokens, pending confirmation (§14):

| Token | Proposed value | Used by |
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
2. **Semantic** — per theme: `bg`, `surface-1..3`, `inset`, `text`, `text-muted`, `text-subtle`, `text-disabled`, `border-subtle`, `border`, `border-strong`, `accent`, `accent-strong`, `accent-deep`, `on-accent`, `success`, `warning`, `danger`, `info`, `focus`.
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
- Derived steps (hover, pressed, subtle fills, surface steps) use `color-mix(in oklab, …)` on custom properties, so changing one token at runtime recolors its derived states.

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
| Generic, Elements | (0,0,0) | Everything inside `:where()` |
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
- Logical properties (`inline-size`, `margin-block`, `padding-inline`) everywhere.
- Touch targets: interactive controls ≥ 40px (companion-app value) in every viewport; no hover-only affordances.
- Fluid display type with `clamp()` for masthead and display roles only; body and controls keep fixed token sizes × `--ap-font-scale`.

### 7.7 Component model

- A component is a self-contained folder: styles, component tokens, documented markup contract, optional JS module, docs page, tests. Deleting the folder removes the component completely.
- A component styles only its own block and elements; it never reaches into another component (`.ap-c-card .ap-c-button` is forbidden). Contextual variation is done by the parent setting the child's component tokens, or by a modifier on the child.
- Component roots have no outer margin and no fixed outer width; spacing and placement come from objects (`ap-o-stack`, `ap-o-cluster`) or the consumer.
- Composition over variants: a "card with actions" is `ap-c-card` + `ap-o-cluster` + `ap-c-button`, not a new component.
- Public contract per component (SemVer): class names, element names, modifiers, required attributes/roles, component tokens, JS options and events.

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
- The accent is a single token as the guide requires ("choose a different color as your accent"): `accent-strong`, `accent-deep` and `on-accent` are derived from it unless set explicitly. With the default pink they resolve to the guide's Dark/Shadow Pink.

### 8.5 JavaScript

- Every module takes an options object (labels, filtering function, page window size, …) and emits DOM events, so behavior is adjustable without forking.
- JS never sets visual styles inline except positioning; appearance stays in CSS tokens.
- Modules enhance consumer markup through `data-ap-*` hooks, so custom markup works as long as the documented roles/attributes are present.

## 9. Vanilla JavaScript

Only where native HTML is insufficient. Native first: `<dialog>` + `showModal()`, Popover API, `<details>`, form validation.

| Module | Responsibility |
| --- | --- |
| `select` | Combobox with search filter, keyboard navigation, optional free text (`creatable`) |
| `dialog` | Focus return, backdrop close, stacking over native `<dialog>` |
| `tabs` | Roving tabindex, arrow keys, ARIA selection |
| `pagination` | Pure page-window computation + optional renderer |
| `toast` | Queue, timeout, live region |
| `popover` | Placement fallback where CSS anchor positioning is unavailable (tooltip, menu) |

Contract:

```js
// Enhances `element` in place and returns a handle; callers must call destroy().
export function createSelect(element, options = {}, env = { document: globalThis.document }) {
  return { getValue, setValue, open, close, destroy }
}
```

- ES modules, no dependencies, no consumer build step; import per component (`astrostyle/js/select`).
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
- README states that astrostyle is an unofficial, fan-made project, not affiliated with or endorsed by the ASTROPRISMA authors.
- The Creator Kit files contain no license text; the guide only states that its graphic elements may be "used freely in your creations". Permission to use the name and the palette in a public package is still to be confirmed with the authors before the first npm release (§14).

## 12. Package, tooling, release

```json
{
  "name": "astrostyle",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": { "sass": "./scss/_index.scss", "style": "./dist/astrostyle.css", "default": "./dist/astrostyle.css" },
    "./scss/*": "./scss/*",
    "./css": "./dist/astrostyle.css",
    "./css/*": "./dist/components/*",
    "./js/*": "./js/*/index.js",
    "./tokens.json": "./dist/tokens.json"
  },
  "sideEffects": ["*.css"],
  "files": ["scss", "js", "dist", "LICENSE", "README.md", "CHANGELOG.md"]
}
```

| Concern | Choice |
| --- | --- |
| Runtime/package manager | Bun |
| Compile | Dart Sass CLI/API → `dist/astrostyle.css`, `dist/components/*.css`, `dist/tokens.json` |
| Sass consumers | `@use 'pkg:astrostyle'` (Dart Sass ≥ 1.71 `NodePackageImporter`) or bare `astrostyle` resolved by Vite |
| Lint | Stylelint + `stylelint-config-standard-scss` + `stylelint-scss`: no raw colors, px font sizes, radii, durations or z-index outside `settings/`; `selector-max-specificity: 0,1,0`; `selector-max-id: 0`; `declaration-no-important`; `selector-no-qualifying-type`; `max-width` disallowed in media features; class pattern `ap-(o\|c\|u)-…` per layer folder |
| Tests | `node --test`: compile fixtures (default and customized configs) and assert CSS; pure JS logic; DOM behavior with happy-dom or jsdom |
| Docs | Static HTML pages per component (built with Vite), published on GitHub Pages; they use only the public API |
| Versioning | SemVer, `0.x` until phase 2; Changesets for the changelog |
| Publish | GitHub Actions on tag, npm trusted publishing with provenance |

## 13. Adoption in consuming projects

- Depend on the published package with an exact version (`"astrostyle": "0.3.1"`); never commit `file:`/`link:` dependencies or bundler aliases into a local checkout.
- To try unpublished changes: `bun link` in the astrostyle checkout, then `bun link astrostyle` in the project; do not commit the result.
- Sass projects need the `pkg:` importer (`NodePackageImporter`) or a bundler that resolves bare package names in `@use`.
- Map project vocabulary onto astrostyle tokens (e.g. `--faction-warg: var(--ap-palette-red)`) instead of adding project names to the framework.

## 14. Open items and calls made without explicit instruction

Open (roadmap step 1, #2):

- Confirm `light` as the default theme.
- Confirm the shape tokens proposed in §3.7.
- Confirm with the ASTROPRISMA authors the use of the name and the palette.

Calls made:

- Palette token names are neutral hues (`red`, `teal`, …) instead of faction names.
- Default theme `light`; both themes shipped.
- Default shapes follow the guide (pill buttons, rounded cards); pixel-cut and sharp corners are variants.
- No font files in the package.
- `on-accent` defaults to Astroprisma Black: bone white on `#ef476e` is 3.12:1, below 4.5:1 for button text; black on pink is 5.26:1. For the same reason pink text on the light theme (3.12:1) is limited to display-size headings, as in the guide.
- ITCSS namespaces in class names (`ap-o-`, `ap-c-`, `ap-u-`), so the layer of every class is readable in markup.
- The Elements layer is opt-in (`$emit-elements`, default `true`): a consumer embedding astrostyle in an existing site can switch off bare-element styling.
- Breakpoints `36/48/64/80em`; components respond to container width rather than viewport width.
