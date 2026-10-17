// Builds the static docs site into _site/: pages from site/pages wrapped in site/layout.html,
// token sections generated from tokens.json, and the docs stylesheet compiled with the public API.
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import { exportComponentTokens, exportTokens, licenseHeader } from './build.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const siteDir = `${root}site`
const outDir = `${root}_site`

/** Navigation entries in display order: page file and label. */
export const navigation = [
  ['index.html', 'Home'],
  ['demo.html', 'Demo'],
  ['foundations.html', 'Foundations'],
  ['elements.html', 'Elements'],
  ['layouts.html', 'Layouts'],
  ['utilities.html', 'Utilities'],
  ['buttons.html', 'Buttons'],
  ['forms.html', 'Forms'],
  ['navigation.html', 'Navigation'],
  ['feedback.html', 'Feedback'],
  ['blocks.html', 'Blocks'],
  ['containers.html', 'Containers'],
]

/** Design Guide names of the palette tokens. */
const guideNames = {
  black: 'ASTROPRISMA Black',
  white: 'ASTROPRISMA White',
  'off-white': 'ASTROPRISMA Off-White',
  pink: 'ASTROPRISMA Pink',
  'pink-dark': 'Dark Pink',
  'pink-shadow': 'Shadow Pink',
  yellow: 'Gradient Yellow',
  orange: 'Gradient Orange',
  magenta: 'Gradient Magenta',
  indigo: 'Gradient Indigo',
  red: 'WARG Red',
  teal: 'Intersolar Blue',
  green: 'Medusa Green',
  sea: 'Wire Teal',
  amber: 'Corsair Yellow',
  rose: 'Synth Magenta',
}

// Swatch markup: a color chip reading `cssValue`, a name and a code line.
function swatch(cssValue, title, code) {
  return `<div class="ap-c-swatch" style="--ap-swatch-color: ${cssValue}"><span class="ap-c-swatch__chip"></span><strong class="ap-c-swatch__name">${title}</strong><code class="ap-c-swatch__value">${code}</code></div>`
}

// Palette swatches with their Design Guide names and hex values.
export function paletteHtml(tokens) {
  return Object.entries(tokens.palette)
    .map(([name, token]) =>
      swatch(
        `var(--ap-palette-${name})`,
        guideNames[name] ?? name,
        `${token.$value.hex} · --ap-palette-${name}`,
      ),
    )
    .join('\n')
}

// One themed card per theme listing its semantic colors; each card sets its own data-ap-theme.
export function themesHtml(tokens) {
  return Object.entries(tokens.theme)
    .map(([theme, colors]) => {
      const rows = Object.keys(colors)
        .map((name) => swatch(`var(--ap-${name})`, name, `--ap-${name}`))
        .join('\n')
      return `<div class="ap-c-card ap-o-stack" data-ap-theme="${theme}"><h3>${theme}</h3><div class="ap-o-stack ap-o-stack--gap-xs">${rows}</div></div>`
    })
    .join('\n')
}

// Pixel size of a DTCG rem dimension, for display.
const toPx = (dimension) => `${Math.round(dimension.value * 16)}px`

/** How the files of each font arrive, keyed as in `fontGuide`. */
const fontFiles = {
  bundled: 'Bundled: <code>astrostyle/fonts.css</code> declares it.',
  licensed: 'Not bundled: add your copy and set <code>$licensed-path</code>.',
  own: 'Not bundled: add your copy with your own <code>@font-face</code>.',
}

/** Usage note shared by the accent fonts. */
const accentUse = (name) =>
  `Special titles and graphic details. No component uses it: set <code>font-family: var(--ap-font-${name})</code> where you need it.`

