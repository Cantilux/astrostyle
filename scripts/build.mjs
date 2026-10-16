// Builds dist/: the readable and minified stylesheets, each with the license header, and the
// W3C Design Tokens export.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))
const entry = `${root}scss/astrostyle.scss`
const tokensEntry = `${root}scripts/tokens.scss`
const componentsEntry = `${root}scripts/component-tokens.scss`
const distDir = `${root}dist`

/** Output files produced from the bundle entry, one per Sass output style. */
export const targets = [
  { file: 'astrostyle.css', style: 'expanded' },
  { file: 'astrostyle.min.css', style: 'compressed' },
]

/** Notices required by the ASTROPRISMA Third Party License (docs/design.md §11). */
export const thirdPartyNotices = [
  'astrostyle is an independent production by Enrico Cantile and is not affiliated with Crescent Chimera. It is published under the ASTROPRISMA Third Party License.',
  'ASTROPRISMA is copyright Camila Mera and Crescent Chimera.',
]

// Preserved comment placed at the top of every stylesheet; `/*!` survives minification.
export function licenseHeader(version) {
  return [
    `/*! astrostyle v${version} | MIT License | https://github.com/Cantilux/astrostyle`,
    ...thirdPartyNotices.map((notice) => ` * ${notice}`),
    ' */',
  ].join('\n')
}

// Compiles `entryPath` once per target and returns the CSS keyed by output file name.
export function compileTargets(entryPath, buildTargets = targets, compile = sass.compile) {
  return Object.fromEntries(
    buildTargets.map(({ file, style }) => [file, compile(entryPath, { style }).css]),
  )
}

// Runs a build-only Sass entry and returns the JSON document it reports via `@debug`.
function exportJson(entryPath, compile) {
  let json = null
  compile(entryPath, {
    loadPaths: [`${root}scss`, `${root}scripts`],
    logger: { debug: (message) => (json = message) },
  })
  if (json === null) throw new Error(`${entryPath} reported nothing`)
  return JSON.parse(json)
}

// Returns the design tokens as a DTCG document (scripts/tokens.scss).
export function exportTokens(entryPath = tokensEntry, compile = sass.compile) {
  return exportJson(entryPath, compile)
}

// Returns the public tokens of every component with their defaults (scripts/component-tokens.scss).
export function exportComponentTokens(entryPath = componentsEntry, compile = sass.compile) {
  return exportJson(entryPath, compile)
}

// Recreates dist/ from scratch and writes the stylesheets and tokens.json into it.
async function build() {
  const { version } = JSON.parse(await readFile(`${root}package.json`, 'utf8'))
  const header = licenseHeader(version)
  const outputs = compileTargets(entry)
  const tokens = exportTokens()
  await rm(distDir, { recursive: true, force: true })
  await mkdir(distDir, { recursive: true })
  await Promise.all([
    ...Object.entries(outputs).map(([file, css]) =>
      writeFile(`${distDir}/${file}`, `${header}\n${css}\n`),
    ),
    writeFile(`${distDir}/tokens.json`, `${JSON.stringify(tokens, null, 2)}\n`),
  ])
  console.log(`Built ${[...Object.keys(outputs), 'tokens.json'].join(', ')} in dist/`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build()
