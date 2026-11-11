/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Pure helpers shared by the visual builder on the server and in the browser.
 * No React and no Puck runtime imports, so this file is safe everywhere.
 */

export type PuckItem = { props: Record<string, any>; type: string }
export type PuckData = { content: PuckItem[]; root: { props: Record<string, any> }; zones?: any }

export const emptyData = (title = ''): PuckData => ({ content: [], root: { props: { title } } })

let counter = 0
export const uid = (type: string) =>
  `${type}-${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Keeps only what the site needs to render an image, so saved pages stay small. */
export const slimMedia = (m: any) =>
  m && typeof m === 'object'
    ? {
        id: m.id,
        alt: m.alt || '',
        filename: m.filename,
        height: m.height,
        mimeType: m.mimeType,
        updatedAt: m.updatedAt,
        url: m.url,
        width: m.width,
      }
    : m

/** The few post fields a post card needs. */
export const slimPost = (post: any) => ({
  categories: (post.categories || []).map((c: any) =>
    typeof c === 'object' ? { id: c.id, title: c.title } : c,
  ),
  meta: {
    description: post.meta?.description,
    image: slimMedia(post.meta?.image || post.heroImage),
    title: post.meta?.title,
  },
  slug: post.slug,
  title: post.title,
})

const isMedia = (v: any) => v && typeof v === 'object' && 'mimeType' in v && 'filename' in v && 'url' in v

/** Deep-copies a value, slimming any media documents and dropping Payload row ids. */
const clean = (value: any): any => {
  if (Array.isArray(value)) return value.map(clean)
  if (isMedia(value)) return slimMedia(value)
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [key, v] of Object.entries(value)) {
      if (key === 'id' || key === 'blockName' || key === 'blockType') continue
      out[key] = clean(v)
    }
    return out
  }
  return value
}

// ── Lexical rich text → plain text / simple HTML ─────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const textOf = (node: any): string =>
  node?.type === 'text' ? node.text || '' : (node?.children || []).map(textOf).join('')

export const lexicalToHtml = (data: any): string =>
  (data?.root?.children || [])
    .map((node: any) => {
      const text = esc(textOf(node))
      if (node.type === 'heading') return `<${node.tag}>${text}</${node.tag}>`
      if (node.type === 'quote') return `<blockquote><p>${text}</p></blockquote>`
      if (node.type === 'list') {
        const tag = node.tag === 'ol' ? 'ol' : 'ul'
        const items = (node.children || []).map((li: any) => `<li><p>${esc(textOf(li))}</p></li>`)
        return `<${tag}>${items.join('')}</${tag}>`
      }
      return text ? `<p>${text}</p>` : ''
    })
    .join('')

/** Splits rich text into a title (first heading) and body text (everything else). */
export const lexicalSplit = (data: any): { text: string; title: string } => {
  const nodes: any[] = data?.root?.children || []
  const heading = nodes.find((n) => n.type === 'heading')
  return {
    text: nodes
      .filter((n) => n !== heading)
      .map(textOf)
      .filter(Boolean)
      .join('\n\n'),
    title: heading ? textOf(heading) : '',
  }
}

export const linkHref = (link: any): string => {
  if (!link) return ''
  if (link.type === 'reference' && typeof link.reference?.value === 'object') {
    const slug = link.reference.value?.slug
    if (!slug) return ''
    if (link.reference.relationTo === 'posts') return `/posts/${slug}`
    return slug === 'home' ? '/' : `/${slug}`
  }
  return link.url || ''
}

const firstLink = (links: any) => {
  const link = links?.[0]?.link
  return { buttonLabel: link?.label || '', buttonUrl: linkHref(link) }
}

// ── Payload page (hero + layout blocks) → Puck data ──────────────────────

const item = (type: string, props: Record<string, any>): PuckItem => ({
  type,
  props: { ...clean(props), id: uid(type) },
})

/**
 * Converts a page built with Payload blocks into visual-builder data.
 * Section blocks keep the exact same props, because the builder renders the
 * same components — only the hero and the rich-text blocks need mapping.
 */
export const toPuck = (
  page: { hero?: any; layout?: any[] | null; title?: string },
  sectionTypes: string[],
): PuckData => {
  const content: PuckItem[] = []
  const hero = page.hero

  if (hero?.type === 'storefront') {
    content.push(
      item('storefrontBanner', {
        eyebrow: hero.eyebrow,
        headline: hero.headline,
        media: hero.media,
        tagline: hero.tagline,
      }),
    )
  } else if (hero?.type && hero.type !== 'none') {
    content.push(
      item('hero', {
        ...lexicalSplit(hero.richText),
        ...firstLink(hero.links),
        media: hero.media,
        variant: hero.type,
      }),
    )
  }

  for (const block of page.layout || []) {
    const type = block.blockType
    if (sectionTypes.includes(type)) content.push(item(type, block))
    else if (type === 'cta')
      content.push(item('cta', { ...lexicalSplit(block.richText), ...firstLink(block.links) }))
    else if (type === 'content')
      for (const column of block.columns || [])
        content.push(item('text', { text: lexicalToHtml(column.richText) }))
    else if (type === 'mediaBlock') content.push(item('image', { media: block.media }))
    else if (type === 'formBlock' && typeof block.form === 'object')
      content.push(item('form', { form: block.form }))
    else if (type === 'archive') content.push(item('posts', { limit: block.limit || 3 }))
  }

  return { content, root: { props: { title: page.title || '' } } }
}

/** Gives every component in a copied tree a fresh id (needed when inserting a template). */
export const reId = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(reId) as T
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [key, v] of Object.entries(value)) out[key] = reId(v)
    if (typeof out.type === 'string' && out.props && typeof out.props === 'object') {
      out.props.id = uid(out.type)
    }
    return out as T
  }
  return value
}

/** Calls `visit` for every component in the tree, including those nested in slots. */
export const walk = async (
  value: any,
  visit: (item: PuckItem) => Promise<void> | void,
): Promise<void> => {
  if (Array.isArray(value)) {
    for (const v of value) await walk(v, visit)
  } else if (value && typeof value === 'object') {
    // Children first, so anything a visit adds to an item is not walked again.
    for (const v of Object.values(value)) await walk(v, visit)
    if (typeof value.type === 'string' && value.props && typeof value.props === 'object') {
      await visit(value)
    }
  }
}

/**
 * Removes content that is looked up fresh on every render (a global section's
 * contents, the latest posts) so a saved page holds references, never copies.
 */
export const stripResolved = <T>(source: T): T => {
  const visit = (value: any): any => {
    if (Array.isArray(value)) return value.map(visit)
    if (value && typeof value === 'object') {
      const out: Record<string, any> = {}
      for (const [key, v] of Object.entries(value)) out[key] = visit(v)
      if (out.type === 'globalSection' && out.props) delete out.props.data
      if (out.type === 'posts' && out.props) out.props.posts = []
      return out
    }
    return value
  }
  return visit(source)
}

// ── Style / Advanced options shared by every element ─────────────────────

export const STYLE_KEYS = ['sBg', 'sText', 'sAlign', 'sPadTop', 'sPadBottom', 'sPadX', 'sRadius', 'sShadow']
export const ADVANCED_KEYS = ['aMarginTop', 'aMarginBottom', 'aMaxWidth', 'aId', 'aClass', 'aHide', 'aAnim']

export type FieldTab = 'advanced' | 'content' | 'style'

export const tabOf = (fieldName: string): FieldTab =>
  STYLE_KEYS.includes(fieldName) ? 'style' : ADVANCED_KEYS.includes(fieldName) ? 'advanced' : 'content'

export const shellDefaults = (margin: 'lg' | 'none' | 'sm' = 'lg') => ({
  aAnim: 'none',
  aClass: '',
  aHide: 'none',
  aId: '',
  aMarginBottom: margin,
  aMarginTop: margin,
  aMaxWidth: 'default',
  sAlign: 'default',
  sBg: '',
  sPadBottom: 'none',
  sPadTop: 'none',
  sPadX: 'none',
  sRadius: 'none',
  sShadow: 'none',
  sText: '',
})
