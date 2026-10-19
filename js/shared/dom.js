// DOM helpers shared by the behavior modules.

let lastId = 0

/**
 * The window of `doc`, or the global one when the document has none (detached, test doubles).
 * @param {Document} doc
 */
export const windowOf = (doc) =>
  doc.defaultView ?? /** @type {Window & typeof globalThis} */ (globalThis)

/**
 * Unique id for generated elements, e.g. `ap-tabs-3`.
 * @param {string} prefix
 */
export function nextId(prefix) {
  lastId += 1
  return `${prefix}-${lastId}`
}

/**
 * Creates an element with a class and attributes in `doc`.
 * @template {keyof HTMLElementTagNameMap} T
 * @param {Document} doc
 * @param {T} tag
 * @param {string} [className]
 * @param {Record<string, string>} [attributes]
 * @returns {HTMLElementTagNameMap[T]}
 */
export function element(doc, tag, className, attributes = {}) {
  const node = doc.createElement(tag)
  if (className) node.className = className
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value)
  return node
}

/**
 * Saves the `names` attributes of `nodes` and returns a function that puts them back as they were.
 * @param {Element[]} nodes
 * @param {string[]} names
 */
export function snapshotAttributes(nodes, names) {
  const saved = nodes.map((node) =>
    names.map((name) => /** @type {[string, string | null]} */ ([name, node.getAttribute(name)])),
  )
  return () =>
    nodes.forEach((node, index) => {
      for (const [name, value] of saved[index]) {
        if (value === null) node.removeAttribute(name)
        else node.setAttribute(name, value)
      }
    })
}