/** Design Guide font, intended use, samples (label and inline style) and files of each family token. */
const fontGuide = {
  body: {
    font: 'Feature Mono',
    use: 'Main text: Light for body copy, Medium for bold and data, Hairline for labels and captions. Roles body, data, label, caption and action, plus code.',
    samples: [
      ['Hairline 100', 'font-weight: 100'],
      ['Light 300', 'font-weight: 300'],
      ['Medium 500', 'font-weight: 500'],
    ],
    files: 'bundled',
  },
  display: {
    font: 'Newake, or Powerr',
    use: 'Titles and the logo. Roles display, screen-title and panel-title (h1 to h3). Newake is paid; Powerr is its free alternative.',
    samples: [
      ['Regular 400', 'font-weight: 400'],
      ['Medium 500', 'font-weight: 500'],
      ['Bold 700', 'font-weight: 700'],
    ],
    files: 'licensed',
  },
  serif: {
    font: 'Instrument Serif',
    use: 'Italics: <code>em</code>, <code>i</code>, <code>cite</code> and <code>blockquote</code>; names on maps.',
    samples: [
      ['Regular', 'font-style: normal'],
      ['Italic', 'font-style: italic'],
    ],
    files: 'bundled',
  },
  'accent-rimma': {
    font: 'Rimma Sans',
    samples: [['Bold 700', 'font-weight: 700']],
    files: 'licensed',
  },
  'accent-fat': { font: 'Free Fat Font', files: 'own' },
  'accent-genesys': { font: 'Genesys', files: 'bundled' },
  'accent-cyberillic': { font: 'ST-Cyberillic', files: 'bundled' },
  'accent-schabo': { font: 'SCHABO Condensed', files: 'licensed' },
}

// One card per font-family token: samples in that family, the token, its use and its files.
export function fontsHtml(tokens) {
  return Object.keys(tokens.font.family)
    .map((name) => {
      const guide = fontGuide[name]
      if (!guide) throw new Error(`font-${name} has no entry in fontGuide`)
      const samples = (guide.samples ?? [['Regular 400', 'font-weight: 400']])
        .map(
          ([label, style]) =>
            `<p class="docs-specimen" style="font-family: var(--ap-font-${name}); ${style}">Sensor lock 0427</p><p class="docs-note"><small>${label}</small></p>`,
        )
        .join('')
      return `<div class="ap-c-card ap-o-stack ap-o-stack--gap-sm"><h3>${guide.font}</h3><div>${samples}</div><p><code>--ap-font-${name}</code></p><p>${guide.use ?? accentUse(name)}</p><p class="docs-note"><small>${fontFiles[guide.files]}</small></p></div>`
    })
    .join('\n')
}

// One sample per type role, with its size, weight reference and line height.
export function typeRolesHtml(tokens) {
  return Object.entries(tokens.text)
    .map(([role, token]) => {
      const { fontSize, fontWeight, lineHeight } = token.$value
      const weight = fontWeight.replace(/^\{font\.weight\.(.+)\}$/, '$1')
      return `<div class="ap-o-stack ap-o-stack--gap-xxs"><p class="ap-u-text-${role}">Sensor lock acquired</p><p class="docs-note"><small>${role} · ${toPx(fontSize)} · ${weight} · line height ${lineHeight}</small></p></div>`
    })
    .join('\n')
}

// One bar per spacing step, as wide as the step.
export function spacingHtml(tokens) {
  return Object.entries(tokens.space)
    .map(
      ([step, token]) =>
        `<div class="ap-o-cluster"><code>--ap-space-${step} · ${toPx(token.$value)}</code><span class="docs-bar" style="--bar: var(--ap-space-${step})"></span></div>`,
    )
    .join('\n')
}

// Boxes showing each radius and each elevation.
export function shapesHtml(tokens) {
  const radii = Object.keys(tokens.shape)
    .filter((name) => name.startsWith('radius-'))
    .map(
      (name) =>
        `<div class="docs-shape" style="--radius: var(--ap-${name})"><code>--ap-${name}</code></div>`,
    )
  const shadows = Object.keys(tokens.elevation).map(
    (name) =>
      `<div class="docs-shape" style="--radius: var(--ap-radius-card); --shadow: var(--ap-elevation-${name})"><code>--ap-elevation-${name}</code></div>`,
  )
  return [...radii, ...shadows].join('\n')
}

