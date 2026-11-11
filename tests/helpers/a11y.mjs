// Automated accessibility helpers: runs axe-core (a dev dependency, never shipped) in a Playwright
// page against WCAG 2.2 A/AA and axe's best practices, and turns its results into readable lines.
import axe from 'axe-core'

/** axe rule tags the pages must pass: WCAG 2.0, 2.1 and 2.2 at levels A and AA, best practices. */
export const tags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
  'best-practice',
]

// Injects axe-core into `page` and runs it on the whole document; resolves to axe's results.
export async function runAxe(page) {
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(
    (values) => window.axe.run(document, { runOnly: { type: 'tag', values } }),
    tags,
  )
}

// One line per element that breaks or needs a manual check of an axe rule in `entries` (axe's
// `violations` or `incomplete`): rule id, impact, the element's selector and axe's message.
export function describeResults(entries) {
  return entries.flatMap((rule) =>
    rule.nodes.map((node) => {
      const message = node.failureSummary ?? node.any.map((check) => check.message).join('; ')
      return `${rule.id} (${rule.impact}) ${node.target.join(' ')}: ${message.replace(/\s+/g, ' ').trim()}`
    }),
  )
}
