// Checks the package as npm would publish it: the file list and that Sass consumers can load it
// through the `pkg:` importer. Run after `bun run build`.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'
import { exportComponentTokens } from './build.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))

/** Split stylesheets every published version must contain, for the given component names. */
export function splitFiles(componentNames) {
  return ['core', ...componentNames.map((name) => `components/${name}`)].flatMap((path) => [
    `dist/${path}.css`,
    `dist/${path}.min.css`,
  ])
}

/** Files every published version must contain, besides the split stylesheets. */
export const requiredFiles = [
  'package.json',
  'LICENSE',
  'README.md',
  'CHANGELOG.md',
  'scss/_index.scss',
  'scss/astrostyle.scss',
  'js/index.js',
  'js/combobox/index.js',
  'js/dialog/index.js',
  'js/menu/index.js',
  'js/pagination/index.js',
  'js/tabs/index.js',
  'js/toast/index.js',
  'js/tooltip/index.js',
  'js/auto-init/index.js',
  'dist/types/index.d.ts',
  'dist/types/combobox/index.d.ts',
  'dist/types/dialog/index.d.ts',
  'dist/types/menu/index.d.ts',
  'dist/types/pagination/index.d.ts',
  'dist/types/tabs/index.d.ts',
  'dist/types/toast/index.d.ts',
  'dist/types/tooltip/index.d.ts',
  'dist/types/auto-init/index.d.ts',
  'dist/astrostyle.css',
  'dist/astrostyle.min.css',
  'dist/tokens.json',
  'dist/fonts.css',
  'fonts/README.md',
  'fonts/FeatureMono-Light.ttf',
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
export function packageProblems(files, required = requiredFiles) {
  const missing = required.filter((file) => !files.includes(file)).map((file) => `missing ${file}`)
  const forbidden = files
    .filter((file) => forbiddenPrefixes.some((prefix) => file.startsWith(prefix)))
    .map((file) => `unexpected ${file}`)
  return [...missing, ...forbidden]
}

// Runs `use(projectDir)` inside a scratch project that depends on this checkout.
function withConsumerProject(use) {
  const project = mkdtempSync(join(tmpdir(), 'astrostyle-consumer-'))
  try {
    mkdirSync(join(project, 'node_modules'))
    symlinkSync(root, join(project, 'node_modules', 'astrostyle'), 'dir')
    writeFileSync(join(project, 'package.json'), '{"name": "consumer", "private": true}')
    return use(project)
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
}

// Compiles `@use 'pkg:astrostyle'` from a scratch project that depends on this checkout.
export function compileAsConsumer(source = "@use 'pkg:astrostyle' as ap;\n@include ap.emit;") {
  return withConsumerProject(
    (project) =>
      sass.compileString(source, { importers: [new sass.NodePackageImporter(project)] }).css,
  )
}

// Resolves package subpaths (`astrostyle/css/button`) as a consumer's bundler or Node would.
export function resolveAsConsumer(specifiers) {
  return withConsumerProject((project) => {
    const require = createRequire(join(project, 'package.json'))
    return Object.fromEntries(
      specifiers.map((specifier) => [specifier, require.resolve(specifier)]),
    )
  })
}

// Type-checks a snippet that imports the public JS API the way a TypeScript consumer would.
export function typeCheckAsConsumer() {
  return withConsumerProject((project) => {
    writeFileSync(
      join(project, 'use.ts'),
      [
        "import { createTabs, pageWindow } from 'astrostyle/js'",
        "import { createDialog } from 'astrostyle/js/dialog'",
        "const tabs = createTabs(document.body, { activation: 'manual' })",
        'const index: number = tabs.getSelected()',
        'const pages: (number | string)[] = pageWindow({ page: 1, count: 5 })',
        "createDialog(document.querySelector('dialog')!, { modal: false })",
        '// @ts-expect-error the activation must be automatic or manual',
        "createTabs(document.body, { activation: 'sometimes' })",
        'export { index, pages }',
      ].join('\n'),
    )
    const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
    const args = ['--noEmit', '--strict', '--moduleResolution', 'bundler', '--module', 'esnext']
    execFileSync(process.execPath, [tsc, ...args, '--lib', 'es2022,dom', 'use.ts'], {
      cwd: project,
      encoding: 'utf8',
    })
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const components = Object.keys(exportComponentTokens())
  const problems = packageProblems(packedFiles(), [...requiredFiles, ...splitFiles(components)])
  assert.deepEqual(problems, [], `package contents:\n${problems.join('\n')}`)
  assert.match(compileAsConsumer(), /--ap-palette-black: #130d1c/)
  assert.match(
    compileAsConsumer("@use 'pkg:astrostyle/scss/fonts' with ($path: '/f');"),
    /url\("\/f\/FeatureMono-Light\.ttf"\)/,
  )
  const subpaths = [
    'astrostyle/css',
    'astrostyle/css/min',
    'astrostyle/css/core',
    'astrostyle/css/core.min',
    'astrostyle/tokens.json',
    'astrostyle/fonts.css',
    'astrostyle/fonts/FeatureMono-Light.ttf',
    'astrostyle/js',
    'astrostyle/js/combobox',
    'astrostyle/js/pagination',
    'astrostyle/js/tabs',
    'astrostyle/js/toast',
    'astrostyle/js/auto-init',
    ...components.flatMap((name) => [`astrostyle/css/${name}`, `astrostyle/css/${name}.min`]),
  ]
  for (const [specifier, file] of Object.entries(resolveAsConsumer(subpaths))) {
    assert.ok(/\/(dist|js|fonts)\//.test(file), `${specifier} resolved to ${file}`)
  }
  typeCheckAsConsumer()
  console.log(`Package contents and ${subpaths.length} entry points resolve correctly.`)
}
