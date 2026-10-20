// Shared type definitions, imported by the other modules as `import('../shared/types.js').Name`.
// No runtime code: the file only feeds the generated `.d.ts`.

/**
 * A rectangle in viewport pixels.
 * @typedef {{ top: number, bottom: number, left: number, right: number, width: number, height: number }} Box
 */

/**
 * Anything with a `disabled` flag: combobox options, tabs, menu items.
 * @typedef {{ disabled?: boolean }} Disableable
 */

/**
 * A combobox option.
 * @typedef {{ value: string, label: string, disabled?: boolean }} ComboboxOption
 */

export {}
