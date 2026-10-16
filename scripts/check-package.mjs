// Checks the package as npm would publish it: the file list and that Sass consumers can load it
// through the `pkg:` importer. Run after `bun run build`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))

/** Files every published version must contain. */
export const requiredFiles = [
  'package.json',
  'LICENSE',
  'README.md',
  'CHANGELOG.md',
  'scss/_index.scss',
  'scss/astrostyle.scss',
  'dist/astrostyle.css',
  'dist/astrostyle.min.css',
  'dist/tokens.json',
]

/** Path prefixes that must never be published. */
export const forbiddenPrefixes = [
  'tests/',
  'scripts/',
  'docs/',
  '.github/',
  '.changeset/',
  'node_modules/',
]

// Returns the paths `npm pack` would include, without writing a tarball.
export function packedFiles(cwd = root) {
  const [report] = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd, encoding: 'utf8' }),
  )
  return report.files.map((file) => file.path)
}

// Lists contract violations of a packed file list: missing required files and forbidden ones.
export function packageProblems(files) {
  const missing = requiredFiles
    .filter((file) => !files.includes(file))
    .map((file) => `missing ${file}`)
  const forbidden = files
    .filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)))
    .map((file) => `unexpected ${file}`)
  return [...missing, ...forbidden]
}

// Compiles `@use 'pkg:astrostyle'` from a scratch project that depends on this checkout.
export function compileAsConsumer(source = "@use 'pkg:astrostyle' as ap;\n@include ap.emit;") {
  const project = mkdtempSync(join(tmpdir(), 'astrostyle-consumer-'))
  try {
    mkdirSync(join(project, 'node_modules'))
    symlinkSync(root, join(project, 'node_modules', 'astrostyle'), 'dir')
    return sass.compileString(source, { importers: [new sass.NodePackageImporter(project)] }).css
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = packageProblems(packedFiles())
  assert.deepEqual(problems, [], `package contents:\n${problems.join('\n')}`)
  assert.match(compileAsConsumer(), /--ap-palette-black: #130d1c/)
  console.log('Package contents and pkg:astrostyle resolution are correct.')
}
