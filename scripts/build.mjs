// Compiles the Sass bundle into dist/: a readable and a minified stylesheet.
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))
const entry = `${root}scss/astrostyle.scss`
const distDir = `${root}dist`

/** Output files produced from the bundle entry, one per Sass output style. */
export const targets = [
  { file: 'astrostyle.css', style: 'expanded' },
  { file: 'astrostyle.min.css', style: 'compressed' },
]

// Compiles `entryPath` once per target and returns the CSS keyed by output file name.
export function compileTargets(entryPath, buildTargets = targets, compile = sass.compile) {
  return Object.fromEntries(
    buildTargets.map(({ file, style }) => [file, compile(entryPath, { style }).css]),
  )
}

// Recreates dist/ from scratch and writes every compiled target into it.
async function build() {
  const outputs = compileTargets(entry)
  await rm(distDir, { recursive: true, force: true })
  await mkdir(distDir, { recursive: true })
  await Promise.all(
    Object.entries(outputs).map(([file, css]) => writeFile(`${distDir}/${file}`, `${css}\n`)),
  )
  console.log(`Built ${Object.keys(outputs).join(', ')} in dist/`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build()
