/** Tiny helpers for building Lexical rich-text JSON in templates and seed data. */

type Node = Record<string, unknown>

const text = (value: string, format = 0): Node => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

export const p = (value: string): Node => block('paragraph', [text(value)], { textFormat: 0 })

export const h = (tag: 'h1' | 'h2' | 'h3' | 'h4', value: string): Node =>
  block('heading', [text(value)], { tag })

export const ul = (items: string[]): Node =>
  block(
    'list',
    items.map((item, i) => block('listitem', [text(item)], { value: i + 1 })),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

export const ol = (items: string[]): Node =>
  block(
    'list',
    items.map((item, i) => block('listitem', [text(item)], { value: i + 1 })),
    { listType: 'number', start: 1, tag: 'ol' },
  )

export const quote = (value: string): Node => block('quote', [text(value)])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rich = (...children: Node[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})
