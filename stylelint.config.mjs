// Stylelint rules that enforce the design specification (docs/design.md §7.5, §7.6, §12).
// Class naming per ITCSS layer is checked on the compiled CSS by the tests, because sources
// build class names from the configurable `$prefix`.

/** Properties that must read a design token instead of a raw value. */
const tokenOnlyProperties = [
  '/color$/',
  'fill',
  'stroke',
  'font-size',
  'font-family',
  'z-index',
  '/radius$/',
  '/^transition-duration$/',
  '/^animation-duration$/',
]

export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'at-rule-disallowed-list': ['import', 'extend'],
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-no-important': true,
    'selector-max-id': 0,
    'selector-max-specificity': '0,1,0',
    'selector-no-qualifying-type': true,
    'media-feature-name-disallowed-list': ['max-width', 'max-height'],
    'media-feature-range-notation': 'prefix',
    'selector-class-pattern': null,
    'scale-unlimited/declaration-strict-value': [
      tokenOnlyProperties,
      {
        ignoreValues: ['transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'none', '0'],
      },
    ],
  },
  overrides: [
    {
      // Settings hold the raw design-token values.
      files: ['scss/settings/**/*.scss'],
      rules: {
        'color-no-hex': null,
        'scale-unlimited/declaration-strict-value': null,
      },
    },
  ],
}
