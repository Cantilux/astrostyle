// DOM helpers shared by the behavior modules.

let lastId = 0

// Unique id for generated elements, e.g. `ap-tabs-3`.
export function nextId(prefix) {
  lastId += 1
  return `${prefix}-${lastId}`
}

// Creates an element with a class and attributes in `doc`.
export function element(doc, tag, className, attributes = {}) {
  const node = doc.createElement(tag)
  if (className) node.className = className
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value)
  return node
}

// Saves the `names` attributes of `nodes` and returns a function that puts them back as they were.
export function snapshotAttributes(nodes, names) {
  const saved = nodes.map((node) => names.map((name) => [name, node.getAttribute(name)]))
  return () =>
    nodes.forEach((node, index) => {
      for (const [name, value] of saved[index]) {
        if (value === null) node.removeAttribute(name)
        else node.setAttribute(name, value)
      }
    })
}
