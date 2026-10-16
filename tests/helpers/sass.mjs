// Test helpers that compile Sass sources against the package's scss/ folder.
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const scssDir = fileURLToPath(new URL('../../scss/', import.meta.url))

// Compiles an inline Sass fixture that can `@use` any module under scss/ and returns its CSS.
export function compileFixture(source) {
  return sass.compileString(source, { loadPaths: [scssDir], style: 'expanded' }).css
}

// Compiles a file under scss/ (path relative to that folder) and returns its CSS.
export function compileEntry(relativePath) {
  return sass.compile(`${scssDir}${relativePath}`, { style: 'expanded' }).css
}
