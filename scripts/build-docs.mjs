// Builds the static docs site into _site/: pages from site/pages wrapped in site/layout.html,
// token sections generated from tokens.json, and the docs stylesheet compiled with the public API.
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import { exportTokens, licenseHeader } from './build.mjs'

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

// Swatch markup: a color chip reading `cssValue`, a title and a code line.
function swatch(cssValue, title, code) {
  return `<div class="docs-swatch"><span class="docs-swatch__chip" style="--swatch: ${cssValue}"></span><span class="ap-o-stack ap-o-stack--gap-xxs"><strong>${title}</strong><code>${code}</code></span></div>`
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
      return `<div class="docs-card ap-o-stack" data-ap-theme="${theme}"><h3>${theme}</h3><div class="ap-o-stack ap-o-stack--gap-xs">${rows}</div></div>`
    })
    .join('\n')
}

// Pixel size of a DTCG rem dimension, for display.
const toPx = (dimension) => `${Math.round(dimension.value * 16)}px`

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
    'type-roles': typeRolesHtml(tokens),
    spacing: spacingHtml(tokens),
    shapes: shapesHtml(tokens),
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
    copyFile(`${siteDir}/assets/favicon.svg`, `${outDir}/assets/favicon.svg`),
    writeFile(`${outDir}/.nojekyll`, ''),
  ])
  return pages.length
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Built ${await buildDocs()} docs pages in _site/`)
}