// Escapes text for HTML content.
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Table of a component's public tokens and their defaults.
export function componentTokensHtml(name, tokens) {
  const rows = Object.entries(tokens)
    .map(
      ([key, value]) =>
        `<tr><td><code>--ap-${name}-${key}</code></td><td><code>${escapeHtml(value)}</code></td></tr>`,
    )
    .join('\n')
  return `<div style="overflow-x: auto"><table><caption>Tokens of ${name}: set them on the element, on a parent or in a modifier.</caption><thead><tr><th scope="col">Token</th><th scope="col">Default</th></tr></thead><tbody>${rows}</tbody></table></div>`
}

// One `tokens-<component>` placeholder value per component.
export function componentTokenValues(components) {
  return Object.fromEntries(
    Object.entries(components).map(([name, tokens]) => [
      `tokens-${name}`,
      componentTokensHtml(name, tokens),
    ]),
  )
}

// Navigation links, marking the current page.
export function navHtml(currentFile) {
  return navigation
    .map(([file, label]) => {
      const current = file === currentFile ? ' aria-current="page"' : ''
      return `<a class="docs-nav-link" href="${file}"${current}>${label}</a>`
    })
    .join('\n')
}

// Fills every `{{name}}` placeholder of `template`; unknown placeholders are an error.
export function fill(template, values) {
  return template.replace(/\{\{([a-z-]+)\}\}/g, (match, name) => {
    if (!(name in values)) throw new Error(`No value for placeholder ${match}`)
    return values[name]
  })
}

// Renders one page fragment (first line `<!-- title: … -->`) into the layout.
export function renderPage(layout, fragment, file, values) {
  const title = fragment.match(/^<!-- title: (.+?) -->/)?.[1]
  if (!title) throw new Error(`${file} has no title comment`)
  const content = fill(fragment.replace(/^<!-- title: .+? -->\n/, ''), values)
  return fill(layout, { ...values, title, content, nav: navHtml(file) })
}

// Builds the whole site from scratch and returns the page count; `style` is the Sass output
// style of docs.css (`expanded` for local development).
export async function buildDocs({ style = 'compressed' } = {}) {
  const { version } = JSON.parse(await readFile(`${root}package.json`, 'utf8'))
  const tokens = exportTokens()
  const values = {
    version,
    palette: paletteHtml(tokens),
    themes: themesHtml(tokens),
    fonts: fontsHtml(tokens),
    'type-roles': typeRolesHtml(tokens),
    spacing: spacingHtml(tokens),
    shapes: shapesHtml(tokens),
    ...componentTokenValues(exportComponentTokens()),
  }
  const layout = await readFile(`${siteDir}/layout.html`, 'utf8')
  const css = sass.compile(`${siteDir}/docs.scss`, {
    loadPaths: [`${root}scss`],
    style,
  }).css

  await rm(outDir, { recursive: true, force: true })
  await mkdir(`${outDir}/assets`, { recursive: true })
  const pages = (await readdir(`${siteDir}/pages`)).filter((file) => file.endsWith('.html'))
  await Promise.all([
    ...pages.map(async (file) => {
      const fragment = await readFile(`${siteDir}/pages/${file}`, 'utf8')
      await writeFile(`${outDir}/${file}`, renderPage(layout, fragment, file, values))
    }),
    writeFile(`${outDir}/docs.css`, `${licenseHeader(version)}\n${css}\n`),
    copyFile(`${siteDir}/docs.js`, `${outDir}/docs.js`),
    cp(`${root}js`, `${outDir}/js`, { recursive: true }),
    cp(`${root}fonts`, `${outDir}/fonts`, { recursive: true }),
    copyFile(`${siteDir}/assets/favicon.svg`, `${outDir}/assets/favicon.svg`),
    writeFile(`${outDir}/.nojekyll`, ''),
  ])
  return pages.length
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Built ${await buildDocs()} docs pages in _site/`)
}
