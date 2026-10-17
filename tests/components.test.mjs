// Components: emission, token contract, modifiers, selection and states.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileConfigured, compileError } from './helpers/sass.mjs'
import { declarationsOf, rules } from './helpers/css.mjs'

const css = compileConfigured()
const components = [
  'button',
  'button-group',
  'field',
  'input',
  'select',
  'combobox',
  'checkbox',
  'radio',
  'switch',
  'range',
  'meter',
  'breadcrumb',
  'tag',
  'callout',
  'progress',
  'spinner',
  'empty-state',
  'pagination',
  'tabs',
  'toast',
  'masthead',
  'section-heading',
  'subheading',
  'window',
  'card',
  'tabbed-box',
  'segment-bar',
  'swatch',
  'dialog',
  'drawer',
  'accordion',
  'table',
  'list',
  'divider',
  'kbd',
  'skeleton',
]
const controls = ['button', 'input', 'checkbox', 'radio', 'switch', 'range']

// Rules of the components layer whose selector list contains `selector`.
const componentRules = (source, selector) =>
  rules(source).filter(
    (rule) => rule.layer === 'astrostyle.components' && rule.selectors.includes(selector),
  )

test('every component is emitted in the components layer', () => {
  for (const name of components) assert.ok(componentRules(css, `.ap-c-${name}`).length, name)
})

test('component roots read every public token with a default', () => {
  const button = declarationsOf(css, '.ap-c-button')
  assert.equal(button['--_bg'], 'var(--ap-button-bg, transparent)')
  assert.equal(button['--_radius'], 'var(--ap-button-radius, var(--ap-radius-pill))')
  assert.equal(button['background-color'], 'var(--_bg)')
  assert.equal(
    declarationsOf(css, '.ap-c-input')['--_border-color'],
    'var(--ap-input-border-color, var(--ap-border))',
  )
})

test('modifiers only set public tokens of their component', () => {
  for (const rule of rules(css).filter((r) => r.layer === 'astrostyle.components')) {
    for (const selector of rule.selectors) {
      const modifier = selector.match(/^\.ap-c-([a-z-]+?)--[a-z0-9-]+$/)
      if (!modifier || selector === '.ap-c-button--cut') continue
      for (const prop of Object.keys(rule.declarations)) {
        assert.ok(prop.startsWith(`--ap-${modifier[1]}-`), `${selector} sets ${prop}`)
      }
    }
  }
})

test('the primary button uses the accent and its ink', () => {
  assert.deepEqual(
    {
      bg: declarationsOf(css, '.ap-c-button--primary')['--ap-button-bg'],
      fg: declarationsOf(css, '.ap-c-button--primary')['--ap-button-fg'],
    },
    { bg: 'var(--ap-accent)', fg: 'var(--ap-on-accent)' },
  )
})

test('every control shows a keyboard focus style and a disabled state', () => {
  const selectors = rules(css)
    .filter((rule) => rule.layer === 'astrostyle.components')
    .flatMap((rule) => rule.selectors)
  for (const name of controls) {
    assert.ok(
      selectors.some((s) => s.startsWith(`.ap-c-${name}:where(:focus-visible`)),
      `${name} focus`,
    )
    assert.ok(
      selectors.some((s) => s.startsWith(`.ap-c-${name}:where(:disabled`)),
      `${name} disabled`,
    )
  }
})

test('$components emits only the selected components, in emission order', () => {
  const some = compileConfigured('$components: (button-group, button)')
  assert.ok(componentRules(some, '.ap-c-button').length)
  assert.equal(componentRules(some, '.ap-c-input').length, 0)
  const order = rules(some)
    .filter((r) => r.layer === 'astrostyle.components')
    .map((r) => r.selectors[0])
  assert.ok(order.indexOf('.ap-c-button') < order.indexOf('.ap-c-button-group'))
})

test('an unknown component fails compilation', () => {
  assert.match(
    compileError("@use 'index' with ($components: (buton));"),
    /unknown component `buton`/,
  )
})

test('a custom prefix renames component classes and tokens', () => {
  const custom = compileConfigured("$prefix: 'x'")
  assert.equal(declarationsOf(custom, '.x-c-button')['--_bg'], 'var(--x-button-bg, transparent)')
})

