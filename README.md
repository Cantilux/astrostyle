# astrostyle

A CSS/SCSS framework for building websites and web apps in the visual style of the ASTROPRISMA tabletop RPG: buttons, form controls, pagination, panels and the other generic pieces of an interface. It has no framework dependency; the few interactive parts are vanilla JavaScript.

> **Status: design phase.** The architecture and the design rules are being defined. There is no usable code yet and nothing is published on npm. Everything below describes the planned framework and may change.

astrostyle is an unofficial, community-made project. It is not affiliated with or endorsed by the authors of ASTROPRISMA.

## Contents

- [Installation](#installation)
- [Design philosophy](#design-philosophy)
- [Code conventions](#code-conventions)
- [Workflow](#workflow)
- [License](#license)

## Installation

[Work in progress]

## Design philosophy

### The ASTROPRISMA Design Guide comes first

The visual source of truth is the **ASTROPRISMA Design Guide** (`06_Design Guide [PDF]`), distributed in the official ASTROPRISMA Creator Kit. When the framework and the guide disagree, the guide wins. astrostyle translates its print rules into interface tokens and components:

- **Color.** ASTROPRISMA Black is a dark indigo, never a neutral black. The two whites are warm bone whites, never pure white. Pink is the accent, and the guide explicitly allows replacing it, so the accent is a single token. Values are taken from the guide's vector artwork (sRGB):

  | Guide name | Value | Guide name | Value |
  | --- | --- | --- | --- |
  | ASTROPRISMA Black | `#130d1c` | Gradient Yellow | `#ffbd5c` |
  | ASTROPRISMA White | `#f0eee8` | Gradient Orange | `#ff603e` |
  | ASTROPRISMA Off-White | `#e9dcd3` | Gradient Magenta | `#d50059` |
  | ASTROPRISMA Pink | `#ef476e` | Gradient Indigo | `#54009d` |
  | Dark Pink | `#d50059` | WARG Red | `#ca2632` |
  | Shadow Pink | `#ab0048` | Intersolar Blue | `#5fc3b0` |
  | Corsair Yellow | `#faa21e` | Medusa Green | `#6abd45` |
  | Synth Magenta | `#d51b5b` | Wire Teal | `#4bba7a` |

- **Gradient.** The four gradient colors always appear as four equal, hard-edged bands in the fixed order yellow, orange, magenta, indigo; never as a smooth blend.
- **Light and dark.** The guide pairs black on white and white on black. astrostyle ships both as complete themes, selected explicitly with `data-ap-theme`, never inferred from operating-system settings.
- **Typography.** Feature Mono for text (Light for body, Medium for emphasis, Hairline for details) and Newake for titles, with Powerr as its free alternative. Rimma Sans, Free Fat Font, Genesys, Instrument Serif, ST-Cyberillic and SCHABO are available as accent roles. Font files are not bundled: fonts have different licenses, and each project provides its own.
- **Texture.** The guide's halftone (50% opacity) and noise filters become optional surfaces for decorative areas. They never sit on top of text or controls.
- **Graphic motifs.** Recurring elements of the guide become components: the masthead with a small eyebrow over a large display word, the pink section heading with a hairline rule and a two-digit index, the window panel with a dark title bar, pill buttons, segmented pill legends, side-tab boxes, callouts and `/ SLASHED /` subheadings.

### Principles

- **Generic, not game-specific.** astrostyle contains interface building blocks only. Game tools (combat trackers, star maps, character sheets) belong to the projects that use it, built on top of its tokens and components.
- **Design tokens.** Every color, size, space, radius, duration and layer index is a token. Tokens are defined once in Sass maps and published as CSS custom properties and as a W3C Design Tokens JSON file. Components never contain raw values.
- **ITCSS.** Styles are organized as an inverted triangle, from generic and far-reaching to explicit and narrow: Settings, Tools, Generic, Elements, Objects, Components, Utilities. Each layer that outputs CSS is also a native CSS cascade layer, so the browser enforces the order.
- **Universal box model and reset.** `border-box` sizing and a minimal reset apply to every element, at zero specificity.
- **Mobile first.** Base styles target the narrowest screen; larger layouts are added with `min-width` queries only. Components respond to the size of their container rather than the viewport, so the same component works in a sidebar and in a full page.
- **Low specificity.** At most one class per selector, no IDs, no `!important`. Any style written by the consuming project overrides the framework without fighting it.
- **Component-based.** Each component is self-contained, owns only its own markup, has no outer margins and is placed by layout objects. Interfaces are built by composing components, not by multiplying variants.
- **Easy to customize.** Change one custom property at runtime, configure the framework at build time with Sass `@use … with (…)`, add variants and themes with public mixins, or build new components with the same tools. Token names, class names and mixin signatures are public API and follow semantic versioning.
- **No framework lock-in.** Plain HTML and CSS first, native elements (`<dialog>`, popover, `<details>`) where possible, and small vanilla JavaScript modules only where HTML is not enough.

## Code conventions

### Sass

- Dart Sass module system only: `@use` and `@forward`. No `@import`, no `@extend` across modules.
- Folders follow the ITCSS layers:

  | Layer | Folder | Output | Class namespace |
  | --- | --- | --- | --- |
  | Settings | `scss/settings/` | none: configuration and token maps | — |
  | Tools | `scss/tools/` | none: functions and mixins | — |
  | Generic | `scss/generic/` | custom properties, box model, reset | — |
  | Elements | `scss/elements/` | bare HTML element defaults | — |
  | Objects | `scss/objects/` | layout patterns, no cosmetics | `ap-o-` |
  | Components | `scss/components/<name>/` | designed UI pieces | `ap-c-` |
  | Utilities | `scss/utilities/` | single-purpose overrides | `ap-u-` |

- A layer may depend only on earlier layers. A component never styles another component or an object.
- Every configurable variable is declared `!default`. Map settings are deep-merged with defaults.
- Raw values (colors, font sizes, radii, durations, z-indexes) live only in `scss/settings/`. Everything else uses `token()`, `space()`, `text()` and the other public functions.

### Selectors and naming

- BEM with ITCSS namespaces: `.ap-c-button`, `.ap-c-button__icon`, `.ap-c-button--primary`, `.ap-o-stack`, `.ap-u-truncate`.
- Responsive utilities use a breakpoint suffix: `.ap-u-hidden@md`.
- Specificity budget: `(0,0,0)` in Generic and Elements (everything inside `:where()`), `(0,1,0)` everywhere else.
- No IDs, no `!important`, no type-qualified classes (`button.ap-c-button`), no chains between components (`.ap-c-card .ap-c-button`).
- States come from native and ARIA attributes first (`:disabled`, `[aria-invalid="true"]`, `[aria-expanded="true"]`, `[aria-current]`). `is-*` and `has-*` classes are used only when no attribute exists.
- JavaScript hooks use `data-ap-*` attributes and are never used for styling. Themes use `data-ap-theme`.
- Custom properties: `--ap-{token}` for global tokens, `--ap-{component}-{property}` for component tokens, `--_{name}` for private values inside a component.

### Responsive

- Mobile first: `min-width` media queries only, through `ap.mq()`; container queries through `ap.cq()`.
- Breakpoints are expressed in `em`.
- Logical properties (`inline-size`, `margin-block`, `padding-inline`) instead of physical ones.
- Interactive controls are at least 40px tall at every size.

### Components

- One folder per component: styles, component tokens, markup contract, docs page, tests and, if needed, a JavaScript module.
- Every visual property reads a component token with a semantic fallback, so it can be customized without new selectors.
- No outer margins and no fixed outer widths on component roots.

### JavaScript

- Native ES modules with no dependencies and no build step required by consumers.
- One module per interactive component, exposing a `createX(element, options)` factory that returns a handle with `destroy()`.
- Components communicate through DOM events prefixed with `ap:` (`ap:change`, `ap:open`, `ap:close`).
- Pure logic (filtering, page ranges) is kept in separate functions and unit tested; the document and timers are passed in, not hard-coded.
- JavaScript never sets visual styles inline, except for positioning.
- Every named function has a short comment above it stating its purpose or contract.

### Repository

- Documentation and code comments are in English.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Bun is the package manager.

## Workflow

[Work in progress]

## License

MIT.