test('variant() adds a look that the button reads', () => {
  const custom = compileConfigured(
    '',
    '@include ap.emit;\n@include ap.variant(button, warn, (bg: var(--ap-warning)));',
  )
  assert.deepEqual(declarationsOf(custom, '.ap-c-button--warn'), {
    '--ap-button-bg': 'var(--ap-warning)',
  })
})

test('the meter fills discrete segments from value and max', () => {
  const meter = declarationsOf(css, '.ap-c-meter')
  assert.equal(meter['--_filled'], 'calc(var(--_value) / var(--_max) * 100%)')
  assert.match(meter['mask-image'], /repeating-linear-gradient/)
  assert.deepEqual(declarationsOf(css, '.ap-c-meter--danger'), {
    '--ap-meter-fill': 'var(--ap-danger)',
  })
})

test('breadcrumb separators are generated content hidden from assistive technology', () => {
  assert.deepEqual(
    declarationsOf(css, '.ap-c-breadcrumb__item:where(:not(:first-child))::before'),
    { color: 'var(--_separator-color)', content: 'var(--_separator)/""' },
  )
  assert.equal(
    declarationsOf(css, '.ap-c-breadcrumb')['--_separator'],
    'var(--ap-breadcrumb-separator, "/")',
  )
  assert.ok(declarationsOf(css, '.ap-c-breadcrumb__link:where([aria-current=page])'))
})

test('tag tones set the tone and its ink; --solid fills with them', () => {
  assert.deepEqual(declarationsOf(css, '.ap-c-tag--danger'), {
    '--ap-tag-tone': 'var(--ap-danger)',
    '--ap-tag-ink': 'var(--ap-on-danger)',
  })
  assert.deepEqual(declarationsOf(css, '.ap-c-tag--solid'), {
    '--ap-tag-bg': 'var(--_tone)',
    '--ap-tag-fg': 'var(--_ink)',
  })
  assert.equal(
    declarationsOf(css, '.ap-c-tag')['--_bg'],
    'var(--ap-tag-bg, color-mix(in oklab, var(--_tone) 16%, transparent))',
  )
})

test('callout tones add a start bar and tint the fill', () => {
  assert.equal(
    declarationsOf(css, '.ap-c-callout')['--_bar-width'],
    'var(--ap-callout-bar-width, 0)',
  )
  assert.deepEqual(declarationsOf(css, '.ap-c-callout--warning'), {
    '--ap-callout-tone': 'var(--ap-warning)',
    '--ap-callout-bar-width': 'var(--ap-space-xs)',
    '--ap-callout-bg': 'color-mix(in oklab, var(--ap-warning) 10%, var(--ap-surface-1))',
  })
})

test('progress styles the native bar in every engine and sweeps when indeterminate', () => {
  for (const part of ['::-webkit-progress-value', '::-moz-progress-bar']) {
    assert.equal(declarationsOf(css, `.ap-c-progress${part}`)['background-color'], 'var(--_fill)')
  }
  assert.match(
    declarationsOf(css, '.ap-c-progress:where(:indeterminate)').animation,
    /^ap-progress-sweep var\(--_duration\) linear infinite$/,
  )
  assert.match(css, /@keyframes ap-progress-sweep/)
})

test('the spinner turns with prefixed keyframes and offers the guide spectrum', () => {
  assert.match(declarationsOf(css, '.ap-c-spinner').animation, /^ap-spinner-turn /)
  assert.match(css, /@keyframes ap-spinner-turn/)
  assert.match(
    declarationsOf(css, '.ap-c-spinner--spectrum')['--ap-spinner-arc'],
    /yellow.*orange.*magenta.*indigo/,
  )
  assert.match(compileConfigured("$prefix: 'x'"), /@keyframes x-spinner-turn/)
})

test('the empty state centers its icon, title and text', () => {
  assert.equal(declarationsOf(css, '.ap-c-empty-state')['justify-items'], 'center')
  for (const part of ['icon', 'title', 'text']) {
    assert.ok(declarationsOf(css, `.ap-c-empty-state__${part}`), part)
  }
})

test('pagination marks the current page with the accent fill', () => {
  assert.deepEqual(declarationsOf(css, '.ap-c-pagination__link:where([aria-current=page])'), {
    'background-color': 'var(--_current-bg)',
    color: 'var(--_current-fg)',
    cursor: 'default',
  })
  assert.equal(declarationsOf(css, '.ap-c-pagination__link')['min-block-size'], 'var(--_size)')
})

test('the selected tab draws the indicator; vertical lists move it to the start edge', () => {
  assert.match(
    declarationsOf(css, '.ap-c-tabs__tab:where([aria-selected=true])')['box-shadow'],
    /var\(--_indicator-color\)$/,
  )
  assert.ok(
    declarationsOf(
      css,
      '.ap-c-tabs__tab:where([aria-orientation=vertical] > [aria-selected=true])',
    ),
  )
})

test('the toast region is fixed above the page and anchors to the end corner from sm up', () => {
  const region = declarationsOf(css, '.ap-c-toast__region')
  assert.equal(region.position, 'fixed')
  assert.equal(region['z-index'], 'var(--ap-z-toast)')
  assert.match(
    css,
    /@media \(min-width: 36em\) \{\s*\.ap-c-toast__region \{\s*inset-inline-start: auto;/,
  )
  assert.match(declarationsOf(css, '.ap-c-toast').animation, /^ap-toast-in /)
  // An empty live region must stay in the accessibility tree, or the first toast is not read.
  assert.doesNotMatch(css, /\.ap-c-toast__region:where\(:empty\)/)
  assert.deepEqual(declarationsOf(css, '.ap-c-toast--danger'), {
    '--ap-toast-tone': 'var(--ap-danger)',
    '--ap-toast-bar-width': 'var(--ap-space-xs)',
  })
})

test('the masthead title grows with the viewport between two limits, times the font scale', () => {
  const title = declarationsOf(css, '.ap-c-masthead__title')
  assert.equal(title['font-size'], 'calc(var(--_title-size) * var(--ap-font-scale))')
  assert.match(
    declarationsOf(css, '.ap-c-masthead')['--_title-size'],
    /^var\(--ap-masthead-title-size, clamp\(var\(--ap-text-display-size\) \* 1\.2, 8vw, /,
  )
})

test('the section heading draws its rule between the title and the index', () => {
  assert.deepEqual(declarationsOf(css, '.ap-c-section-heading::after'), {
    flex: '1',
    order: '1',
    'min-inline-size': 'var(--ap-space-xl)',
    'border-block-start': 'var(--_rule-width) solid var(--_rule-color)',
    content: '""',
  })
  assert.equal(declarationsOf(css, '.ap-c-section-heading__index').order, '2')
})

test('subheading slashes are generated content hidden from assistive technology', () => {
  assert.equal(declarationsOf(css, '.ap-c-subheading::before').content, 'var(--_slash)/""')
  assert.equal(
    declarationsOf(css, '.ap-c-subheading')['--_slash'],
    'var(--ap-subheading-slash, "/")',
  )
})

test('the window bar swaps the theme colors', () => {
  const window = declarationsOf(css, '.ap-c-window')
  assert.equal(window['--_bar-bg'], 'var(--ap-window-bar-bg, var(--ap-text))')
  assert.equal(window['--_bar-fg'], 'var(--ap-window-bar-fg, var(--ap-bg))')
  assert.equal(window.overflow, 'clip')
})

test('a card has no layout, and reacts to hover and focus only as a link or a button', () => {
  assert.equal(declarationsOf(css, '.ap-c-card').display, undefined)
  assert.ok(declarationsOf(css, '.ap-c-card:where(a[href], button):where(:focus-visible)'))
  assert.deepEqual(
    declarationsOf(css, '.ap-c-card:where(a[href], button):where(:hover):where(:not(:disabled))'),
    { 'border-color': 'var(--_hover-border-color)' },
  )
})

test('the tabbed box sets its tab vertically, reading from bottom to top', () => {
  const tab = declarationsOf(css, '.ap-c-tabbed-box__tab')
  assert.equal(tab['writing-mode'], 'vertical-rl')
  assert.equal(tab.transform, 'rotate(180deg)')
  assert.equal(
    declarationsOf(css, '.ap-c-tabbed-box')['grid-template-columns'],
    'auto minmax(0, 1fr)',
  )
})

test('segment bar segments wrap and draw their dividers inside the clipped frame', () => {
  const bar = declarationsOf(css, '.ap-c-segment-bar')
  assert.equal(bar['flex-wrap'], 'wrap')
  assert.equal(bar.overflow, 'clip')
  assert.match(declarationsOf(css, '.ap-c-segment-bar__segment')['box-shadow'], /\* -1\) 0 0 /)
})

test('a swatch fills its chip with the color set on it', () => {
  assert.equal(
    declarationsOf(css, '.ap-c-swatch')['--_color'],
    'var(--ap-swatch-color, transparent)',
  )
  assert.equal(declarationsOf(css, '.ap-c-swatch__chip')['background-color'], 'var(--_color)')
})

test('dialogs and drawers lay out only when open, over a backdrop read from the public token', () => {
  for (const name of ['dialog', 'drawer']) {
    assert.equal(declarationsOf(css, `.ap-c-${name}`).display, undefined, name)
    assert.equal(declarationsOf(css, `.ap-c-${name}:where([open])`).display, 'flex', name)
    assert.match(
      declarationsOf(css, `.ap-c-${name}::backdrop`)['background-color'],
      new RegExp(`^var\\(--ap-${name}-backdrop, color-mix\\(`),
      name,
    )
    assert.match(css, new RegExp(`@keyframes ap-${name}-in`), name)
  }
  assert.deepEqual(declarationsOf(css, '.ap-c-drawer--start'), {
    '--ap-drawer-start': '0',
    '--ap-drawer-end': 'auto',
    '--ap-drawer-offset': 'calc(var(--ap-space-xl) * -1)',
  })
})

test('the accordion hides the native marker and turns its chevron when open', () => {
  assert.equal(declarationsOf(css, '.ap-c-accordion__summary')['list-style'], 'none')
  assert.ok(declarationsOf(css, '.ap-c-accordion__summary::-webkit-details-marker'))
  assert.equal(
    declarationsOf(css, '.ap-c-accordion__summary:where([open] > *)::after').rotate,
    '-135deg',
  )
})

test('the table scrolls sideways in its frame; stripes and density are tokens', () => {
  assert.equal(declarationsOf(css, '.ap-c-table')['overflow-x'], 'auto')
  assert.ok(declarationsOf(css, '.ap-c-table:where(:focus-visible)'))
  assert.equal(
    declarationsOf(css, '.ap-c-table :where(tbody tr:nth-child(even))')['background-color'],
    'var(--_stripe-bg)',
  )
  assert.deepEqual(declarationsOf(css, '.ap-c-table--striped'), {
    '--ap-table-stripe-bg': 'var(--ap-surface-1)',
  })
})

test('list rows split by hairlines; a link row fills the item and keeps a 40px target', () => {
  assert.equal(declarationsOf(css, '.ap-c-list__item:where(:last-child)')['border-block-end'], '0')
  assert.equal(declarationsOf(css, '.ap-c-list__link')['min-block-size'], 'var(--ap-size-control)')
  assert.deepEqual(declarationsOf(css, '.ap-c-list--plain'), {
    '--ap-list-divider-color': 'transparent',
  })
})

test('the divider draws both lines and spaces them from a label only', () => {
  assert.equal(declarationsOf(css, '.ap-c-divider').border, '0')
  for (const line of ['::before', '::after']) {
    assert.equal(
      declarationsOf(css, `.ap-c-divider${line}`)['border-block-start'],
      'var(--_width) solid var(--_color)',
    )
  }
  assert.equal(declarationsOf(css, '.ap-c-divider:where(:not(:empty))').gap, 'var(--_gap)')
})

test('kbd draws a key cap with a thicker bottom edge', () => {
  assert.equal(
    declarationsOf(css, '.ap-c-kbd')['border-block-end-width'],
    'var(--ap-border-width-strong)',
  )
})

test('the skeleton pulses with prefixed keyframes and offers block and circle shapes', () => {
  assert.match(declarationsOf(css, '.ap-c-skeleton').animation, /^ap-skeleton-pulse /)
  assert.match(css, /@keyframes ap-skeleton-pulse/)
  assert.equal(
    declarationsOf(css, '.ap-c-skeleton--circle')['--ap-skeleton-radius'],
    'var(--ap-radius-pill)',
  )
})
